import { z } from "zod";

// Refinement checks whitespace without rewriting reviewed source text.
const text = z.string().refine((value) => value.trim().length > 0, "Must not be blank");
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Expected a stable lowercase slug");
const date = z.iso.date();
const texts = z.array(text);

export const AccessTierSchema = z.enum(["public", "community", "restricted", "private"]);
export const VerificationSchema = z.enum(["draft", "owner-reviewed", "elder-verified", "disputed"]);
export const SourceTypeSchema = z.enum([
  "oral-elder", "family-notes", "personal-practice", "published", "community-contrib", "ai-synthesis",
]);
export const LocalizedTextSchema = z.strictObject({
  lang: z.enum(["en", "kwn", "ndo", "ng"]),
  text,
  dialect: z.enum([
    "Oshikwanyama", "Oshindonga", "Oshimbalantu", "Oshikwambi", "Oshingandjera", "unknown",
  ]).optional(),
  orthographyNote: text.optional(),
  transliteration: text.optional(),
});
const localized = z.array(LocalizedTextSchema).min(1);

export const ProvenanceSchema = z.strictObject({
  sourceType: SourceTypeSchema,
  attribution: text,
  contributor: text.optional(),
  consent: z.enum(["not-required", "pending", "granted", "declined"]),
  consentNote: text.optional(),
  citations: texts.optional(),
  collectedAt: date.optional(),
  reviewedBy: texts.optional(),
});
export const CulturalScopeSchema = z.strictObject({
  origin: z.strictObject({ ethnicGroup: text, region: text.optional(), lineage: text.optional() }),
  appliesTo: texts.min(1),
  crossCultural: z.boolean().optional(),
});
const governed = {
  id: slug,
  accessTier: AccessTierSchema,
  verification: VerificationSchema,
  provenance: ProvenanceSchema,
};

export const TotemEmblemSchema = z.strictObject({
  kind: z.enum(["animal", "plant", "object", "element", "other"]),
  name: localized,
  symbolism: texts,
  observances: texts.optional(),
});
export const ClanFrontmatterSchema = z.strictObject({
  ...governed,
  names: localized,
  emblem: TotemEmblemSchema,
  descent: z.enum(["matrilineal", "patrilineal", "both", "unknown"]),
  scope: CulturalScopeSchema,
  description: text,
  dailyIntegration: texts,
  praiseNames: localized.optional(),
  relatedKnowledgeIds: z.array(slug),
  note: text.optional(),
});
export const KnowledgeFrontmatterSchema = z.strictObject({
  ...governed,
  category: z.enum([
    "proverb", "story", "ritual-principle", "practice", "food-wellbeing", "medicine",
    "lineage-history", "cosmology", "glossary",
  ]),
  title: localized,
  summary: text,
  body: localized.optional(),
  literalTranslation: localized.optional(),
  scope: CulturalScopeSchema,
  clanIds: z.array(slug).optional(),
  relatedIds: z.array(slug).optional(),
  tags: texts.optional(),
  governanceNote: text.optional(),
  glossaryIds: z.array(slug).optional(),
  updatedAt: date,
});
export const GlossaryFrontmatterSchema = z.strictObject({
  ...governed,
  term: localized,
  gloss: text,
  // Existing reviewed glossary records omit these. Never invent their origin/date.
  scope: CulturalScopeSchema.optional(),
  updatedAt: date.optional(),
});

// Interface prose stays in Markdown too; it is never cultural retrieval material.
export const InterfaceFrontmatterSchema = z.strictObject({
  ...governed,
  accessTier: z.literal("public"),
  verification: z.literal("draft"),
  scope: CulturalScopeSchema,
  copy: z.record(text, text),
});

export const FrontmatterSchemas = {
  clans: ClanFrontmatterSchema,
  knowledge: KnowledgeFrontmatterSchema,
  glossary: GlossaryFrontmatterSchema,
  interface: InterfaceFrontmatterSchema,
} as const;
