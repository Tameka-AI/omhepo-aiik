# Omhepo AIIK — Scaffold Decisions

**AIIK means:** Ancestral Intelligence Indigenous Knowledge  
**From:** ChatGPT · **To:** Heinrich N. Aluvilu and engineering collaborators  
**Date:** 2026-11-01  
**Status:** Implementation record; existing source verification statuses are unchanged.

## Task 0: source migration

The scaffold uses the original Markdown and TypeScript files recovered from the project’s Google Drive folder. The recovery manifest records source file IDs, original locations, byte lengths, and SHA-256 checksums. All recovered files matched their Drive-reported byte lengths; the five content files also supplied as attachments matched byte-for-byte.

The migration moves 33 original files out of `data/`: 20 clan Markdown files to `content/clans/`, eight knowledge Markdown files to `content/knowledge/`, three glossary Markdown files to `content/glossary/`, and the two legacy TypeScript seeds to `data/legacy/`. The ten existing Jisabu proverb files remain in `content/knowledge/proverbs/`.

The resulting cultural source collection contains 41 Markdown files: 20 clans, 18 knowledge entries including the ten proverbs, and three glossary terms. The 20 clan files preserve the existing collection, including the Rabbit entry alongside the guide’s 19 emblems. One knowledge entry is an explicitly restricted summary.

## Source text and shared types

The approved `shared/types/index.ts` is preserved exactly, including optional `literalTranslation?: LocalizedText[]` on `KnowledgeEntry`, the existing dialect field, and the clan `note` field. Additional generated-index and runtime types live separately.

Existing clan Markdown, spelling variants, descriptions, daily-integration notes, and verification statuses are preserved. The scaffold does not substitute the rewritten clan wording from Gemini’s specification. Dog-clan names remain `lang: ng`, with `dialect: unknown` where supplied. No dialect is inferred, and no single spelling is promoted as canonical.

All ten Jisabu proverbs are copied from their existing Markdown sources with their attribution, literal renderings, meanings, draft statuses, and orthography notes intact. The composed proverb in Gemini’s schema illustration is excluded. No new Oshiwambo sentence or UI phrase is composed.

## Existing glossary scope exceptions

The three supplied glossary records—`ezimo`, `oshizimo`, and `kalunga`—lack `scope`. This differs from TEAM-RULES’ general requirement but is part of the exact existing frontmatter contract, including the owner-reviewed `ezimo` record. The glossary schema therefore permits an absent scope and reports it as a build warning. The implementation neither invents an origin nor modifies a reviewed record to conceal the inconsistency.

These are documented source exceptions for later owner review. Clan and knowledge schemas continue to require scope. Missing `accessTier`, `verification`, or nonblank `provenance.attribution` still fails validation for every content kind.

## Public build and runtime boundary

The build validates the Markdown frontmatter before indexing. Private and community entries are omitted from the prototype output. Entries with pending or declined consent are also omitted. Restricted records are reconstructed as explicitly allowlisted summaries, without Markdown bodies, structured bodies, private contributor fields, or arbitrary frontmatter. Restricted records never produce retrieval chunks.

At runtime, content access checks access tiers again, accepts full records only when their tier is public and consent permits use, reconstructs restricted summaries from their allowlisted fields, and filters chunks to validated public records. The runtime does not rely solely on TypeScript’s access-tier literals.

The original prompt Markdown remains the source for runtime prompts. `scripts/build-runtime.ts` reads the required system, cultural-safety, refusal, provider-contract, and intent-rule files into a generated bundle. Missing or empty prompt files cause failure and remove stale generated prompt output. The generated bundle contains no content-source bodies.

Interface prose is stored as Markdown frontmatter separately from the cultural collection. It does not become cultural retrieval material. Route helpers use `/clans`, `/library`, and `/glossary`; clan terminology is limited to the attested labels Omazimo and Ezimo.

## External source state

No external Google Drive files or folders were modified during this recovery or scaffold migration. The migration applies to the scaffold’s source tree. The original Drive sources remain available under their existing IDs and locations.

Restricted source collections were not imported. The implementation record intentionally contains no private-source excerpts.

## Implementation and validation decisions

The optional provider is constrained to exact source selection. It returns chunk IDs and contiguous source excerpts; server validation rejects novel prose and constructs citations from the actual records. This is a deliberate prototype contract that prevents a citation-shaped model response from being treated as proof of grounding.

The native Next.js build uses Webpack because the available environment rejected a local port used by Turbopack's CSS worker. Webpack completed the production build. A small development launcher accepts the preview host's flags and translates them to native Next.js options. The later managed preview stopped before browser connection; its cause remains unestablished. Full evidence and remaining verification limits are recorded in docs/12-verification-2026-11-01.md.
