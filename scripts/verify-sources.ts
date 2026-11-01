import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const unmigrated = (await readdir(path.join(root, "data"), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(?:md|ts)$/.test(entry.name));
if (unmigrated.length) throw new Error("Unmigrated source copies remain in data/; keep only generated/ and legacy/.");
const manifest = JSON.parse(await readFile(path.join(root, "docs/source-manifest.json"), "utf8")) as {
  files: { path: string; sha256: string }[];
  attachedSharedTypes: { path: string; sha256: string };
};
const culturalFiles: string[] = [];
async function walk(directory: string) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const location = path.join(directory, item.name);
    if (item.isDirectory()) await walk(location);
    else if (item.name.endsWith(".md")) culturalFiles.push(location);
  }
}
for (const kind of ["clans", "knowledge", "glossary"]) await walk(path.join(root, "content", kind));
let verified = 0;
for (const source of manifest.files.filter((file) => file.path.startsWith("data/") || file.path.startsWith("content/"))) {
  const name = path.basename(source.path);
  const targets = source.path.endsWith(".ts") ? [path.join(root, "data/legacy", name)]
    : culturalFiles.filter((file) => path.basename(file) === name);
  if (targets.length !== 1) throw new Error(`Expected one migrated source for ${name}`);
  const hash = createHash("sha256").update(await readFile(targets[0])).digest("hex");
  if (hash !== source.sha256) throw new Error(`Original source changed: ${name}`);
  verified++;
}
const types = manifest.attachedSharedTypes;
if (createHash("sha256").update(await readFile(path.join(root, types.path))).digest("hex") !== types.sha256) {
  throw new Error("The supplied shared/types/index.ts contract changed");
}
console.log(JSON.stringify({ originalSources: verified, exactSharedTypes: true, migratedLayout: true }, null, 2));
