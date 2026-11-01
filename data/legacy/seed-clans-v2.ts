// Omhepo AIIK — Clan (ezimo / omazimo) seed, v2
// AIIK means: Ancestral Intelligence Indigenous Knowledge
// Generated 2026-11-01 by Claude from the owner's decisions (docs/06-owner-decisions-2026-11-01.md)
// and the consolidated clan table in docs/05-namibian-sources-extract.md.
//
// GOVERNANCE
// - All 19 clans are seeded at the owner's request. Only the owner's own two clans are
//   `owner-reviewed`; everything else is `draft` until elders confirm (owner's standing caveat).
// - Names are kept exactly as found in sources; spelling differences are dialect variants,
//   not errors. No canonical spelling is enforced.
// - Illustrations from the circulated totem guide are NOT used.
// - Types follow shared/types/clan.ts in docs/04-claude-review.md, extended with
//   `dialect` on names and an optional `note` on the clan.

export type Language = "en" | "kwn" | "ndo" | "ng";

export interface LocalizedText {
  lang: Language;
  text: string;
  /** Dialect or orthography the spelling comes from, when known. */
  dialect?: "Oshikwanyama" | "Oshindonga" | "Oshimbalantu" | "Oshikwambi" | "Oshingandjera" | "unknown";
  orthographyNote?: string;
}

export type AccessTier = "public" | "community" | "restricted" | "private";
export type VerificationStatus = "draft" | "owner-reviewed" | "elder-verified" | "disputed";

export interface Provenance {
  sourceType: "oral-elder" | "family-notes" | "personal-practice" | "published" | "community-contrib" | "ai-synthesis";
  attribution: string;
  consent: "not-required" | "pending" | "granted" | "declined";
  citations?: string[];
  reviewedBy?: string[];
}

export interface TotemEmblem {
  kind: "animal" | "plant" | "object" | "element" | "other";
  name: LocalizedText[];
  symbolism: string[];
}

export interface Clan {
  id: string;
  names: LocalizedText[];
  emblem: TotemEmblem;
  descent: "matrilineal";
  scope: { origin: { ethnicGroup: "Aawambo"; region: "northern Namibia and southern Angola" }; appliesTo: string[] };
  description: string;
  /** Owner's own practice notes, shown as such. Empty for clans the owner does not belong to. */
  dailyIntegration: string[];
  relatedKnowledgeIds: string[];
  accessTier: AccessTier;
  verification: VerificationStatus;
  provenance: Provenance;
  note?: string;
}

// ---- shared provenance fragments -------------------------------------------------------

const SRC = {
  omutumwa: "Shivute Kaapanda, 'Aawambo clans and their totems', Omutumwa News Online, 6 Oct 2021",
  newEra: "Shivute Kaapanda, 'Totems are key to restoration of lost identities', New Era, 6 May 2016",
  guide: "'Aawambo Clans — Illustrated Totem Guide', anonymous sheet circulated on WhatsApp (2026)",
  rodin: "R. J. Rodin, The Ethnobotany of the Kwanyama Ovambos (Missouri Botanical Garden, 1985)",
  wiki: "Wikipedia, 'Ovambo people' (royal clans; citing Tirronen, ELCIN 1986)",
  asante: "M. K. Asante, 'Ovambo', Encyclopedia of African Religion (2009)",
  owner: "Owner confirmation, H. N. Aluvilu (2026-11-01)",
};

const SCOPE = { origin: { ethnicGroup: "Aawambo" as const, region: "northern Namibia and southern Angola" as const }, appliesTo: ["Aawambo"] };

const published = (...attrs: string[]): Provenance => ({
  sourceType: "published",
  attribution: attrs.join("; "),
  consent: "not-required",
});

const communityContrib = (...attrs: string[]): Provenance => ({
  sourceType: "community-contrib",
  attribution: attrs.join("; "),
  consent: "not-required",
});

// ---- clans -------------------------------------------------------------------------------

export const clans: Clan[] = [
  {
    id: "aakwanambwa",
    names: [
      { lang: "ng", text: "Aakwanambwa" },
      { lang: "ng", text: "Aakwanghwiyo", dialect: "unknown", orthographyNote: "gh spelling (Kaapanda 2021)" },
      { lang: "ng", text: "Aakwankwiyo", dialect: "unknown", orthographyNote: "k spelling (totem guide)" },
      { lang: "ng", text: "Aakwangondo" },
    ],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Dog" }], symbolism: ["Loyalty", "Resilience", "Protection", "Guardianship"] },
    descent: "matrilineal",
    scope: SCOPE,
    description:
      "Clan with the Dog totem. Attested in two independent published lists. The spellings Aakwanghwiyo and Aakwankwiyo are dialect variants from different Aawambo sub-groups, not competing claims.",
    dailyIntegration: [
      "Morning acknowledgment of Aakwanambwa for protection and loyalty in daily work and family (owner's practice).",
      "Offer water or a simple acknowledgment when facing challenges or seeking strength (owner's practice).",
    ],
    relatedKnowledgeIds: ["aawambo-clan-totem-system", "matrilineal-descent-and-inheritance"],
    accessTier: "public",
    verification: "owner-reviewed",
    provenance: { ...published(SRC.omutumwa, SRC.guide), reviewedBy: ["H. N. Aluvilu"] },
    note: "Owner's maternal clan.",
  },
  {
    id: "aakwanambuba",
    names: [
      { lang: "ng", text: "Aakwanambuba" },
      { lang: "ng", text: "Aakwaniilya" },
      { lang: "ng", text: "Aakwanailya", orthographyNote: "spelling in New Era 2016" },
      { lang: "ng", text: "Aakwaudimbe" },
    ],
    emblem: { kind: "plant", name: [{ lang: "en", text: "Millet (mahangu)" }, { lang: "kwn", text: "omahangu", dialect: "Oshikwanyama" }], symbolism: ["Abundance", "Nourishment", "Growth", "Sustenance"] },
    descent: "matrilineal",
    scope: SCOPE,
    description:
      "Clan with the pearl-millet totem, the staple grain of the Aawambo. Attested in three independent lists. The name Omukwambuve from earlier personal notes is not in any published list and is not merged here.",
    dailyIntegration: [
      "Gratitude at meals for mahangu as the source of sustenance (owner's practice).",
      "Acknowledge provision and growth for family and community (owner's practice).",
    ],
    relatedKnowledgeIds: ["aawambo-clan-totem-system", "mahangu-and-the-aawambo-table"],
    accessTier: "public",
    verification: "owner-reviewed",
    provenance: { ...published(SRC.omutumwa, SRC.newEra, SRC.guide), reviewedBy: ["H. N. Aluvilu"] },
    note: "Owner's paternal clan.",
  },
  {
    id: "aatundu",
    names: [{ lang: "ng", text: "Aatundu" }, { lang: "ng", text: "Aakwaluvala" }, { lang: "kwn", text: "Ovakuanavala", dialect: "Oshikwanyama", orthographyNote: "Rodin 1985 spelling" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Zebra" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Zebra totem. Named among the royal clans from which chiefs could be chosen through the maternal line. In Kwanyama tradition one of the clans that joined the westward migration.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system", "matrilineal-descent-and-inheritance"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.omutumwa, SRC.newEra, SRC.guide, SRC.rodin, SRC.wiki),
  },
  {
    id: "aakwanangobe",
    names: [{ lang: "ng", text: "Aakwanangobe" }, { lang: "ng", text: "Aakwanangombe", orthographyNote: "New Era 2016" }, { lang: "ng", text: "Aakwamwenyo" }, { lang: "ng", text: "Aakwamayulu" }, { lang: "kwn", text: "Ovakuanangobe", dialect: "Oshikwanyama", orthographyNote: "Rodin 1985" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Cattle" }], symbolism: ["Wealth", "Provision"] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Cattle totem — 'people of the cattle'. In Kwanyama tradition the clan that led the branch which became the Ovakwanyama.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.omutumwa, SRC.newEra, SRC.guide, SRC.rodin),
  },
  {
    id: "aakwamandjila",
    names: [{ lang: "ng", text: "Aakwamandjila" }, { lang: "ng", text: "Aakwamalanga" }, { lang: "ng", text: "Aakwamhalanga", orthographyNote: "totem guide" }, { lang: "ng", text: "Aakwatembu" }, { lang: "ng", text: "Aakwathika" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Elephant" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Elephant totem. Named among the royal clans.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.omutumwa, SRC.newEra, SRC.guide, SRC.wiki),
  },
  {
    id: "aakuusinda",
    names: [{ lang: "ng", text: "Aakuusinda" }, { lang: "ng", text: "Aakwausinda", orthographyNote: "New Era 2016" }, { lang: "ng", text: "Aakwaanyoka" }, { lang: "ng", text: "Aakwamuhanga" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Snake" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Snake totem. Named among the royal clans.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.omutumwa, SRC.newEra, SRC.guide, SRC.wiki),
  },
  {
    id: "aakwanekamba",
    names: [{ lang: "ng", text: "Aakwanekamba" }, { lang: "ng", text: "Aakwanamakunde" }, { lang: "ng", text: "Aakwashiteko" }, { lang: "ng", text: "Aakwaniilwa" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Hyena" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Hyena totem. Described in published sources as the royal family from which kings were chosen. The name Aakwaniilwa is also listed under the Lion clan; the owner notes that one name can be carried by more than one clan, pending elders' confirmation.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system", "matrilineal-descent-and-inheritance"],
    accessTier: "public",
    verification: "disputed",
    provenance: published(SRC.omutumwa, SRC.guide, SRC.wiki, SRC.asante, SRC.owner),
    note: "Aakwaniilwa appears under Hyena and Lion.",
  },
  {
    id: "aakwaanime",
    names: [{ lang: "ng", text: "Aakwaanime" }, { lang: "ng", text: "Aakwashitha" }, { lang: "ng", text: "Aakwaniilwa" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Lion" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Lion totem. Named among the royal clans. Shares the name Aakwaniilwa with the Hyena clan; see note.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "disputed",
    provenance: published(SRC.guide, SRC.wiki, SRC.owner),
    note: "Aakwaniilwa appears under Hyena and Lion.",
  },
  {
    id: "aakwahepo",
    names: [{ lang: "ng", text: "Aakwahepo" }, { lang: "ng", text: "Aakwambahu" }, { lang: "ng", text: "Akwambahu", orthographyNote: "as printed in Omutumwa 2021" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Locust" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Locust totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.omutumwa, SRC.guide),
  },
  {
    id: "aakwanahungi",
    names: [{ lang: "ng", text: "Aakwanahungi" }, { lang: "ng", text: "Aakwanayuma" }, { lang: "ng", text: "Aakwanamatsi" }, { lang: "kwn", text: "EkuannaXungi", dialect: "Oshikwanyama", orthographyNote: "Rodin 1985 transcription" }],
    emblem: { kind: "object", name: [{ lang: "en", text: "Clay pot" }], symbolism: ["Memory", "Keeping"] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Clay-pot totem (one source gives calabash). Also remembered as 'they who converse by night' — the clan responsible for keeping the people's history and tradition in Kwanyama accounts.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.omutumwa, SRC.guide, SRC.rodin, SRC.owner),
  },
  {
    id: "aakwanghala",
    names: [{ lang: "ng", text: "Aakwanghala" }, { lang: "ng", text: "Aakuuta" }, { lang: "ng", text: "Aakwanafudhi" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Mongoose" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Mongoose totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source; elder confirmation needed.",
  },
  {
    id: "aakwashidila",
    names: [{ lang: "ng", text: "Aakwashidila" }, { lang: "ng", text: "Aakwalukuwo" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Bird" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Bird totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source. Compare Aakwalukwo (Fish) — possible duplicate.",
  },
  {
    id: "aakwahongo",
    names: [{ lang: "ng", text: "Aakwahongo" }, { lang: "ng", text: "Aahongo" }, { lang: "kwn", text: "Ovakuahongo", dialect: "Oshikwanyama", orthographyNote: "Rodin 1985" }],
    emblem: { kind: "plant", name: [{ lang: "en", text: "Tree" }], symbolism: ["Craft"] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Tree totem; in Kwanyama tradition 'the wood carvers', one of the clans of the westward migration.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.guide, SRC.rodin),
  },
  {
    id: "aakwanangandu",
    names: [{ lang: "ng", text: "Aakwanangandu" }, { lang: "ng", text: "Aakwanaifeta" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Crocodile" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Crocodile totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source; elder confirmation needed.",
  },
  {
    id: "aakwanadi",
    names: [{ lang: "ng", text: "Aakwanadi" }, { lang: "ng", text: "Aakwananzi" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Sheep" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Sheep totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source; elder confirmation needed.",
  },
  {
    id: "aakwanaidi",
    names: [{ lang: "ng", text: "Aakwanaidi" }, { lang: "ng", text: "Aakwambindangolo" }],
    emblem: { kind: "plant", name: [{ lang: "en", text: "Grass" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Grass totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source; elder confirmation needed.",
  },
  {
    id: "aakwamhani",
    names: [{ lang: "ng", text: "Aakwamhani" }, { lang: "ng", text: "Aalamba" }],
    emblem: { kind: "element", name: [{ lang: "en", text: "Rain" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Rain totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source; elder confirmation needed.",
  },
  {
    id: "aakwanyati",
    names: [{ lang: "ng", text: "Aakwanyati" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Buffalo" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Buffalo totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source; elder confirmation needed.",
  },
  {
    id: "aakwalukwo",
    names: [{ lang: "ng", text: "Aakwalukwo" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Fish" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Fish totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
    note: "Single source. Compare Aakwalukuwo (Bird) — possible duplicate.",
  },
  {
    id: "aakwanakalimba",
    names: [{ lang: "ng", text: "Aakwanakalimba" }],
    emblem: { kind: "animal", name: [{ lang: "en", text: "Rabbit" }], symbolism: [] },
    descent: "matrilineal",
    scope: SCOPE,
    description: "Clan with the Rabbit totem.",
    dailyIntegration: [],
    relatedKnowledgeIds: ["aawambo-clan-totem-system"],
    accessTier: "public",
    verification: "draft",
    provenance: published(SRC.newEra),
    note: "Single source (New Era 2016), not in the totem guide.",
  },
];

// ---- glossary stubs (move to content/glossary/) -------------------------------------------

export const glossary = [
  {
    id: "ezimo",
    term: [{ lang: "ng", text: "ezimo" }, { lang: "ng", text: "omazimo", orthographyNote: "plural" }],
    gloss: "Clan — specifically the matrilineal clan or lineage a person belongs to through the mother.",
    accessTier: "public",
    verification: "owner-reviewed",
    provenance: { sourceType: "family-notes", attribution: SRC.owner, consent: "not-required" },
  },
  {
    id: "oshizimo",
    term: [{ lang: "ng", text: "oshizimo" }],
    gloss: "Totem / emblem — the living thing or object a clan is identified with (as used in the circulated totem guide).",
    accessTier: "public",
    verification: "draft",
    provenance: communityContrib(SRC.guide),
  },
];

// Unresolved, NOT seeded: "Omukwambuve" (earlier personal notes); "Aakwashikolowala" (New Era, gloss unclear).
