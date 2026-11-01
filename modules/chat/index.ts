import type { GeneratedIndex, InterfaceCopy } from "../../shared/types/generated";
import type { ChatPrompts, GroundedChatResponse, QueryIntent } from "../../shared/types/chat";
import { ChatRequestSchema } from "../../shared/schemas/chat";
import { parseIntentRules, parseRefusals, refusalKey } from "../governance/refusals";
import { publicRecords, retrievePublic, sourceReference } from "../retrieval";
import { classifyIntent } from "./intent";
import {
  InvalidProviderOutput, selectWithProvider,
  type ProviderEnvironment, type ProviderSelection,
} from "./providers/openai-compatible";

export async function answerChat(args: {
  message: string;
  index: GeneratedIndex;
  prompts: ChatPrompts;
  copy: InterfaceCopy;
  environment?: ProviderEnvironment;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<GroundedChatResponse> {
  const { message } = ChatRequestSchema.parse({ message: args.message });
  const { index, prompts, copy, environment = {} } = args;
  const templates = parseRefusals(prompts.refusals);
  const rules = parseIntentRules(prompts.intentRules);
  const intent = classifyIntent(message, rules, templates);
  const records = publicRecords(index);

  const unavailable = (queryIntent: QueryIntent, mode: "refusal" | "unavailable" = "unavailable"): GroundedChatResponse => {
    const template = templates[refusalKey(queryIntent)];
    return {
      // Keep the fixed no-source phrase exact, as required by system.md.
      text: mode === "unavailable" ? template.text.split(/\n\s*\n/)[0].trim() : template.text,
      intent: queryIntent,
      grounded: false,
      citations: [],
      excerpts: [],
      redirects: template.redirectEntryIds.flatMap((id) => {
        const record = records.get(id);
        return record ? [sourceReference(record)] : [];
      }),
      safetyNotice: template.safetyNotice,
      mode,
    };
  };

  if (intent !== "knowledge") {
    return unavailable(intent, intent === "medical" || intent === "ritual-howto" || intent === "lineage-personal" ? "refusal" : "unavailable");
  }
  const chunks = retrievePublic(index, message, { policy: rules, limit: 3 });
  if (!chunks.length) return unavailable(intent);
  let mode: GroundedChatResponse["mode"] = "simulated";
  let selections: ProviderSelection[] = chunks.map((chunk) => ({ chunkId: chunk.chunkId, quote: chunk.text }));
  if (environment.LLM_BASE_URL) {
    try {
      selections = await selectWithProvider({ message, chunks, prompts, environment, fetchImpl: args.fetchImpl, timeoutMs: args.timeoutMs });
      mode = "provider";
    } catch (error) {
      if (error instanceof InvalidProviderOutput) return unavailable(intent);
      mode = "simulated-fallback";
    }
  }
  if (!selections.length) return unavailable(intent);
  const excerpts = selections.flatMap((selection) => {
    const chunk = chunks.find((candidate) => candidate.chunkId === selection.chunkId);
    const record = chunk && records.get(chunk.entryId);
    if (!chunk || !record || !chunk.text.includes(selection.quote)) return [];
    return [{ ...sourceReference(record), chunkId: chunk.chunkId, quote: selection.quote }];
  });
  if (excerpts.length !== selections.length) return unavailable(intent);
  const citations = [...new Map(excerpts.map(({ chunkId: _chunk, quote: _quote, ...reference }) => [reference.entryId, reference])).values()];
  const text = excerpts.map((excerpt) => {
    const status = copy[`verification.${excerpt.verification}`] ?? excerpt.verification;
    return `${excerpt.quote}\n\n[${status}] [source: ${excerpt.entryId} | ${excerpt.attribution} | ${excerpt.verification}]`;
  }).join("\n\n---\n\n");
  const modeKey = mode === "provider" ? "chat.provider" : mode === "simulated-fallback" ? "chat.providerFallback" : "chat.simulated";
  return {
    text, citations, excerpts, redirects: [], grounded: true, intent, mode,
    ...(copy[modeKey] ? { modeNotice: copy[modeKey] } : {}),
  };
}
