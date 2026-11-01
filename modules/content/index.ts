import sourceIndex from "@/data/generated/index.json";
import interfaceCopy from "@/data/generated/interface.json";
import promptBundle from "@/data/generated/prompts.json";
import {
  ClanFrontmatterSchema, CulturalScopeSchema, GlossaryFrontmatterSchema,
  KnowledgeFrontmatterSchema, LocalizedTextSchema, SourceTypeSchema, VerificationSchema,
} from "@/shared/schemas";
import type { CulturalScope, LocalizedText, Provenance, VerificationStatus } from "@/shared/types";
import type {
  ContentKind, ContentRecord, GeneratedIndex, IndexedChunk, PublicRecord, RestrictedRecord,
} from "@/shared/types/generated";

export interface RuntimePrompts {
  system: string;
  culturalSafety: string;
  refusals: string;
  contract: string;
  intentRules: string;
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function contentKind(value: unknown): value is ContentKind {
  return value === "clan" || value === "knowledge" || value === "glossary";
}

// Reconstruct an allowlisted summary even if generated JSON has been tampered with.
// Never spread a restricted record: bodies and arbitrary metadata must not survive.
function restrictedRecord(raw: Record<string, unknown>): RestrictedRecord | undefined {
  if (raw.accessTier !== "restricted" || !contentKind(raw.sourceKind)
      || !nonblank(raw.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.id)
      || !nonblank(raw.summary) || !Array.isArray(raw.title) || raw.title.length === 0
      || !object(raw.provenance) || !nonblank(raw.provenance.attribution)) return;
  const verification = VerificationSchema.safeParse(raw.verification);
  const sourceType = SourceTypeSchema.safeParse(raw.provenance.sourceType);
  if (!verification.success || !sourceType.success) return;
  const title: LocalizedText[] = [];
  for (const item of raw.title) {
    const parsed = LocalizedTextSchema.safeParse(item);
    if (!parsed.success) return;
    title.push({ lang: parsed.data.lang, text: parsed.data.text });
  }
  let scope: CulturalScope | undefined;
  if (raw.scope !== undefined) {
    const parsed = CulturalScopeSchema.safeParse(raw.scope);
    if (!parsed.success) return;
    scope = parsed.data;
  }
  return {
    kind: "restricted",
    sourceKind: raw.sourceKind,
    id: raw.id,
    title,
    summary: raw.summary,
    accessTier: "restricted",
    verification: verification.data,
    provenance: { sourceType: sourceType.data, attribution: raw.provenance.attribution },
    ...(scope ? { scope } : {}),
    ...(nonblank(raw.governanceNote) ? { governanceNote: raw.governanceNote } : {}),
  };
}

function allowedRecord(raw: unknown): ContentRecord | undefined {
  if (!object(raw)) return;
  if (raw.kind === "restricted") return restrictedRecord(raw);
  if (!contentKind(raw.kind) || !object(raw.data) || raw.data.accessTier !== "public"
      || typeof raw.markdown !== "string" || !object(raw.data.provenance)
      || !["not-required", "granted"].includes(String(raw.data.provenance.consent))) return;
  if (raw.kind === "clan") {
    const parsed = ClanFrontmatterSchema.safeParse(raw.data);
    if (parsed.success && parsed.data.accessTier === "public") {
      return { kind: "clan", data: { ...parsed.data, accessTier: "public" }, markdown: raw.markdown };
    }
  } else if (raw.kind === "knowledge") {
    const parsed = KnowledgeFrontmatterSchema.safeParse(raw.data);
    if (parsed.success && parsed.data.accessTier === "public" && parsed.data.category !== "medicine") {
      return { kind: "knowledge", data: { ...parsed.data, accessTier: "public" }, markdown: raw.markdown };
    }
  } else {
    const parsed = GlossaryFrontmatterSchema.safeParse(raw.data);
    if (parsed.success && parsed.data.accessTier === "public") {
      return { kind: "glossary", data: { ...parsed.data, accessTier: "public" }, markdown: raw.markdown };
    }
  }
}

function allowedChunk(raw: unknown, records: Map<string, PublicRecord>): IndexedChunk | undefined {
  if (!object(raw) || raw.accessTier !== "public" || !nonblank(raw.entryId)
      || !nonblank(raw.chunkId) || !raw.chunkId.startsWith(`${raw.entryId}:`)
      || !nonblank(raw.title) || !nonblank(raw.text) || !Array.isArray(raw.tags)
      || !raw.tags.every((tag): tag is string => typeof tag === "string")) return;
  const record = records.get(raw.entryId);
  if (!record || raw.kind !== record.kind
      || raw.verification !== record.data.verification
      || raw.attribution !== record.data.provenance.attribution) return;
  return {
    entryId: raw.entryId,
    chunkId: raw.chunkId,
    title: raw.title,
    text: raw.text,
    tags: raw.tags,
    kind: record.kind,
    accessTier: "public",
    verification: record.data.verification,
    attribution: record.data.provenance.attribution,
    ...(nonblank(raw.heading) ? { heading: raw.heading } : {}),
  };
}

export function getIndex(): GeneratedIndex {
  const raw: unknown = sourceIndex;
  if (!object(raw) || raw.schemaVersion !== 1 || !Array.isArray(raw.records)
      || !Array.isArray(raw.chunks)) throw new Error("Invalid generated content index; rebuild content.");
  const records = raw.records.map(allowedRecord).filter((record): record is ContentRecord => !!record);
  const publicRecords = new Map<string, PublicRecord>();
  for (const record of records) {
    if (record.kind !== "restricted" && record.data.accessTier === "public") {
      publicRecords.set(record.data.id, record);
    }
  }
  const chunks = raw.chunks.map((chunk) => allowedChunk(chunk, publicRecords))
    .filter((chunk): chunk is IndexedChunk => !!chunk);
  return { schemaVersion: 1, records, chunks };
}

export function getRecords(): ContentRecord[] {
  return getIndex().records;
}

export function getRecord(id: string): ContentRecord | undefined {
  return getRecords().find((record) => recordId(record) === id);
}

export function getClans(): Extract<PublicRecord, { kind: "clan" }>[] {
  return getRecords().filter((record): record is Extract<PublicRecord, { kind: "clan" }> =>
    record.kind === "clan" && record.data.accessTier === "public");
}

export function getKnowledge(): (Extract<PublicRecord, { kind: "knowledge" }> | RestrictedRecord)[] {
  return getRecords().filter((record): record is Extract<PublicRecord, { kind: "knowledge" }> | RestrictedRecord =>
    (record.kind === "knowledge" && record.data.accessTier === "public")
    || (record.kind === "restricted" && record.sourceKind === "knowledge"));
}

export function getGlossary(): Extract<PublicRecord, { kind: "glossary" }>[] {
  return getRecords().filter((record): record is Extract<PublicRecord, { kind: "glossary" }> =>
    record.kind === "glossary" && record.data.accessTier === "public");
}

export function recordId(record: ContentRecord): string {
  return record.kind === "restricted" ? record.id : record.data.id;
}

export function recordTitle(record: ContentRecord): LocalizedText[] {
  const title = record.kind === "restricted" ? record.title
    : record.kind === "clan" ? record.data.names
    : record.kind === "knowledge" ? record.data.title : record.data.term;
  // Stable ordering preserves every attested variant without choosing a canonical spelling.
  return [...title].sort((a, b) => Number(a.lang === "en") - Number(b.lang === "en"));
}

export function recordSummary(record: ContentRecord): string {
  return record.kind === "restricted" ? record.summary
    : record.kind === "clan" ? record.data.description
    : record.kind === "knowledge" ? record.data.summary : record.data.gloss;
}

export function recordVerification(record: ContentRecord): VerificationStatus {
  return record.kind === "restricted" ? record.verification : record.data.verification;
}

export function recordProvenance(record: ContentRecord): Provenance | RestrictedRecord["provenance"] {
  return record.kind === "restricted" ? record.provenance : record.data.provenance;
}

export function recordScope(record: ContentRecord): CulturalScope | undefined {
  return record.kind === "restricted" ? record.scope : record.data.scope;
}

export function recordHref(record: ContentRecord): string {
  const kind = record.kind === "restricted" ? record.sourceKind : record.kind;
  const id = encodeURIComponent(recordId(record));
  return kind === "clan" ? `/clans/${id}` : kind === "glossary" ? `/glossary#${id}` : `/library/${id}`;
}

export function getCopy(): Record<string, string> {
  return Object.fromEntries(Object.entries(interfaceCopy).filter((entry): entry is [string, string] =>
    typeof entry[1] === "string"));
}

export function getPrompts(): RuntimePrompts {
  const raw: unknown = promptBundle;
  if (!object(raw) || !nonblank(raw.system) || !nonblank(raw.culturalSafety)
      || !nonblank(raw.refusals) || !nonblank(raw.contract) || !nonblank(raw.intentRules)) {
    throw new Error("Generated prompt bundle is incomplete; rebuild runtime content.");
  }
  return {
    system: raw.system,
    culturalSafety: raw.culturalSafety,
    refusals: raw.refusals,
    contract: raw.contract,
    intentRules: raw.intentRules,
  };
}
