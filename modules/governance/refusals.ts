import { parseDocument } from "yaml";
import { IntentRulesSchema, type IntentRules } from "../../shared/schemas/chat";
import type { QueryIntent } from "../../shared/types/chat";

export type RefusalKey = "ritual-howto" | "medical" | "lineage-personal" | "not-in-library";
export interface RefusalTemplate {
  intent: RefusalKey;
  text: string;
  safetyNotice: string;
  redirectEntryIds: string[];
  triggerExamples: string[];
}

const requiredKeys: RefusalKey[] = ["ritual-howto", "medical", "lineage-personal", "not-in-library"];

export function parseRefusals(markdown: string): Record<RefusalKey, RefusalTemplate> {
  const result = {} as Record<RefusalKey, RefusalTemplate>;
  for (const match of markdown.matchAll(/^## intent: ([\w-]+)\s*\n([\s\S]*?)(?=^## intent: |$(?![\s\S]))/gm)) {
    const intent = match[1] as RefusalKey;
    if (!requiredKeys.includes(intent)) continue;
    const section = match[2];
    const safetyNotice = section.match(/\*\*safetyNotice:\*\*\s*"([^"\n]+)"/)?.[1];
    const redirectSource = section.match(/\*\*redirectEntryIds:\*\*\s*(\[[^\n]+\])/ )?.[1];
    const text = section.split(/^### Response Text\s*$/m)[1]?.replace(/\n---\s*$/, "").trim();
    if (!safetyNotice || !redirectSource || !text || result[intent]) {
      throw new Error(`Invalid refusal template: ${intent}`);
    }
    const parsed: unknown = JSON.parse(redirectSource);
    if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string" && /^[a-z0-9-]+$/.test(id))) {
      throw new Error(`Invalid refusal redirects: ${intent}`);
    }
    const examplesLine = section.match(/\*\*Trigger examples:\*\*([^\n]*)/)?.[1] ?? "";
    result[intent] = {
      intent, text, safetyNotice, redirectEntryIds: parsed,
      triggerExamples: [...examplesLine.matchAll(/"([^"\n]+)"/g)].map((example) => example[1]),
    };
  }
  for (const key of requiredKeys) if (!result[key]) throw new Error(`Missing refusal template: ${key}`);
  return result;
}

export function parseIntentRules(markdown: string): IntentRules {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("Missing intent-rule frontmatter");
  const document = parseDocument(match[1], { uniqueKeys: true, schema: "core" });
  if (document.errors.length) throw new Error("Invalid intent-rule YAML");
  const rules = IntentRulesSchema.parse(document.toJS());
  for (const rule of rules.rules) for (const pattern of rule.patterns) new RegExp(pattern, "iu");
  return rules;
}

export function refusalKey(intent: QueryIntent): RefusalKey {
  return intent === "medical" || intent === "ritual-howto" || intent === "lineage-personal"
    ? intent : "not-in-library";
}
