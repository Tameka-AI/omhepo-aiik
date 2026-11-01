# Omhepo AIIK — Deterministic Refusal & Redirect Templates
**Used by:** `modules/chat` intent classifier & `modules/governance`
**Version:** 2026-11-01

---

## intent: ritual-howto
**Trigger examples:** "How do I perform a cleansing ritual?", "What are the steps for olufuko / efundula / oshilombe?", "How do I talk to my ancestors or light the sacred fire?"
**safetyNotice:** "Cultural Safety Boundary: Ritual protocols and ceremonial steps are held by living elders, families, and custodians."
**redirectEntryIds:** ["rites-of-the-life-cycle", "kalunga-and-the-sacred-fire"]

### Response Text
Omhepo AIIK shares the public history and cultural meaning of Aawambo traditions, but it never provides step-by-step instructions for performing rituals, ceremonies, initiations, or ancestral practices. 

In Aawambo tradition, ceremonial conduct belongs to families, traditional authorities, and living elders within the community concerned. You can explore the public outline of these traditions in our library entries on **Rites of the Life Cycle** (*efundula*, *olufuko*, *oshilombe*, and *okululo*) and **Kalunga and the Sacred Fire**, or speak directly with elders in your maternal and paternal clans (*omazimo*).

---

## intent: medical
**Trigger examples:** "What plant cures fever?", "How do I use marula or mopane as medicine?", "What is the traditional dosage for...", "I am having symptoms / dreams, am I being called?"
**safetyNotice:** "Wellbeing & Medical Boundary: Omhepo AIIK does not provide medical advice, herbal dosages, or spiritual diagnosis."
**redirectEntryIds:** ["mahangu-and-the-aawambo-table"]

### Response Text
Omhepo AIIK cannot provide medical advice, herbal remedies, plant dosages, physical treatments, or spiritual diagnoses. Generating health or diagnostic advice through an AI carries real risks of physical and spiritual harm.

For physical health concerns, please consult a qualified healthcare clinician. For questions involving traditional healing, please speak in person with a recognised elder or practitioner in your community. If you are interested in traditional Aawambo nourishment and staple foods, you can browse **Mahangu and the Aawambo Table** in the public library.

---

## intent: lineage-personal
**Trigger examples:** Queries asking for private family trees, living individuals' details, or unindexed family records.
**safetyNotice:** "Privacy & Lineage Boundary: Living individuals and private family genealogies are never indexed or shared publicly."
**redirectEntryIds:** ["aawambo-clan-totem-system", "matrilineal-descent-and-inheritance"]

### Response Text
To protect family privacy and community trust, Omhepo AIIK never indexes or shares records about living individuals or private family genealogies. 

You can use the **Naming One's People (Onboarding)** tool to record your own maternal and paternal *omazimo* privately on your own device (where it is never uploaded), or explore how kinship and succession work publicly in **The Aawambo Clan and Totem System** and **Matrilineal Descent and Inheritance**.

---

## intent: not-in-library
**Trigger condition:** `RetrievedChunk[]` is empty, lexical/hybrid score is below threshold, or post-generation check finds no `[source:` markers (`grounded: false`).
**safetyNotice:** "Not in the Omhepo Library Yet: This assistant answers only from verified and draft entries in the Omhepo AIIK library."
**redirectEntryIds:** ["aawambo-clan-totem-system", "aawambo-subgroups-and-dialects", "kalunga-and-the-sacred-fire"]

### Response Text
I don't have that in the Omhepo library yet. 

Because Omhepo AIIK is built to respect ancestral knowledge and provenance, this assistant answers only from sources documented in the Omhepo library and never guesses or invents traditions from general internet training. You can browse our current entries under **Omazimo (Clans)**, **Knowledge Library**, and **Glossary** as community and elder review continues.
