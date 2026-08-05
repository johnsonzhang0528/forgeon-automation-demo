# 05 — Prototype route infrastructure

**What to build:** The shared scaffolding all three Hero/Header variants
sit on: `src/pages/internal-preview/cc02-hero/{index,variant-a,variant-b,
variant-c}.astro`, plus a shared, byte-identical bilingual copy module so
no variant can silently drift its own copy.

**File scope:** `src/pages/internal-preview/cc02-hero/index.astro`,
`src/pages/internal-preview/cc02-hero/_shared/copy.ts` (or equivalent
shared-copy module), `scripts/check-locale-routes.mjs`/sitemap generation
if either needs an explicit preview-route exclusion (verify first — the
existing `/internal-preview/design-system/` precedent may already exclude
the whole `internal-preview/` tree by convention).

**Blocked by:** None — variant tickets 06/07/08 depend on this.

**Status:** done

- [x] All four pages carry `<meta name="robots" content="noindex, nofollow">`.
- [x] None of the four pages appear in `sitemap.xml`.
- [x] None of the four pages is linked from real site nav
      (`src/config/nav.ts` untouched).
- [x] No `AnalyticsBridge`/GTM/analytics event wiring included on any of
      the four pages.
- [x] Shared bilingual copy module contains the spec §十二 text verbatim,
      character-for-character — imported by all three variants, not
      copy-pasted three times.
- [x] `index.astro` is a simple links-to-variants page, not itself a fourth
      design direction.
- [x] CSS scoped per-page (Astro's default component-scoped `<style>`) —
      no new global stylesheet edits.
- [x] No new runtime dependency added to `package.json`.
