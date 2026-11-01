---
version: 1
rules:
  - intent: lineage-personal
    patterns:
      - '\b(private|unindexed|confidential)\b.{0,70}\b(family|genealog|lineage|person|records|notes)'
      - '\b(family tree|family genealogy|living individual|living person|living people|personal records)\b'
      - '\b(who|name|address|phone|details|records|show|find|reveal|tell)\b.{0,70}\bmy (mother|father|uncle|aunt|grandmother|grandfather|family|sister|brother|cousin)\b'
      - '\bmy (mother|father|uncle|aunt|grandmother|grandfather|family|sister|brother|cousin)\b.{0,70}\b(name|address|phone|details|records|tree|descendants)\b'
  - intent: out-of-scope
    patterns:
      - '\b(hiltunen|umndawu|wamanzi|ukuthwasa|icansi|ukuthobeka|amakhosi|abalozi|umuthi|eanekelo)\b'
      - '\b(ignore|override|disregard|bypass|reveal|print|leak)\b.{0,80}\b(instruction|system|guardrail|policy|safety|prompt|restriction|secret)'
      - '\b(system prompt|developer message|jailbreak|role.?play as an ancestor|channel.{0,20}ancestor)\b'
  - intent: medical
    patterns:
      - '\b(dosage|dose|doses|cure|cures|cured|treat|treatment|treatments|symptom|symptoms|diagnosis|diagnose|remedy|remedies|medicine|medicinal|poison|narcotic|narcotics|fever|illness|pregnant|pregnancy|pain|headache|sick)\b'
      - '\b(plant|herb|marula|mopane)\b.{0,80}\b(heal|healing|infection|blood|pressure|diabetes|disease)'
      - '\b(dream|dreams|vision|visions|calling|called)\b.{0,80}\b(ancestor|spirit|mean|interpret|diagnos|symptom|am i)'
      - '\b(interpret|am i|ancestral|spiritual|healing)\b.{0,70}\b(dream|dreams|vision|visions|calling|called|diagnosis)\b'
      - '\b(witchcraft|sorcery|witch.find|divination)\b'
  - intent: ritual-howto
    patterns:
      - '\b(how|step|steps|instruction|instructions|perform|conduct|ingredient|ingredients|recipe|materials|need|guide|teach|sequence|procedure|prepare|do)\b.{0,100}\b(ritual|rite|rites|ceremony|ceremonies|ceremonial|ancestor|ancestors|sacred fire|initiation|cleansing|offering|efundula|olufuko|oshilombe|okululo|prayer)\b'
      - '\b(ritual|rite|rites|ceremony|ceremonies|ceremonial|ancestor|ancestors|sacred fire|initiation|cleansing|offering|efundula|olufuko|oshilombe|okululo|prayer)\b.{0,100}\b(how|steps|instructions|perform|conduct|ingredients|recipe|materials|guide|procedure|prepare)\b'
      - '\b(talk|communicate|contact|invoke|summon|pray)\b.{0,65}\b(ancestor|ancestors|spirit|spirits|kalunga)\b'
      - '\b(light|tend|build|prepare)\b.{0,40}\bsacred fire\b'
      - '\b(offer water|ritual protocol|sacred protocol|ceremonial protocol)\b'
  - intent: smalltalk
    patterns:
      - '^(hello|hi|hey|good morning|good afternoon|good evening|thanks|thank you)[!. ]*$'
stopWords:
  - a
  - an
  - the
  - and
  - or
  - of
  - to
  - in
  - on
  - at
  - for
  - from
  - with
  - by
  - is
  - are
  - was
  - were
  - be
  - been
  - being
  - do
  - does
  - did
  - can
  - could
  - would
  - should
  - may
  - might
  - i
  - me
  - my
  - you
  - your
  - we
  - our
  - their
  - they
  - it
  - its
  - this
  - that
  - these
  - those
  - what
  - which
  - who
  - how
  - why
  - tell
  - explain
  - describe
  - about
  - know
  - learn
  - please
  - more
  - meaning
  - mean
  - means
  - role
  - significance
  - symbolism
  - represent
  - represents
  - definition
  - defined
  - difference
  - differences
  - between
  - source
  - sources
  - library
prefixes: [aa, a, omu, oshi, oma, e]
---

# Omhepo AIIK — Prototype Intent Rules

From: ChatGPT implementation · Date: 2026-11-01

These conservative, English-first rules apply the boundaries in the supplied
`refusals.md`. The classifier also reads that file's exact trigger examples,
response text, safety notices, and redirect entry IDs. These are prototype
heuristics, not a claim of comprehensive language understanding.

No new Oshiwambo phrases are composed. Cultural terms in patterns come from the
supplied project records. The public corpus is the second boundary: even an
unclassified query cannot access a private, community, or restricted body.

The final boundary is extractive output validation. The optional provider may
select exact public-source excerpts only; it cannot introduce its own claims.
