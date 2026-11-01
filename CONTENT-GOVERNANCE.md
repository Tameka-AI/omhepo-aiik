# Omhepo AIIK — Content Governance
**AIIK means:** Ancestral Intelligence Indigenous Knowledge

## Access Tiers
- **public** — Safe for anyone. Chat may retrieve. Full body shown.
- **community** — Visible to signed-in community members (post-prototype). Chat may NOT retrieve.
- **restricted** — Summary only. Full body never shown or indexed. Chat may NOT retrieve.
- **private** — Never rendered, never indexed.

## Verification Status
- **draft** — Curated by AI or assistant; not yet reviewed by owner.
- **owner-reviewed** — Reviewed by Heinrich N. Aluvilu for accuracy and sensitivity.
- **elder-verified** — Confirmed by a named elder or practitioner.
- **disputed** — Conflicting accounts exist.

## Hard Rules
1. **Nguni / TikTok material** (umndawu wamanzi, icansi, ukuthobeka, amakhosi, abalozi, etc.) is excluded from content/. It was learning material only.
2. **Hiltunen 1986** (*Witchcraft and Sorcery in Ovambo*) is private. Never indexed. Never cited in chat.
3. **Rodin 1985** medicine, magic, poison, and narcotics chapters are never indexed.
4. Every entry must have `accessTier`, `verification`, and `provenance.attribution`. The build fails otherwise.
5. Chat is grounded-only: answers only from public-tier retrieved chunks and must cite sources.
6. Ritual how-to and medical requests are refused.
7. Clan names and spellings are dialect variants, not errors. No single “canonical” spelling is enforced.
8. Illustrations from the circulated totem guide are not used in the prototype.

## Scope Rule
`scope.origin` records where the knowledge was documented.  
`scope.appliesTo` records who it is presented as relevant to.  
Rodin-derived entries use `origin.lineage: "Ovakwanyama"` and `appliesTo: ["Aawambo"]`.

## Branding
**Omhepo AIIK**  
“Omhepo” is the spoken name. AIIK is the descriptor (Ancestral Intelligence Indigenous Knowledge), written and spoken as the letters A-I-I-K.
