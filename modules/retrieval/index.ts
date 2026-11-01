import type { GeneratedIndex, IndexedChunk, PublicRecord } from "../../shared/types/generated";
import type { RetrievedChunk, SourceReference } from "../../shared/types/chat";

export interface RetrievalPolicy { stopWords: string[]; prefixes: string[] }
export type RankedChunk = IndexedChunk & RetrievedChunk;

export function normalizeText(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}

function tokens(value: string): string[] {
  return normalizeText(value).match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function significantTerms(value: string, policy: RetrievalPolicy): string[] {
  const stopped = new Set(policy.stopWords);
  return [...new Set(tokens(value).filter((term) => term.length > 1 && !stopped.has(term)))];
}

function sameTerm(query: string, word: string, prefixes: string[]): boolean {
  if (query === word) return true;
  if (query.length > 3 && (query + "s" === word || word + "s" === query)) return true;
  if (query.length < 4 || !word.endsWith(query)) return false;
  return prefixes.includes(word.slice(0, word.length - query.length));
}

export function publicRecords(index: GeneratedIndex): Map<string, PublicRecord> {
  return new Map(index.records.flatMap((record) =>
    record.kind !== "restricted" && record.data.accessTier === "public"
      && ["not-required", "granted"].includes(record.data.provenance.consent)
      ? [[record.data.id, record] as const] : []));
}

export function sourceReference(record: PublicRecord): SourceReference {
  const title = record.kind === "clan" ? record.data.names
    : record.kind === "knowledge" ? record.data.title : record.data.term;
  const ordered = [...title.filter((item) => item.lang !== "en"), ...title.filter((item) => item.lang === "en")];
  return {
    entryId: record.data.id,
    title: ordered.map((item) => item.text).join(" · "),
    verification: record.data.verification,
    attribution: record.data.provenance.attribution,
    sourceType: record.data.provenance.sourceType,
    href: record.kind === "clan" ? `/clans/${record.data.id}`
      : record.kind === "knowledge" ? `/library/${record.data.id}` : `/glossary#${record.data.id}`,
    ...(record.data.scope ? { scope: record.data.scope } : {}),
  };
}

export function retrievePublic(
  index: GeneratedIndex,
  query: string,
  options: { policy: RetrievalPolicy; limit?: number; strict?: boolean },
): RankedChunk[] {
  const { policy, strict = true } = options;
  const terms = significantTerms(query, policy);
  if (!terms.length) return [];
  const allowed = publicRecords(index);
  const ranked: RankedChunk[] = [];
  for (const chunk of index.chunks) {
    const record = allowed.get(chunk.entryId);
    if (!record || chunk.accessTier !== "public" || chunk.kind !== record.kind
      || chunk.verification !== record.data.verification
      || chunk.attribution !== record.data.provenance.attribution) continue;
    const category = record.kind === "knowledge" ? record.data.category : record.kind;
    const words = tokens([chunk.title, chunk.text, category, ...chunk.tags].join(" "));
    const titleWords = tokens(chunk.title);
    const matched = terms.filter((term) => words.some((word) => sameTerm(term, word, policy.prefixes)));
    const coverage = matched.length / terms.length;
    if (!matched.length || (strict && coverage < 0.8)) continue;
    const titleHits = matched.filter((term) => titleWords.some((word) => sameTerm(term, word, policy.prefixes))).length;
    const score = coverage * 10 + titleHits * 3 + matched.length;
    ranked.push({ ...chunk, score });
  }
  ranked.sort((a, b) => b.score - a.score || a.entryId.localeCompare(b.entryId) || a.chunkId.localeCompare(b.chunkId));
  const seen = new Set<string>();
  return ranked.filter((chunk) => {
    if (seen.has(chunk.entryId)) return false;
    seen.add(chunk.entryId);
    return true;
  }).slice(0, Math.max(1, Math.min(options.limit ?? 3, 50)));
}
