# 08 — Variant C: Engineering Editorial Sheet

**What to build:** Asymmetric editorial layout combining engineering-
drawing conventions with international-brand editorial typography — not
a standard centered/split layout. Headline spans columns 1–8. Two
irregular Cutaway Windows. DatumOrigin as the layout's literal
typographic origin point. Technical data forms a distinct second
information layer, not a card grid. Mobile: keeps the large headline, one
primary Cutaway (not both), technical data compressed to a single row —
not all desktop microcopy stacked vertically.

**File scope:**
`src/pages/internal-preview/cc02-hero/variant-c.astro` only (plus the
shared copy module, read-only).

**Blocked by:** Ticket 05.

**Status:** done

- [x] Layout is genuinely asymmetric — verified by measuring the actual
      rendered column spans, not just claimed in prose.
- [x] Uses `src/components/brand/CutawayWindow.astro` for both desktop
      Cutaway Windows and `DatumOrigin.astro` as the layout anchor.
- [x] Does not resemble a SaaS dashboard (no card-grid metric tiles).
- [x] Uses the shared bilingual copy verbatim; primary CTA renders the new
      Action Token.
- [x] Mobile keeps exactly one Cutaway Window, not two.
- [x] Information-reading-speed is deliberately controlled (checked in the
      Impeccable review's 5-second-comprehension pass) — this variant's
      known risk is over-designing past legibility.
- [x] No Higgsfield used.
