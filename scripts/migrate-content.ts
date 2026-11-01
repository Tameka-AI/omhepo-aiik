import { mkdir, readdir, readFile, rename, access } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";

const root = process.cwd();
for (const name of ["clans", "knowledge", "glossary"]) {
  await mkdir(path.join(root, "content", name), { recursive: true });
}
await mkdir(path.join(root, "data/legacy"), { recursive: true });
const moves: { from: string; to: string }[] = [];
for (const name of (await readdir(path.join(root, "data"))).sort()) {
  const from = path.join(root, "data", name);
  if (["seed.ts", "seed-clans-v2.ts"].includes(name)) {
    moves.push({ from, to: path.join(root, "data/legacy", name) });
  } else if (name.endsWith(".md")) {
    const source = await readFile(from, "utf8");
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error(`Missing frontmatter: ${name}`);
    const doc = parseDocument(match[1], { uniqueKeys: true, schema: "core" });
    if (doc.errors.length) throw new Error(`Invalid YAML: ${name}`);
    const data = doc.toJS();
    const folder = data.names ? "clans" : data.term ? "glossary" : data.category ? "knowledge" : null;
    if (!folder) throw new Error(`Unknown content kind: ${name}`);
    moves.push({ from, to: path.join(root, "content", folder, name) });
  }
}
for (const { to } of moves) {
  if (await access(to).then(() => true, () => false)) throw new Error(`Refusing to overwrite ${to}`);
}
for (const { from, to } of moves) await rename(from, to);
console.log(`Moved ${moves.length} existing files; content/knowledge/proverbs was left in place.`);
