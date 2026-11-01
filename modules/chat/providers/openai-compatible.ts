import { ProviderSelectionSchema } from "../../../shared/schemas/chat";
import type { ChatPrompts } from "../../../shared/types/chat";
import type { RankedChunk } from "../../retrieval";

export interface ProviderEnvironment {
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  LLM_API_KEY?: string;
}

export type ProviderSelection = { chunkId: string; quote: string };
export class ProviderUnavailable extends Error {}
export class InvalidProviderOutput extends Error {}

async function boundedBody(response: Response, maxBytes: number): Promise<string> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw new InvalidProviderOutput("Response limit exceeded");
  if (!response.body) throw new InvalidProviderOutput("Missing response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let value = "";
  try {
    while (true) {
      const piece = await reader.read();
      if (piece.done) break;
      received += piece.value.byteLength;
      if (received > maxBytes) throw new InvalidProviderOutput("Response limit exceeded");
      value += decoder.decode(piece.value, { stream: true });
    }
    return value + decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

export function validateSelections(raw: unknown, chunks: RankedChunk[]): ProviderSelection[] {
  const parsed = ProviderSelectionSchema.safeParse(raw);
  if (!parsed.success) throw new InvalidProviderOutput("Invalid selection structure");
  const available = new Map(chunks.map((chunk) => [chunk.chunkId, chunk]));
  const seen = new Set<string>();
  for (const selection of parsed.data.selections) {
    const chunk = available.get(selection.chunkId);
    if (!chunk || chunk.accessTier !== "public" || seen.has(selection.chunkId)
      || !selection.quote.trim() || !chunk.text.includes(selection.quote)) {
      throw new InvalidProviderOutput("Unverifiable source selection");
    }
    // The provider cannot insert citation syntax, alter an original quotation, or
    // claim support from a chunk outside this request's public retrieval result.
    if (/\[source:/i.test(selection.quote)) throw new InvalidProviderOutput("Invalid source-marker placement");
    seen.add(selection.chunkId);
  }
  return parsed.data.selections;
}

export async function selectWithProvider(args: {
  message: string;
  chunks: RankedChunk[];
  prompts: ChatPrompts;
  environment: ProviderEnvironment;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<ProviderSelection[]> {
  const { environment } = args;
  if (!environment.LLM_BASE_URL || !environment.LLM_MODEL) throw new ProviderUnavailable("Provider is not configured");
  let endpoint: URL;
  try {
    endpoint = new URL(`${environment.LLM_BASE_URL.replace(/\/+$/, "")}/chat/completions`);
    if (!["http:", "https:"].includes(endpoint.protocol) || endpoint.username || endpoint.password) throw new Error();
  } catch { throw new ProviderUnavailable("Invalid provider configuration"); }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const task = async () => {
    const response = await (args.fetchImpl ?? fetch)(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(environment.LLM_API_KEY ? { Authorization: `Bearer ${environment.LLM_API_KEY}` } : {}),
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: environment.LLM_MODEL,
        temperature: 0,
        max_tokens: 1400,
        stream: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: [args.prompts.system, args.prompts.culturalSafety, args.prompts.contract].join("\n\n") },
          { role: "user", content: JSON.stringify({ query: args.message, retrieved_chunks: args.chunks }) },
        ],
      }),
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new ProviderUnavailable(`Provider returned HTTP ${response.status}`);
    }
    const body = await boundedBody(response, 48 * 1024);
    let envelope: unknown;
    try { envelope = JSON.parse(body); } catch { throw new InvalidProviderOutput("Invalid provider JSON"); }
    const content = (envelope as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length > 20000) throw new InvalidProviderOutput("Missing provider selection");
    let selection: unknown;
    try { selection = JSON.parse(content); } catch { throw new InvalidProviderOutput("Invalid selection JSON"); }
    return validateSelections(selection, args.chunks);
  };
  try {
    return await Promise.race([
      task(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new ProviderUnavailable("Provider timeout")); }, args.timeoutMs ?? 12000);
      }),
    ]);
  } catch (error) {
    if (error instanceof InvalidProviderOutput || error instanceof ProviderUnavailable) throw error;
    throw new ProviderUnavailable("Provider request failed");
  } finally {
    if (timer) clearTimeout(timer);
    controller.abort();
  }
}
