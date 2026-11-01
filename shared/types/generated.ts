import type {
  Clan, CulturalScope, KnowledgeEntry, LocalizedText,
  Provenance, VerificationStatus, AccessTier,
} from "./index";

// The legacy glossary shape is deliberately separate from KnowledgeEntry.
export interface GlossaryEntry {
  id: string;
  term: LocalizedText[];
  gloss: string;
  accessTier: AccessTier;
  verification: VerificationStatus;
  provenance: Provenance;
  scope?: CulturalScope;
  updatedAt?: string;
}

export type ContentKind = "clan" | "knowledge" | "glossary";
export type PublicRecord =
  | { kind: "clan"; data: Clan & { accessTier: "public" }; markdown: string }
  | { kind: "knowledge"; data: KnowledgeEntry & { accessTier: "public" }; markdown: string }
  | { kind: "glossary"; data: GlossaryEntry & { accessTier: "public" }; markdown: string };

// An allowlist: no body, private contributor details, or arbitrary frontmatter.
export interface RestrictedRecord {
  kind: "restricted";
  sourceKind: ContentKind;
  id: string;
  title: LocalizedText[];
  summary: string;
  accessTier: "restricted";
  verification: VerificationStatus;
  provenance: Pick<Provenance, "sourceType" | "attribution">;
  scope?: CulturalScope;
  governanceNote?: string;
}

export type ContentRecord = PublicRecord | RestrictedRecord;

export interface IndexedChunk {
  entryId: string;
  chunkId: string;
  heading?: string;
  title: string;
  text: string;
  tags: string[];
  kind: ContentKind;
  accessTier: "public";
  verification: VerificationStatus;
  attribution: string;
}

export interface GeneratedIndex {
  schemaVersion: 1;
  records: ContentRecord[];
  chunks: IndexedChunk[];
}

export type InterfaceCopy = Record<string, string>;
