# Omhepo AIIK

**Ancestral Intelligence Indigenous Knowledge** · Native Next.js App Router prototype

“Omhepo” is the spoken name. AIIK is pronounced as the letters A-I-I-K.

This prototype presents the supplied cultural collection with visible provenance,
verification, and access controls. Its chat answers with exact public-source
excerpts and server-constructed citations. It works in simulated mode without an
API key; an OpenAI-compatible model can optionally select relevant excerpts.

Read [TEAM-RULES.md](TEAM-RULES.md) and
[CONTENT-GOVERNANCE.md](CONTENT-GOVERNANCE.md) before changing content.

## Run

Tested with Node.js 24.22.1 and 22.23. Use Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The development command rebuilds the content index
and prompt bundle before starting Next.js. No account, database, paid API,
external font, or image service is required.

For the production build:

```bash
npm run build
npm start
```

To run the verification commands separately:

```bash
npm run verify:sources
npm test
npm run typecheck
npm run build
```

The source archive intentionally omits `node_modules` and `.next`. The lockfile
pins the tested dependency tree. `npm ci` restores it. Generated data is rebuilt
automatically; never edit it as a content source.

The tested build uses Next.js's supported Webpack path. This environment blocked
Turbopack's local CSS-worker port; Webpack completed the native Next.js build.
`scripts/dev-server.mjs` also accepts common preview-host flags and passes their
Next.js equivalents to the native development server.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Introduction, featured sources, and grounded chat |
| `/clans` | Omazimo catalogue with source-driven clan variants and emblems |
| `/clans/[id]` | Ezimo detail, dialect notes, original practice notes, and provenance |
| `/library` | Searchable/filterable knowledge and proverb collection |
| `/library/[id]` | Localized source text, literal translation, meaning, and governance |
| `/glossary` | The three existing sourced terms, with stable citation anchors |
| `/onboarding` | Optional device-only identity record and explicit deletion |
| `/about` | Scope, source handling, and prototype governance |
| `POST /api/chat` | Strict `{ "message": "..." }` request and grounded JSON response |
| `GET /api/search?q=...` | Public-source lexical search with citation metadata |

There are no `/totems` routes or `data/totems.ts` content files.

## Source collection and Task 0

The migration preserves 41 original Markdown content files:

| Collection | Files | Publication |
| --- | ---: | --- |
| Clans | 20 | Public; original verification status retained |
| Knowledge, excluding proverbs | 8 | Seven public entries and one restricted summary |
| Jisabu proverbs | 10 | Public, published-source attribution, draft verification |
| Glossary | 3 | Public; original verification status retained |

The existing collection includes a Rabbit clan record alongside the guide's 19
emblems. All 20 original Markdown clan files are retained rather than reducing
the collection to a hard-coded count.

`scripts/migrate-content.ts` moved the 31 former `data/*.md` sources into
`content/clans`, `content/knowledge`, and `content/glossary`. It moved both old
TypeScript seed files to `data/legacy`. It left the ten existing files under
`content/knowledge/proverbs` in place. Running the migration again is harmless
when there are no unmigrated files; an existing destination is never overwritten.

The migration applies to this scaffold. No external Google Drive files or folders
were changed. Source IDs, original paths, byte lengths, and SHA-256 checksums are
recorded in `docs/source-manifest.json`.

`npm run verify:sources` checks all 41 cultural Markdown files, both archived seed
scripts, and the exact attached `shared/types/index.ts`. A deliberate later
content revision must receive the appropriate review status and a documented new
baseline; do not silently update checksums to hide changes.

## Content contract

All cultural content and interface prose live in Markdown with frontmatter under
`content/`. TypeScript contains behavior and contracts, not seeded cultural text
or interface prose. Existing shared interfaces remain unchanged, including
`KnowledgeEntry.literalTranslation?: LocalizedText[]`, dialect tags, and clan
notes. Additional runtime, chat, identity, and lineage contracts live alongside
that file.

The Zod schemas in `shared/schemas/index.ts` distinguish clan, knowledge,
glossary, and interface records. Unknown fields and duplicate YAML keys fail.
Required governance fields are never defaulted. Empty attribution fails as well
as missing attribution.

The three existing glossary files omit `scope`. Their original structure is
accepted and a build warning identifies each exception. The application does
not invent an origin, timestamp, or reviewed text. Clan and knowledge records
still require scope. See `docs/11-scaffold-decisions-2026-11-01.md`.

Dog-clan names retain their existing `lang: ng` tags. Where `dialect` is absent,
the display treats it as unknown; the original file is unchanged. Gemini's
rewritten clan practice notes and composed proverb are not seeded. Interface
labels use English and the attested terms Ezimo and Omazimo.

## Build and publication boundary

`npm run index` executes the content build followed by prompt validation.

1. Recursively parse `content/**/*.md` and validate its exact frontmatter shape.
2. Reject prohibited sources and public medicine entries.
3. Drop private and community records, including their metadata, from prototype
   outputs. Also omit records whose consent is pending or declined.
4. Reconstruct restricted records from permitted summary fields. Neither their
   Markdown nor structured body, practice notes, translations, contributor
   details, or arbitrary fields are emitted.
5. Keep public metadata and display text; chunk public retrieval material by
   headings with bounded size and a short sentence overlap.
6. Write deterministic `data/generated/index.json`, `entries.json`, and
   `interface.json`. Interface copy is not part of cultural retrieval.
7. Read and validate all five prompt Markdown files into `prompts.json`.

A failed build removes stale generated output and exits nonzero. Do not serve a
previous successful build as if a failed source update had been applied. A
running or deployed application must be rebuilt and redeployed after an access
tier or consent change.

For knowledge entries, a structured `body` takes precedence over the duplicate
trailing Markdown copy. All original source bytes remain in the repository.
Clan personal-practice notes remain visible with their original qualification on
profiles; they are intentionally excluded from chat chunks. This avoids turning
personal ritual descriptions into instructions.

Runtime access independently validates allowed tiers, consent, source identity,
and restricted-summary projections. Public pages render generated records;
the application does not load `data/legacy`, source-review documents, or raw
content directories at request time.

## Grounded chat

The pipeline is:

```text
validated question → intent boundary → public retrieval → source selection
→ exact-excerpt validation → source-derived citations → response
```

`prompts/refusals.md` supplies deterministic trigger examples, refusal text,
safety notices, and public redirects. Supplemental rule patterns and lexical
search settings live in `prompts/intent-rules.md`, not in TypeScript. Missing or
malformed prompt sections fail the build.

The classifier is a conservative English-first prototype. It refuses ritual
instructions, medical or spiritual diagnosis, and private-lineage requests. The
retrieval and extractive-output boundaries still apply to unclassified queries.
No claim of complete multilingual intent detection is made.

Search normalizes case and diacritics and recognizes configured noun-prefix
variants without rewriting displayed source names. Chat requires strong term
coverage. When sources do not support the question, the response is the fixed
phrase from the supplied system prompt. It has `grounded: false` and no invented
citations. Redirect links are separate from evidential citations.

In default simulated mode, the answer contains original public excerpts. With a
configured model, the provider returns only selected chunk IDs and exact quoted
substrings. The server rejects unknown IDs, altered quotes, extra prose, and
model-written citation markers. It creates all citations from source records.
This makes the current chat an extractive reading assistant; freeform model
paraphrasing is deliberately outside this prototype's validated contract.

Provider outages and timeouts produce an explicitly labelled simulated fallback.
Invalid model output produces the no-source state. No questions, identity values,
provider response bodies, or credentials are written by the chat implementation
to application logs. Hosting/request-access logs are governed by the chosen host.

## Optional OpenAI-compatible provider

Copy `.env.example` to `.env.local`, then set server-side environment values.
Leave `LLM_BASE_URL` empty for the default simulated mode.

```dotenv
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=your-installed-model
LLM_API_KEY=
```

The service must support OpenAI-compatible `/chat/completions` and JSON-object
responses. The adapter appends `/chat/completions` to `LLM_BASE_URL`, sets
temperature to zero, limits response size, and applies a 12-second timeout.
Ollama's local OpenAI-compatible base can be used as shown; the model must be
installed in that separate service. For a hosted provider, use its base URL,
model identifier, and secret API key. None of these values is exposed through
`NEXT_PUBLIC_` variables or accepted from a browser request.

`localhost` refers to the machine running Next.js. A hosted deployment cannot
reach Ollama on a visitor's laptop through that address.

The protocol adapter is covered with mocked HTTP responses. Live hosted-model
and Ollama availability must be verified in the environment that supplies them.

## Identity and browser behavior

Onboarding is optional and uses only browser local storage. It creates no server
record. Save and delete are explicit, storage failures are handled, and private
profile fields are never appended to chat requests. Any optional personalization
is limited to device-local navigation suggestions.

The API accepts only `message`; arbitrary history, identity objects, supplied
chunks, and provider URLs are rejected. Request size and question length are
bounded. Chat responses and search responses are not cached.

The interface uses system fonts, restrained CSS, and source typography. It does
not use the circulated totem-guide illustrations, animal mascots, external font
requests, analytics, or a translation model. Review statuses and missing
translations are shown honestly.

## Project layout

| Location | Responsibility |
| --- | --- |
| `app/` | Next.js pages and thin HTTP routes |
| `components/` | Presentation and bounded client interaction |
| `modules/content/` | Runtime record access and source metadata |
| `modules/retrieval/` | Public lexical retrieval and citation references |
| `modules/chat/` | Intent, extractive selection, and provider adapter |
| `modules/governance/` | Refusal and intent-rule parsing |
| `modules/identity/` | Device-only identity persistence |
| `shared/types/` | Exact supplied and additive domain contracts |
| `shared/schemas/` | Frontmatter and request validation |
| `content/` | Original cultural sources and separate interface Markdown |
| `prompts/` | Original policies plus implementation rules and provider contract |
| `scripts/` | Migration, build, integrity checks, and meaningful boundary tests |
| `data/legacy/` | Archived original seeds; never imported by the app |
| `data/generated/` | Build outputs; ignored by Git |
| `docs/` | Source references and dated implementation/verification decisions |
| `handoffs/` | Collaborator specification and complete Task 0 review |

See `docs/12-verification-2026-11-01.md` for the final build and user-flow evidence.

## Deliberate prototype limits

- No community sign-in or private/lineage content service is implemented.
- No new translation, clan interpretation, oral recording, or cultural claim is
  generated to fill source gaps.
- No embedding database, fine-tuning, or automated source ingestion is needed for
  this collection.
- The UI is responsive, but prototype review does not constitute a formal
  accessibility certification.
- This delivery is a source scaffold; publication and connected-provider
  operation are separate deployment choices.
