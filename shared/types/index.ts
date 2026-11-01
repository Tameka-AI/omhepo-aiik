// Omhepo AIIK — Shared Types
// AIIK means: Ancestral Intelligence Indigenous Knowledge
// Adopted from docs/04-claude-review.md §1.3 with dialect extension from seed-clans-v2.ts

export type Language = "en" | "kwn" | "ndo" | "ng";

export interface LocalizedText {
  lang: Language;
  text: string;
  dialect?: "Oshikwanyama" | "Oshindonga" | "Oshimbalantu" | "Oshikwambi" | "Oshingandjera" | "unknown";
  orthographyNote?: string;
  transliteration?: string;
}

export type AccessTier = "public" | "community" | "restricted" | "private";

export type VerificationStatus = "draft" | "owner-reviewed" | "elder-verified" | "disputed";

export type SourceType =
  | "oral-elder"
  | "family-notes"
  | "personal-practice"
  | "published"
  | "community-contrib"
  | "ai-synthesis";

export interface Provenance {
  sourceType: SourceType;
  attribution: string;
  contributor?: string;
  consent: "not-required" | "pending" | "granted" | "declined";
  consentNote?: string;
  citations?: string[];
  collectedAt?: string;
  reviewedBy?: string[];
}

export interface CulturalScope {
  origin: { ethnicGroup: string; region?: string; lineage?: string };
  appliesTo: string[];
  crossCultural?: boolean;
}

export type KnowledgeCategory =
  | "proverb"
  | "story"
  | "ritual-principle"
  | "practice"
  | "food-wellbeing"
  | "medicine"
  | "lineage-history"
  | "cosmology"
  | "glossary";

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  title: LocalizedText[];
  summary: string;
  body?: LocalizedText[];
  literalTranslation?: LocalizedText[];  // optional, for three-field proverb structure
  accessTier: AccessTier;
  verification: VerificationStatus;
  provenance: Provenance;
  scope: CulturalScope;
  clanIds?: string[];
  relatedIds?: string[];
  tags?: string[];
  governanceNote?: string;
  glossaryIds?: string[];
  updatedAt: string;
}

export interface TotemEmblem {
  kind: "animal" | "plant" | "object" | "element" | "other";
  name: LocalizedText[];
  symbolism: string[];
  observances?: string[];
}

export interface Clan {
  id: string;
  names: LocalizedText[];
  emblem: TotemEmblem;
  descent: "matrilineal" | "patrilineal" | "both" | "unknown";
  scope: CulturalScope;
  description: string;
  dailyIntegration: string[];
  praiseNames?: LocalizedText[];
  relatedKnowledgeIds: string[];
  accessTier: AccessTier;
  verification: VerificationStatus;
  provenance: Provenance;
  note?: string;
}
