import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { type TestContext } from "node:test";
import { stringify } from "yaml";
import { buildIndex, chunkMarkdown, parseMarkdown } from "../build-index";
import { FrontmatterSchemas } from "../../shared/schemas";
import type { GeneratedIndex } from "../../shared/types/generated";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtures = {
  clan: "content/clans/aakwanambwa.md",
  disputedClan: "content/clans/aakwanekamba.md",
  knowledge: "content/knowledge/proverbs/proverb-hondile-muwa-ohomwandi.md",
  restricted: "content/knowledge/restricted-efundula-olufuko.md",
  glossary: "content/glossary/ezimo.md",
} as const;

type FixtureName = keyof typeof fixtures;
type Metadata = Record<string, unknown>;

async function fixture(name: FixtureName) {
  const relativePath = fixtures[name];
  const source = await readFile(path.join(projectRoot, relativePath), "utf8");
  const parsed = parseMarkdown(source);
  return { relativePath, source, data: structuredClone(parsed.data) as Metadata, markdown: parsed.markdown };
}

async function temporaryProject(t: TestContext) {
  const root = await mkdtemp(path.join(tmpdir(), "omhepo-content-test-"));
  await mkdir(path.join(root, "content"), { recursive: true });
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function writeSource(root: string, relativePath: string, source: string) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, source, "utf8");
}

async function writeDocument(root: string, relativePath: string, data: Metadata, markdown: string) {
  await writeSource(root, relativePath, `---\n${stringify(data)}---\n\n${markdown}\n`);
}

async function generated(root: string) {
  const directory = path.join(root, "data/generated");
  const indexSource = await readFile(path.join(directory, "index.json"), "utf8");
  const files = await readdir(directory);
  const source = (await Promise.all(files.map((name) => readFile(path.join(directory, name), "utf8")))).join("\n");
  return { source, index: JSON.parse(indexSource) as GeneratedIndex };
}

function provenance(data: Metadata) {
  return data.provenance as Metadata;
}

function recordId(record: GeneratedIndex["records"][number]) {
  return record.kind === "restricted" ? record.id : record.data.id;
}

async function expectNoIndex(root: string) {
  await assert.rejects(readFile(path.join(root, "data/generated/index.json")), { code: "ENOENT" });
}

test("all supplied cultural Markdown validates without rewriting its frontmatter", async () => {
  let count = 0;
  async function visit(directory: string) {
    for (const child of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, child.name);
      if (child.isDirectory()) {
        await visit(file);
      } else if (child.name.endsWith(".md")) {
        const folder = path.relative(path.join(projectRoot, "content"), file).split(path.sep)[0];
        if (!(folder in FrontmatterSchemas) || folder === "interface") continue;
        const parsed = parseMarkdown(await readFile(file, "utf8"));
        const schema = FrontmatterSchemas[folder as keyof typeof FrontmatterSchemas];
        assert.deepEqual(schema.parse(parsed.data), parsed.data, file);
        count++;
      }
    }
  }
  await visit(path.join(projectRoot, "content"));
  assert.ok(count >= 41, "The recovered original corpus contains 41 cultural Markdown files.");
});

test("public build preserves original metadata, source files, and proverb translation", async (t) => {
  const root = await temporaryProject(t);
  const inputs = await Promise.all((["clan", "disputedClan", "knowledge", "glossary"] as const).map(fixture));
  for (const input of inputs) await writeSource(root, input.relativePath, input.source);
  await buildIndex(root);
  const { index } = await generated(root);
  assert.equal(index.schemaVersion, 1);
  assert.equal(index.records.length, inputs.length);
  for (const input of inputs) {
    assert.equal(await readFile(path.join(root, input.relativePath), "utf8"), input.source);
    const record = index.records.find((candidate) => recordId(candidate) === input.data.id);
    assert.ok(record && record.kind !== "restricted");
    assert.deepEqual(record.data, input.data);
  }
  assert.ok(index.chunks.length > 0);
  assert.ok(index.chunks.every((chunk) => chunk.accessTier === "public"));
  const knowledge = inputs[2].data;
  assert.ok(Array.isArray(knowledge.literalTranslation));
  assert.equal(inputs[1].data.verification, "disputed");
  assert.equal(knowledge.verification, "draft");
});

for (const field of ["accessTier", "verification", "provenance.attribution"] as const) {
  test(`missing ${field} stops the build, including on a private entry`, async (t) => {
    const root = await temporaryProject(t);
    const input = await fixture("knowledge");
    input.data.accessTier = "private";
    if (field === "provenance.attribution") delete provenance(input.data).attribution;
    else delete input.data[field];
    await writeDocument(root, input.relativePath, input.data, input.markdown);
    await assert.rejects(buildIndex(root), new RegExp(field.replace(".", "[.\\s]")));
    await expectNoIndex(root);
  });
}

test("blank attribution and unknown governance fields are rejected", async (t) => {
  for (const variation of ["blank-attribution", "unknown-field"] as const) {
    const root = await temporaryProject(t);
    const input = await fixture("knowledge");
    if (variation === "blank-attribution") provenance(input.data).attribution = " \t ";
    else input.data.unreviewedBody = "UNREVIEWED_FIELD_SENTINEL";
    await writeDocument(root, input.relativePath, input.data, input.markdown);
    await assert.rejects(buildIndex(root));
    await expectNoIndex(root);
  }
});

test("duplicate YAML governance keys cannot override the first value", () => {
  assert.throws(() => parseMarkdown("---\naccessTier: private\naccessTier: public\n---\n"));
});

test("duplicate ids fail across content kinds", async (t) => {
  const root = await temporaryProject(t);
  const clan = await fixture("clan");
  const knowledge = await fixture("knowledge");
  knowledge.data.id = clan.data.id;
  await writeSource(root, clan.relativePath, clan.source);
  await writeDocument(root, knowledge.relativePath, knowledge.data, knowledge.markdown);
  await assert.rejects(buildIndex(root), /duplicate/i);
  await expectNoIndex(root);
});

for (const accessTier of ["private", "community"] as const) {
  test(`${accessTier} entries leave no metadata or body in generated outputs`, async (t) => {
    const root = await temporaryProject(t);
    const input = await fixture("knowledge");
    input.data.id = `${accessTier}-sentinel-entry`;
    input.data.accessTier = accessTier;
    input.data.title = [{ lang: "en", text: `${accessTier.toUpperCase()}_TITLE_SENTINEL` }];
    input.data.summary = `${accessTier.toUpperCase()}_SUMMARY_SENTINEL`;
    input.data.body = [{ lang: "en", text: `${accessTier.toUpperCase()}_FRONTMATTER_SENTINEL` }];
    await writeDocument(root, input.relativePath, input.data, `${accessTier.toUpperCase()}_MARKDOWN_SENTINEL`);
    await buildIndex(root);
    const { source, index } = await generated(root);
    assert.equal(index.records.length, 0);
    assert.equal(index.chunks.length, 0);
    assert.ok(!source.includes("SENTINEL"));
    assert.ok(!source.includes(String(input.data.id)));
  });
}

test("restricted knowledge exposes its summary but no body, translation, or contributor details", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("restricted");
  input.data.body = [{ lang: "en", text: "RESTRICTED_FRONTMATTER_SENTINEL" }];
  input.data.literalTranslation = [{ lang: "en", text: "RESTRICTED_TRANSLATION_SENTINEL" }];
  provenance(input.data).contributor = "RESTRICTED_CONTRIBUTOR_SENTINEL";
  await writeDocument(root, input.relativePath, input.data, "RESTRICTED_MARKDOWN_SENTINEL");
  await buildIndex(root);
  const { source, index } = await generated(root);
  assert.equal(index.chunks.length, 0);
  assert.equal(index.records.length, 1);
  const record = index.records[0];
  assert.equal(record.kind, "restricted");
  assert.ok(record.kind === "restricted");
  assert.equal(record.summary, input.data.summary);
  assert.equal(record.governanceNote, input.data.governanceNote);
  assert.ok(!source.includes("SENTINEL"));
  assert.ok(!("body" in record));
  assert.ok(!("markdown" in record));
});

test("restricted clans do not leak practice, observance, praise, or personal notes", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("clan");
  input.data.accessTier = "restricted";
  input.data.dailyIntegration = ["RESTRICTED_PRACTICE_SENTINEL"];
  (input.data.emblem as Metadata).observances = ["RESTRICTED_OBSERVANCE_SENTINEL"];
  input.data.praiseNames = [{ lang: "en", text: "RESTRICTED_PRAISE_SENTINEL" }];
  input.data.note = "RESTRICTED_PERSONAL_NOTE_SENTINEL";
  await writeDocument(root, input.relativePath, input.data, "RESTRICTED_CLAN_MARKDOWN_SENTINEL");
  await buildIndex(root);
  const { source, index } = await generated(root);
  assert.equal(index.chunks.length, 0);
  assert.equal(index.records[0]?.kind, "restricted");
  assert.ok(!source.includes("SENTINEL"));
});

test("restricted glossary permits only its safe term and gloss", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("glossary");
  input.data.accessTier = "restricted";
  provenance(input.data).contributor = "RESTRICTED_GLOSSARY_CONTRIBUTOR_SENTINEL";
  await writeDocument(root, input.relativePath, input.data, "RESTRICTED_GLOSSARY_BODY_SENTINEL");
  await buildIndex(root);
  const { source, index } = await generated(root);
  assert.equal(index.chunks.length, 0);
  const record = index.records[0];
  assert.ok(record?.kind === "restricted");
  assert.equal(record.summary, input.data.gloss);
  assert.ok(!source.includes("SENTINEL"));
});

test("consent pending or declined removes public records from publication and retrieval", async (t) => {
  for (const consent of ["pending", "declined"] as const) {
    const root = await temporaryProject(t);
    const input = await fixture("knowledge");
    provenance(input.data).consent = consent;
    input.data.summary = "UNCONSENTED_SUMMARY_SENTINEL";
    await writeDocument(root, input.relativePath, input.data, "UNCONSENTED_BODY_SENTINEL");
    await buildIndex(root);
    const { source, index } = await generated(root);
    assert.equal(index.records.length, 0);
    assert.equal(index.chunks.length, 0);
    assert.ok(!source.includes("SENTINEL"));
  }
});

test("medicine cannot enter the public retrieval corpus", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("knowledge");
  input.data.category = "medicine";
  await writeDocument(root, input.relativePath, input.data, input.markdown);
  await assert.rejects(buildIndex(root), /medicine|restricted|public/i);
  await expectNoIndex(root);
});

test("a prohibited private source cannot be relabelled public", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("knowledge");
  const governance = await readFile(path.join(projectRoot, "CONTENT-GOVERNANCE.md"), "utf8");
  const prohibitedSource = governance.match(/Hiltunen 1986[^\n]*/)?.[0];
  assert.ok(prohibitedSource, "The test derives the prohibited source from the project policy.");
  provenance(input.data).attribution = prohibitedSource;
  await writeDocument(root, input.relativePath, input.data, input.markdown);
  await assert.rejects(buildIndex(root), /prohibit|exclude|Hiltunen|private/i);
  await expectNoIndex(root);
});

test("Nguni learning material excluded by policy cannot enter content", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("knowledge");
  const governance = await readFile(path.join(projectRoot, "CONTENT-GOVERNANCE.md"), "utf8");
  const policyLine = governance.split("\n").find((line) => line.includes("Nguni / TikTok"));
  const excludedTerms = policyLine?.match(/\(([^)]+)\)/)?.[1];
  assert.ok(excludedTerms, "Excluded terms are read from policy, never composed in TypeScript.");
  await writeDocument(root, input.relativePath, input.data, excludedTerms);
  await assert.rejects(buildIndex(root), /prohibit|exclude|Nguni|TikTok/i);
  await expectNoIndex(root);
});

test("withdrawing an existing public entry removes its previous chunks", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("knowledge");
  input.data.body = [{ lang: "en", text: "WITHDRAWN_BODY_SENTINEL" }];
  await writeDocument(root, input.relativePath, input.data, "WITHDRAWN_BODY_SENTINEL");
  await buildIndex(root);
  assert.ok((await generated(root)).source.includes("WITHDRAWN_BODY_SENTINEL"));
  input.data.accessTier = "private";
  await writeDocument(root, input.relativePath, input.data, "WITHDRAWN_BODY_SENTINEL");
  await buildIndex(root);
  const { source, index } = await generated(root);
  assert.ok(!source.includes("WITHDRAWN_BODY_SENTINEL"));
  assert.equal(index.chunks.length, 0);
});

test("a failed rebuild cannot leave a previously usable public index", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("knowledge");
  await writeSource(root, input.relativePath, input.source);
  await buildIndex(root);
  assert.ok((await generated(root)).index.chunks.length > 0);
  delete input.data.verification;
  await writeDocument(root, input.relativePath, input.data, input.markdown);
  await assert.rejects(buildIndex(root));
  await expectNoIndex(root);
});

test("unquoted YAML dates retain the shared string type", async () => {
  const input = await fixture("knowledge");
  const source = input.source.replace(/updatedAt: "(\d{4}-\d{2}-\d{2})"/, "updatedAt: $1");
  const parsed = parseMarkdown(source);
  assert.equal(typeof (parsed.data as Metadata).updatedAt, "string");
  assert.doesNotThrow(() => FrontmatterSchemas.knowledge.parse(parsed.data));
});

test("chunking bounds long paragraphs and retains their ending", () => {
  const paragraph = Array.from({ length: 900 }, (_, i) => `sentinel${i}`).join(" ");
  const chunks = chunkMarkdown(`## Test heading\n\n${paragraph}`);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.text.length <= 1600));
  assert.ok(chunks.some((chunk) => chunk.text.includes("sentinel0")));
  assert.ok(chunks.some((chunk) => chunk.text.includes("sentinel899")));
  assert.ok(chunks.every((chunk) => chunk.heading === "Test heading"));
});

test("a long unbroken token cannot defeat chunk bounds", () => {
  const chunks = chunkMarkdown("SENTINEL".repeat(900));
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.text.length <= 1600));
});

test("rebuilding unchanged input produces deterministic records and chunk ids", async (t) => {
  const root = await temporaryProject(t);
  const input = await fixture("knowledge");
  await writeSource(root, input.relativePath, input.source);
  await buildIndex(root);
  const first = await generated(root);
  await buildIndex(root);
  const second = await generated(root);
  assert.deepEqual(second.index, first.index);
});
