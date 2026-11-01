import { answerChat } from "@/modules/chat";
import { getCopy, getIndex, getPrompts } from "@/modules/content";
import { ChatRequestSchema } from "@/shared/schemas/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;
const MAX_REQUEST_BYTES = 16_384;
const headers = { "Cache-Control": "no-store, max-age=0" };

function errorResponse(status: number, key: string) {
  return Response.json({ error: getCopy()[key] ?? key }, { status, headers });
}

async function boundedRequest(request: Request): Promise<string> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) throw new RangeError();
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let value = "";
  try {
    while (true) {
      const { value: chunk, done } = await reader.read();
      if (done) break;
      bytes += chunk.byteLength;
      if (bytes > MAX_REQUEST_BYTES) throw new RangeError();
      value += decoder.decode(chunk, { stream: true });
    }
    return value + decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site"
      || (origin !== null && origin !== new URL(request.url).origin)) {
    return errorResponse(403, "errors.invalidRequest");
  }
  if (request.headers.get("content-type")?.split(";", 1)[0].trim() !== "application/json") {
    return errorResponse(415, "errors.invalidRequest");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(await boundedRequest(request));
  } catch (error) {
    return errorResponse(error instanceof RangeError ? 413 : 400,
      error instanceof RangeError ? "errors.tooLarge" : "errors.invalidRequest");
  }
  const parsed = ChatRequestSchema.safeParse(raw);
  if (!parsed.success) return errorResponse(400, "errors.invalidRequest");
  try {
    const result = await answerChat({
      message: parsed.data.message,
      index: getIndex(),
      prompts: getPrompts(),
      copy: getCopy(),
      environment: {
        LLM_BASE_URL: process.env.LLM_BASE_URL,
        LLM_MODEL: process.env.LLM_MODEL,
        LLM_API_KEY: process.env.LLM_API_KEY,
      },
    });
    return Response.json(result, { headers });
  } catch {
    // Never log questions, identity data, provider responses, or credentials.
    return errorResponse(503, "errors.unavailable");
  }
}
