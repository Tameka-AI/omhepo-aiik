import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseIntentRules, parseRefusals } from "../modules/governance/refusals";

const promptFiles = {
  system: "system.md",
  culturalSafety: "cultural-safety.md",
  refusals: "refusals.md",
  contract: "provider-contract.md",
  intentRules: "intent-rules.md",
} as const;

export async function buildRuntime(root: string) {
  const destination = path.join(root, "data/generated");
  const output = path.join(destination, "prompts.json");
  const staging = path.join(destination, `.prompts-${process.pid}.json`);
  // A failed rebuild must not retain stale safety prompts.
  await rm(output, { force: true });
  await rm(staging, { force: true });
  try {
    const entries = await Promise.all(Object.entries(promptFiles).map(async ([key, filename]) => {
      let content: string;
      try {
        content = await readFile(path.join(root, "prompts", filename), "utf8");
      } catch (error) {
        throw new Error(`Cannot read required prompt: prompts/${filename}`, { cause: error });
      }
      if (!content.trim()) throw new Error(`Required prompt is empty: prompts/${filename}`);
      return [key, content] as const;
    }));
    const prompts = Object.fromEntries(entries);
    // Missing sections, malformed rules, and invalid regexes fail before serving.
    parseRefusals(prompts.refusals);
    parseIntentRules(prompts.intentRules);
    await mkdir(destination, { recursive: true });
    await writeFile(staging, JSON.stringify(prompts, null, 2) + "\n");
    await rename(staging, output);
    return { prompts: entries.length, output: "data/generated/prompts.json" };
  } catch (error) {
    await rm(staging, { force: true });
    await rm(output, { force: true });
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  buildRuntime(process.cwd()).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Runtime content build failed");
    process.exitCode = 1;
  });
}
