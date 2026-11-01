// Seed data for Omhepo AIIK prototype
// AIIK means: Ancestral Intelligence Indigenous Knowledge
// Updated after Claude review (2026-11-01)
// Clan names confirmed from Omutumwa News Online (Shivute Kaapanda, 6 Oct 2021)
// Nguni/isiZulu learning material is NOT included as Aawambo content

export const clans = [
  {
    id: "aakwanambwa",
    names: ["Aakwanambwa", "Aakwanghwiyo"],
    emblem: {
      kind: "animal",
      name: "Dog",
      symbolism: ["Loyalty", "Resilience", "Protection", "Guardianship"]
    },
    descent: "matrilineal",
    description: "Maternal clan with the Dog totem. One of the prominent Aawambo clans used for maternal lineage identification. Confirmed names from published Namibian sources.",
    dailyIntegration: [
      "Acknowledge the presence of Aakwanambwa/Aakwanghwiyo for protection and loyalty.",
      "Offer water or simple acknowledgment when facing challenges."
    ],
    origin: { ethnicGroup: "Aawambo", region: "northern Namibia" },
    appliesTo: ["Aawambo", "Ombalantu"],
    accessTier: "public",
    verification: "owner-reviewed",
    provenance: {
      sourceType: "published",
      attribution: "Omutumwa News Online — ‘Aawambo clans and their totems’ (Shivute Kaapanda, 6 Oct 2021); owner confirmation of maternal line",
      consent: "not-required"
    }
  },
  {
    id: "aakwanambuba",
    names: ["Aakwanambuba", "Aakwaniilya"],
    emblem: {
      kind: "plant",
      name: "Millet",
      symbolism: ["Abundance", "Nourishment", "Growth", "Sustenance"]
    },
    descent: "matrilineal",
    description: "Clan with the Millet (mahangu) totem. Confirmed from published Namibian sources as Aakwanambuba/Aakwaniilya. Note: Omukwambuve from earlier personal notes is not in the published lists and requires clarification.",
    dailyIntegration: [
      "Gratitude practice tied to meals and mahangu/millet as source of sustenance.",
      "Acknowledge provision and growth for family and community."
    ],
    origin: { ethnicGroup: "Aawambo", region: "northern Namibia" },
    appliesTo: ["Aawambo"],
    accessTier: "public",
    verification: "draft",
    provenance: {
      sourceType: "published",
      attribution: "Omutumwa News Online — ‘Aawambo clans and their totems’ (Shivute Kaapanda, 6 Oct 2021). Omukwambuve pending clarification.",
      consent: "not-required"
    }
  }
];

export const knowledge = [
  {
    id: "aawambo-clans-totems",
    category: "lineage-history",
    title: "Aawambo Clans and Totems",
    summary: "The clan and totem system is the primary tool of maternal lineage identification among Aawambo people.",
    body: `The longest and most powerful tool of identification among the Aawambo people is the clan and totem. One is born from two clans — maternal and paternal.

Confirmed prominent clans and totems (from Omutumwa News Online, 2021):
- Aatundu / Aakwaluvala — Zebra
- Aakuusinda / Aakwaanyoka — Snake
- Aakwamandjila / Aakwamalanga — Elephant
- Aakwanangobe / Aakwamwenyo — Cow
- Aakwanekamba / Aakwanamakunde — Hyena
- Akwambahu / Aakwahepo — Locust
- Aakwanambwa / Aakwanghwiyo — Dog
- Aakwanamatsi / Aakwanahungi — Calabash
- Aakwanambuba / Aakwaniilya — Millet

These names are used across Aawambo sub-groups (Aandonga, Aakwambi, Aambalantu/Ombalantu, Aangandjera, Aakwaluudhi, Ovakwanyama, and others).`,
    accessTier: "public",
    verification: "draft",
    provenance: {
      sourceType: "published",
      attribution: "Omutumwa News Online (Shivute Kaapanda, 6 Oct 2021); New Era article on totems and identity",
      consent: "not-required"
    },
    scope: {
      origin: { ethnicGroup: "Aawambo", region: "northern Namibia" },
      appliesTo: ["Aawambo"]
    }
  },
  {
    id: "uukwambi-succession-notes",
    category: "lineage-history",
    title: "Uukwambi Matrilineal Succession (Oral-History Notes)",
    summary: "Selected notes on matrilineal succession and clan shifts in Uukwambi.",
    body: `Among Aawambo societies, succession was traditionally matrilineal. The Uukwambi notes describe early Aakwankala rulers and a later transfer of kingship via lobola to the Aakwaniilwa line. This remains personal research synthesis and requires verification.`,
    accessTier: "public",
    verification: "draft",
    provenance: {
      sourceType: "family-notes",
      attribution: "Personal research notes (Omhepo group, 2026); oral-history synthesis, not yet verified",
      consent: "not-required"
    },
    scope: {
      origin: { ethnicGroup: "Aawambo", region: "Uukwambi (primarily Omusati)" },
      appliesTo: ["Aakwambi"]
    }
  }
];

// Cross-cultural learning material (Nguni/isiZulu from TikTok) is intentionally excluded from public seed.
// Any future inclusion must carry crossCultural: true and explicit origin marking.
