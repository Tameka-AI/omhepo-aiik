# Omhepo AIIK — Team Rules
**AIIK means:** Ancestral Intelligence Indigenous Knowledge
**Applies to:** Heinrich (Owner), Grok, Claude, Gemini, ChatGPT — anyone who reads from or writes to this project
**Version:** 2 (2026-11-01). Supersedes v1. Check this file before adding or changing anything.

## 0. Two homes, one rule each

| What | Where it lives (single source of truth) | Who writes there |
|---|---|---|
| **Code and everything the app builds from** — `app/`, `modules/`, `components/`, `shared/`, `scripts/`, `prompts/`, `content/` (clans, knowledge, proverbs, glossary), tests, config | **GitHub:** `github.com/Tameka-AI/omhepo-aiik` (private; organisation Tameka-AI) | Via pull request only. Claude and ChatGPT/Codex open PRs; Gemini and Grok supply patches or file contents that the Owner commits to a branch. |
| **Collaboration layer** — `docs/`, `handoffs/`, `TEAM-RULES.md`, `CONTENT-GOVERNANCE.md` | **Google Drive:** `My Drive/Omhepo-AIIK` | Any collaborator, by replacing files (rule 1). |
| **Deployments** | **Vercel** (Tameka AI team): production from `main`, a preview URL for every PR | Automatic from GitHub. |
| **Server-side data** (phase 2 only: community tier, contributor consent, correction flags) | **Supabase** | Not used by the prototype. Nothing is wired in until a feature needs it. |

`TEAM-RULES.md` and `CONTENT-GOVERNANCE.md` are copied into the repo root so the build and the tools see them; Drive holds the master copy. After the scaffold is committed, `content/`, `data/`, `prompts/`, `shared/` and `code/` are removed from Drive — edit content only in the repo.

## 1. Replace, don't duplicate (Drive)
When you upload a revised version of a file that already exists, **replace it** (same name, "Replace existing file", or delete the old one first). Never leave both. If you see a `name (1).md` file, resolve it before anything else. Files an AI tool "writes" in its own sandbox do not reach Drive until the Owner downloads and uploads them — say so explicitly in your reply.

## 2. Restricted material never enters Drive or GitHub
Stays in the Owner's private collection, never uploaded, quoted at length, or indexed: Hiltunen 1986 (scan and OCR); the "Omhepo 🌬" WhatsApp export and family genealogy PDFs; Rodin 1985 chapters on medicines, magic, poisons, narcotics; Nguni/isiZulu learning material. Full rules in `CONTENT-GOVERNANCE.md`. The repo is treated as public from day one, whatever its visibility setting.

## 3. Code changes go through pull requests
- `main` is protected. No direct pushes, including by the Owner.
- One PR per stage or feature, small enough to review. Claude reviews every PR against `CONTENT-GOVERNANCE.md` before merge; the build must pass (`npm run build`, `npm test`, `npm run typecheck`).
- The build fails on any content file missing `accessTier`, `verification` or `provenance.attribution`; never bypass that gate.
- Never commit `node_modules`, `.env*`, `data/generated/`, or any file from rule 2.
- Never compose Oshiwambo sentences, proverbs, clan names or ritual descriptions in code, tests, fixtures or UI copy. Test fixtures use the real content files or obviously synthetic English placeholders marked `accessTier: private`.

## 4. Every content file carries its governance fields
`accessTier`, `verification`, `provenance.sourceType`, `provenance.attribution`, `provenance.consent`, `scope`. Anything an AI drafted is `sourceType: ai-synthesis` + `verification: draft`. Never edit an `owner-reviewed` or `elder-verified` entry without restoring the reviewed text or dropping it back to `draft`.

## 5. Number and date what you add (Drive)
New documents in `docs/` take the next number. Handoffs say who they are from, who they are to, and the date. Decisions go in a dated decisions file in `docs/`, not only in chat.

## 6. How each tool accesses the repo
- **Claude** — clones and runs git, tests and the dev server on the Owner's Mac (connected folder `~/Documents/Tameka AI/omhepo-aiik`) or in its own workspace; opens and reviews PRs.
- **ChatGPT / Codex** — reads the repo through the GitHub connector; opens PRs from the Codex environment.
- **Gemini** — reads the repo by URL and Vercel preview URLs for visual review; returns patches/file contents for the Owner to commit.
- **Grok** — reads the repo by URL; returns patches/file contents for the Owner to commit.
Every tool: state the branch or PR you are working against, and never claim a file is "in the repo" or "on Drive" unless it has been pushed or uploaded.

## 7. Licensing (decision pending — Owner)
Proposed: MIT for code; a separate, stricter notice for `content/` (CC BY-NC-ND 4.0 or a custom community-stewardship notice) stating that clan and ancestral knowledge remains the heritage of the communities concerned, must be attributed, and may not be used commercially. Until decided, the repo stays private.

---
*Branding: "Omhepo AIIK". "Omhepo" is the spoken name; AIIK is the descriptor, said as the letters A-I-I-K.*
