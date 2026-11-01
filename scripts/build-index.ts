import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseDocument } from "yaml";
import { FrontmatterSchemas } from "../shared/schemas/index";
import type { Clan, KnowledgeEntry, LocalizedText } from "../shared/types/index";
import type {
  ContentKind, GeneratedIndex, GlossaryEntry, IndexedChunk, PublicRecord, RestrictedRecord,
} from "../shared/types/generated";

type SourceRecord =
  | { kind: "clan"; data: Clan; markdown: string }
  | { kind: "knowledge"; data: KnowledgeEntry; markdown: string }
  | { kind: "glossary"; data: GlossaryEntry; markdown: string };

export function parseMarkdown(source: string): { data: unknown; markdown: string } {
  const match = source.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("Missing YAML frontmatter");
  const document = parseDocument(match[1], { schema: "core", uniqueKeys: true });
  if (document.errors.length) throw new Error(`Invalid YAML: ${document.errors[0].message}`);
  return {
    data: document.toJS({ maxAliasCount: 0 }),
    markdown: source.replace(/^\uFEFF/, "").slice(match[0].length).trim(),
  };
}

async function markdownFiles(directory: string): Promise<string[]> {
  const output: string[] = [];
  for (const file of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, file.name);
    if (file.isSymbolicLink()) throw new Error(`Symlinks are not content sources: ${file.name}`);
    if (file.isDirectory()) output.push(...await markdownFiles(absolute));
    else if (file.isFile() && file.name.endsWith(".md")) output.push(absolute);
  }
  return output.sort();
}

// Approximately 150–400 tokens per full chunk; small source entries stay small.
// Headings are retained, oversized paragraphs split, and one short sentence overlaps.
export function chunkMarkdown(markdown: string): { heading?: string; text: string }[] {
  const result: { heading?: string; text: string }[] = [];
  let heading: string | undefined;
  let lines: string[] = [];
  function flush() {
    const words = lines.join("\n").trim().split(/\s+/).filter(Boolean);
    let start = 0;
    while (start < words.length) {
      let end = start;
      let characters = 0;
      while (end < words.length && end - start < 240 && characters + words[end].length < 1600) {
        characters += words[end].length + 1;
        end++;
      }
      if (end === start) {
        // Malformed enormous tokens cannot bypass the chunk bound.
        for (let offset = 0; offset < words[start].length; offset += 1600) {
          result.push({ heading, text: words[start].slice(offset, offset + 1600) });
        }
        start++;
        continue;
      }
      result.push({ heading, text: words.slice(start, end).join(" ") });
      if (end === words.length) break;
      const tail = words.slice(start, end).join(" ").match(/[^.!?]*[.!?]$/)?.[0].trim();
      const overlap = tail ? tail.split(/\s+/).length : 0;
      start = end - (overlap > 0 && overlap <= 35 && overlap < end - start ? overlap : 0);
    }
    lines = [];
  }
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^#{1,3}\s+(.+)$/);
    if (match) { flush(); heading = match[1]; }
    else lines.push(line);
  }
  flush();
  return result;
}

function titleOf(record: SourceRecord): LocalizedText[] {
  return record.kind === "clan" ? record.data.names
    : record.kind === "knowledge" ? record.data.title : record.data.term;
}
function summaryOf(record: SourceRecord): string {
  return record.kind === "clan" ? record.data.description
    : record.kind === "knowledge" ? record.data.summary : record.data.gloss;
}

function enforceSourcePolicy(record: SourceRecord) {
  const { data, markdown } = record;
  const source = JSON.stringify(data) + "\n" + markdown;
  if (/hiltunen|umndawu\s+wamanzi|\b(?:icansi|ukuthwasa|ukuthobeka|amakhosi|abalozi|umuthi)\b/i.test(source)) {
    throw new Error("Excluded source material must not enter content/");
  }
  if (data.id === "proverb-omukwaniilwa-ka-lela-ye-awike") {
    throw new Error("The composed schema illustration is not an approved content source");
  }
  if (record.kind === "knowledge" && record.data.category === "medicine" && data.accessTier === "public") {
    throw new Error("Medicine cannot be public or retrievable in this prototype");
  }
  if (/rodin/i.test(data.provenance.attribution)
      && /medicin|magic|poison|narcotic/i.test(data.provenance.attribution)) {
    throw new Error("Excluded Rodin chapters must not enter content/");
  }
  if (record.kind === "clan" && data.id === "aakwanambwa"
      && record.data.names.some((name) => name.lang !== "ng" || (name.dialect && name.dialect !== "unknown"))) {
    throw new Error("Dog-clan names must keep ng / unknown dialect until owner confirmation");
  }
}

function restrictedSummary(record: SourceRecord): RestrictedRecord {
  const { data } = record;
  return {
    kind: "restricted",
    sourceKind: record.kind,
    id: data.id,
    title: titleOf(record).map(({ lang, text }) => ({ lang, text })),
    summary: summaryOf(record),
    accessTier: "restricted",
    verification: data.verification,
    provenance: { sourceType: data.provenance.sourceType, attribution: data.provenance.attribution },
    ...(data.scope ? { scope: data.scope } : {}),
    ...(record.kind === "knowledge" && record.data.governanceNote
      ? { governanceNote: record.data.governanceNote } : {}),
  };
}

function indexText(record: SourceRecord): string {
  const titles = titleOf(record).map((item) => item.text).join(" · ");
  const parts = [titles, summaryOf(record)];
  if (record.kind === "knowledge") {
    parts.push(...(record.data.literalTranslation ?? []).map((item) => item.text));
    // Structured body is authoritative when present; never duplicate the Markdown copy.
    parts.push(record.data.body?.map((item) => item.text).join("\n\n") || record.markdown);
  } else if (record.kind === "clan") {
    parts.push(record.data.emblem.name.map((item) => item.text).join(" · "));
    parts.push(...record.data.emblem.symbolism, record.markdown);
    // Personal practice notes stay on profiles, outside the chat corpus: no ritual instructions.
  } else {
    parts.push(record.markdown);
  }
  return [...new Set(parts.filter((part) => part.trim()))].join("\n\n");
}

export async function buildIndex(root: string) {
  const destination = path.join(root, "data/generated");
  const staging = path.join(root, `data/.generated-${process.pid}`);
  // Fail closed: a rejected build cannot leave a formerly public index available.
  await rm(destination, { recursive: true, force: true });
  await rm(staging, { recursive: true, force: true });
  const index: GeneratedIndex = { schemaVersion: 1, records: [], chunks: [] };
  const ids = new Set<string>();
  const warnings: string[] = [];
  let excluded = 0;
  let restricted = 0;
  let interfaceCopy: Record<string, string> = {};
  try {
    for (const file of await markdownFiles(path.join(root, "content"))) {
      const relative = path.relative(path.join(root, "content"), file);
      const folder = relative.split(path.sep)[0] as keyof typeof FrontmatterSchemas;
      if (!(folder in FrontmatterSchemas)) throw new Error(`Unrecognised content directory: ${relative}`);
      const parsed = parseMarkdown(await readFile(file, "utf8"));
      const validation = FrontmatterSchemas[folder].safeParse(parsed.data);
      if (!validation.success) {
        throw new Error(`${relative}: ${validation.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
      }
      if (ids.has(validation.data.id)) throw new Error(`Duplicate content id: ${validation.data.id}`);
      ids.add(validation.data.id);
      if (folder === "interface") {
        const ui = FrontmatterSchemas.interface.parse(parsed.data);
        if (Object.keys(interfaceCopy).length) throw new Error("Only one English interface dictionary is supported");
        if (ui.provenance.sourceType !== "ai-synthesis" || ui.provenance.consent !== "not-required") {
          throw new Error("Interface copy must declare draft AI synthesis and not-required consent");
        }
        interfaceCopy = ui.copy;
        continue;
      }
      const kind: ContentKind = folder === "clans" ? "clan" : folder;
      const record = { kind, data: validation.data, markdown: parsed.markdown } as SourceRecord;
      enforceSourcePolicy(record);
      const tier = record.data.accessTier;
      const consent = record.data.provenance.consent;
      if (tier === "private" || tier === "community" || consent === "pending" || consent === "declined") {
        excluded++;
        continue;
      }
      if (tier === "restricted") {
        index.records.push(restrictedSummary(record));
        restricted++;
        continue;
      }
      const publicRecord = record as PublicRecord; // validated tier is now exactly public
      index.records.push(publicRecord);
      if (record.kind === "glossary" && !record.data.scope) {
        warnings.push(`${record.data.id}: legacy glossary has no documented scope; source preserved`);
      }
      const title = titleOf(record).map((item) => item.text).join(" · ");
      const tags = record.kind === "knowledge" ? record.data.tags ?? [] : [];
      const chunks: IndexedChunk[] = chunkMarkdown(indexText(record)).map((chunk, position) => ({
        ...chunk,
        entryId: record.data.id,
        chunkId: `${record.data.id}:${position + 1}`,
        title,
        tags,
        kind,
        accessTier: "public",
        verification: record.data.verification,
        attribution: record.data.provenance.attribution,
      }));
      index.chunks.push(...chunks);
    }
    const visible = new Set(index.records.map((record) => record.kind === "restricted" ? record.id : record.data.id));
    for (const record of index.records) {
      if (record.kind === "restricted") continue;
      const related = record.kind === "clan" ? record.data.relatedKnowledgeIds
        : record.kind === "knowledge" ? [
          ...record.data.clanIds ?? [], ...record.data.relatedIds ?? [], ...record.data.glossaryIds ?? [],
        ] : [];
      for (const id of related) if (!visible.has(id)) warnings.push(`${record.data.id}: unresolved relation ${id}`);
    }
    await mkdir(staging, { recursive: true });
    await writeFile(path.join(staging, "index.json"), JSON.stringify(index, null, 2) + "\n");
    await writeFile(path.join(staging, "entries.json"), JSON.stringify(index.records, null, 2) + "\n");
    await writeFile(path.join(staging, "interface.json"), JSON.stringify(interfaceCopy, null, 2) + "\n");
    await rename(staging, destination);
    return { records: index.records.length, chunks: index.chunks.length, excluded, restricted, warnings };
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  buildIndex(process.cwd()).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Content build failed");
    process.exitCode = 1;
  });
}
