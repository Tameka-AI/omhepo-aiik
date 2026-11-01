import { z } from "zod";

export const ChatRequestSchema = z.strictObject({
  message: z.string().trim().min(1).max(2000),
});

export const ProviderSelectionSchema = z.strictObject({
  selections: z.array(z.strictObject({
    chunkId: z.string().min(1).max(200),
    quote: z.string().min(1).max(4000),
  })).max(3),
});

export const IntentRulesSchema = z.strictObject({
  version: z.literal(1),
  rules: z.array(z.strictObject({
    intent: z.enum(["medical", "ritual-howto", "lineage-personal", "smalltalk", "out-of-scope"]),
    patterns: z.array(z.string().min(1)).min(1),
  })).min(1),
  stopWords: z.array(z.string()),
  prefixes: z.array(z.string().min(1)),
});

export type IntentRules = z.infer<typeof IntentRulesSchema>;
