# Omhepo AIIK — Implementation Verification

**From:** ChatGPT · **To:** Heinrich N. Aluvilu and engineering collaborators  
**Date:** 2026-11-01  
**Result:** Production build, TypeScript, 48 automated tests, and original-source
integrity checks pass. Interactive browser verification remains unverified.

## User story and boundary

A visitor browses the sourced collection or submits a question. The chat API
validates that question, applies the supplied refusal rules, retrieves only
public content, and returns exact excerpts with source-derived citations. Clan
profiles and the library display original verification, attribution, and scope.
Restricted entries publish summaries only. Optional personal connections are
stored in the browser and are excluded from chat requests.

## Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Original-source integrity | Pass | 43 original files match SHA-256 baselines: 41 cultural Markdown sources and two archived TypeScript seeds. The supplied `shared/types/index.ts` also matches exactly. |
| Content build | Pass | 41 records, 70 public retrieval chunks, one restricted summary. Community/private and withdrawn-consent behavior verified with fixtures. |
| Content governance tests | Pass | 23 tests covering frontmatter, output filtering, source preservation, forbidden-source rejection, duplicate keys/IDs, bounded chunks, and stale-output removal. |
| Chat/provider tests | Pass | 15 tests covering intent, public retrieval, exact citations, unsupported questions, provider validation, request boundaries, timeout/failure fallback, and response-size limits. |
| API-handler integration tests | Pass | 10 tests exercise the actual route handlers with standard Request/Response objects, including validation, refusal ordering, public-only search, and no-store headers. |
| Combined automated suite | Pass | `npm test`: 48 tests, 48 pass, 0 fail, 0 skipped. |
| TypeScript | Pass | `npm run typecheck`: exit 0. The production build's TypeScript stage also passes. |
| Production compilation | Pass | `next build --webpack`: compiled successfully in 7.5 seconds; static generation completed 46/46 reported build steps; page optimization and tracing completed; exit 0. |
| Route generation | Pass | 20 clan detail paths and 18 library detail paths generated; home, About, onboarding, and not-found output generated; API and filtered-catalogue routes emitted. |
| Browser rendering and interaction | Unverified | Managed preview returned a running URL, then stopped before the cloud browser connected (`ERR_CONNECTION_REFUSED`). Status confirmed stopped. No specific application or infrastructure root cause was established. |
| Live provider/Ollama service | Unverified | The OpenAI-compatible request/response contract was tested with mocked fetch responses. No configured live model service was contacted. |

API-handler integration is not a substitute for a browser-to-running-server test.
No visual, mobile-device, keyboard-navigation, or browser-storage interaction
check is claimed as passed. The UI and local-only storage flow are implemented,
typechecked, and included in the successful production build.

## Commands used

```bash
npm run migrate:content
npm run index
npm run verify:sources
npm test
npm run typecheck
npm run build
```

The migration moved 33 existing files and preserved the ten proverb files in
their existing subdirectory. It is not necessary to rerun it for this delivered
tree. The final `build` script invokes `next build --webpack`.

The three expected build warnings identify missing scope in the original
`ezimo`, `kalunga`, and `oshizimo` glossary records. They are documented source
exceptions, not fabricated metadata or silently suppressed errors.

## Material cases exercised

### Content boundary

- Remove each mandatory governance field independently; the build fails,
  including for an entry marked private.
- Insert distinct sentinel text into frontmatter bodies, trailing Markdown,
  translations, clan practices, observances, praise names, personal notes, and
  contributor fields. Restricted output retains only the allowed summary fields.
- Mark records private or community; their identifiers, metadata, and bodies do
  not appear in any generated public file or retrieval result.
- Withdraw consent or change a former public entry's tier; its previous chunks
  disappear. Failed validation removes stale generated output.
- Duplicate YAML keys or content IDs fail deterministically.
- All ten supplied proverb files and their literal translations remain intact.

### Chat and API boundary

- A normal sourced question yields exact public excerpts, valid source IDs,
  original verification status, and correct clan/library/glossary citation paths.
- An unsupported qualifier added to a known clan name does not create a grounded
  answer merely because the clan keyword matched.
- Ritual, medical, private-lineage, and prompt-override requests do not reach a
  configured provider. The “rites of the life cycle” how-to phrasing has a
  regression test.
- Provider-generated extra prose, altered quotations, fabricated chunk IDs,
  citation-marker injection, and oversized responses are rejected.
- Provider failure or timeout yields a labelled simulated fallback; invalid
  selection output yields the fixed no-source state.
- API bodies containing identity, history, supplied chunks, or provider URLs are
  rejected. Blank, malformed, non-JSON, and oversized requests are rejected.
- Cross-site and foreign-Origin requests are rejected; same-origin requests
  remain valid.
- Search excludes restricted summaries and private/community entries even when
  an in-memory generated index is deliberately corrupted.

## Browser-preview attempts

The production compiler initially encountered this environment's restriction on
Turbopack's local CSS-worker port. The supported Webpack path resolved the build
failure without changing the framework or application behavior.

The managed preview launcher initially supplied `--host` and `--strictPort`,
which are not native Next.js flags. A small development launcher translates the
host flag and retains native Next.js execution. A subsequent preview reported
healthy, but stopped before the browser could connect. The available diagnostic
state did not establish why it stopped. No alternate server, browser-control
mechanism, or network-policy change was used to bypass this limitation.

## Manual walkthrough for the receiving environment

After `npm ci` and `npm run dev`:

1. Open the home page and use a suggested question in the chat. Check the source
   excerpts, verification badges, scope, and linked records.
2. Ask a ritual how-to question and a medical-treatment question. Check the
   refusal state and public-reading redirects.
3. Ask an unsupported question. Check the fixed no-source state.
4. Browse Omazimo, open the Dog and Hyena profiles, and inspect source spellings,
   unknown dialect labels, owner-review/disputed status, and original notes.
5. Filter the library to proverbs. Confirm ten entries, then open the shade proverb
   and check the source text, literal translation, meaning, and draft badge.
6. Open the restricted life-cycle entry. Only its summary, governance note, and
   permitted provenance should appear.
7. Save a disposable test profile in onboarding, reload, verify it persists,
   inspect a chat request to confirm only `message` is sent, then remove the
   disposable profile and reload again.
8. Check narrow and wide layouts, keyboard focus, form labels, disclosure controls,
   and source links in the intended browsers/devices.

These are receiving-environment checks, not claims of completed browser tests.
