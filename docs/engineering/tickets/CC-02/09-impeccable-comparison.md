# 09 — Impeccable comparison + internal scoring

**What to build:** Run Critique/Typeset/Layout/Adapt/Audit across all
three variants, produce `docs/engineering/reviews/CC-02-impeccable-hero-
review.md`, then score all three against the spec §十九 rubric (5-second
comprehension /20, brand fit /20, originality/memorability /20, desktop+
mobile completeness /15, performance+accessibility /15, maintainability
/10) with an internal recommendation, second choice, and rejected variant
— explicitly not a final decision.

**File scope:**
`docs/engineering/reviews/CC-02-impeccable-hero-review.md` (new). Reads
all three variant pages; does not modify them except for defects the
Impeccable pass itself finds and fixes within the same variant-file scope
already granted by tickets 06/07/08.

**Blocked by:** Tickets 06, 07, 08, and the screenshot set (produced
alongside this ticket, not a separate blocking ticket).

**Status:** done

- [x] All three variants scored on every rubric line with cited evidence
      (a screenshot path, a measured number, or a specific code
      reference) — not just adjectives.
- [x] Internal Recommendation + Second Choice + Rejected Variant stated
      explicitly, with the disclaimer that ChatGPT's review of the bundle
      makes the actual final call.
- [x] No variant is integrated into the production homepage as a result of
      this ticket, regardless of score.
- [x] Both locales, all three viewport classes, Header, contrast, motion,
      reduced motion, image safe zones, and long-English-text wrapping all
      explicitly checked per variant.
