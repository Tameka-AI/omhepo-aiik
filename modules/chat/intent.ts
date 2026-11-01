import type { QueryIntent } from "../../shared/types/chat";
import type { IntentRules } from "../../shared/schemas/chat";
import type { RefusalKey, RefusalTemplate } from "../governance/refusals";

export function normalizeQuery(text: string): string {
  return text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function classifyIntent(
  message: string,
  rules: IntentRules,
  refusals: Record<RefusalKey, RefusalTemplate>,
): QueryIntent {
  const query = normalizeQuery(message);
  for (const key of ["medical", "ritual-howto", "lineage-personal"] as const) {
    if (refusals[key].triggerExamples.some((example) => normalizeQuery(example) === query)) return key;
  }
  for (const rule of rules.rules) {
    if (rule.patterns.some((pattern) => new RegExp(pattern, "iu").test(query))) return rule.intent;
  }
  return "knowledge";
}
