# 07 — Variant B: Full-width Precision Stage

**What to build:** Near-full-width visual "stage" Hero with copy in a
lower-left/lower-center safe zone, a Datum Axis spanning the full Hero
width, deep-ink/warm-paper material layering, Header able to overlay the
Hero with a contrast-stable treatment. Mobile: a cropped module detail
(not a shrunk full-width image), copy on its own background block, image
never crowding the CTAs.

**File scope:**
`src/pages/internal-preview/cc02-hero/variant-b.astro` only (plus the
shared copy module, read-only).

**Blocked by:** Ticket 05.

**Status:** done

- [x] Visual reads as a real material/product "stage," not an abstract
      gradient — built from existing Brand Primitives + CSS (no
      Higgsfield/CGI generated this round; the asset plan documents what
      a production version would eventually need).
- [x] Header-over-Hero contrast verified with a real contrast check at the
      overlaid position, not assumed.
- [x] Uses the shared bilingual copy verbatim; primary CTA renders the new
      Action Token.
- [x] Mobile crops rather than shrinks; CTAs never visually blocked by
      imagery.
- [x] Documents (in the Impeccable review / asset plan) that a production
      version of this direction has the highest future asset/CGI
      requirement of the three variants — an honest cost callout, not
      hidden.
- [x] No Higgsfield used.
