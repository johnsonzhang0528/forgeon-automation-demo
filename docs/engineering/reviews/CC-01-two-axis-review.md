# CC-01 Two-Axis Code Review

Fixed point: `eadf381` (CC-00 baseline). Review endpoint: `21dd6bc` (CC-01
final commit). Diff: `git diff eadf381...21dd6bc` — 42 files changed, 3427
insertions(+), 182 deletions(-). Commits: `51bc472`, `0152609`, `21dd6bc`.
Spec source: `docs/engineering/specs/CC-01-verification-spec.md`. Standards
sources: `CLAUDE.md`, `CONTEXT.md`, `docs/agents/domain.md`, `DESIGN.md`,
`docs/DESIGN_SYSTEM.md`, `src/styles/tokens.css`, plus the fixed Fowler
smell baseline. Run via two parallel `general-purpose` sub-agents per
`.claude/skills/code-review/SKILL.md`'s process — findings below are kept
strictly separate per axis, not merged into one score.

---

## Standards

**Git Hygiene:** Good — three atomic, well-scoped commits (`51bc472`
tokens/fonts, `0152609` components/preview page, `21dd6bc` docs), each with
a clear conventional-commit message matching its content.

**Standards compliance overall: strong.** The six new Brand Primitives
consistently honor `CONTEXT.md`'s "is NOT" constraints (DatumOrigin's
asymmetric 38/62 arms avoid a crosshair reading, ToleranceBand has no
fill/progress animation, VisionLockFrame's lock-on is one-shot via
IntersectionObserver not a loop, ProcessStamp is a notched rectangle not a
seal silhouette, CutawayWindow uses `clip-path: polygon()` with an
`@supports` fallback per its documented cross-browser requirement). Color-
contrast fixes in `Button.astro`, `ProcessTimeline.astro`,
`SectionHeading.astro` correctly cite `docs/CONTRAST_AUDIT.md` ratios.
`prefers-reduced-motion` handling present and correct in every animated
component. i18n handling (`:lang(zh)` CJK font overrides, `--measure-zh`)
matches `DESIGN.md`'s stated intent. CSS scoping uses Astro's native scoped
`<style>` blocks throughout — no `:global()`/`::part()` leakage found.

**Finding S-1 (hard, low severity) — dead code.** `src/components/brand/DatumOrigin.astro:44`:
`uid` is generated (`Math.random().toString(36)`) and injected via
`define:vars` but never referenced anywhere in the component's CSS or
markup. Contrast with `VisionLockFrame.astro`/`AssemblySpine.astro`, where
the analogous `uid` is load-bearing (scopes the inline script's
`querySelector`). Pure waste, not a functional defect — the fix is a
one-line deletion.

**Finding S-2 (judgement call, low severity) — build reproducibility.**
All three `Math.random()` UID generators (DatumOrigin, VisionLockFrame,
AssemblySpine) make `astro build` output non-deterministic byte-for-byte
across runs. For VisionLockFrame/AssemblySpine the randomness is
functionally justified (per-instance DOM scoping for inline scripts) even
though a deterministic alternative (caller-supplied `id` prop, or scoping
via `closest()`/`currentScript` instead of a generated global ID) would
achieve the same uniqueness without the non-determinism. No repo doc takes
an explicit position on byte-reproducible builds, so this doesn't breach a
documented standard.

**Finding S-3 (informational).** No hard violations found against naming,
duplication (beyond the `stateLabel` map duplication noted in the
codebase-design review §4, which is a Standards-adjacent finding owned by
that document), module boundaries, Shotgun Surgery, Speculative
Generality, Primitive Obsession, over-commenting, accessibility, or i18n
mechanics (font cascade). Comments throughout — including the long ones in
`design-system.astro` and `Button.astro` — are substantive engineering
rationale tied to specific numbers/regressions (axe-core findings,
Playwright measurements), judged proportionate given this repo's
documented practice of recording decision rationale inline.

**Standards axis worst issue:** S-1 (dead code in DatumOrigin) — real but
trivial, one-line fix, no user-facing effect.

---

## Spec

**(a) Missing/partial requirements.**

1. Button "Focus Visible" state has no component-local rule in
   `Button.astro` — the spec checklist item "Six states implemented:
   Default / Hover / Focus Visible / Active / Disabled / Loading" is met
   functionally (global `:focus-visible` in `global.css:297` applies to
   `.btn`), but `Button.astro`'s own `<style>` block has explanatory
   comments for the other five states and none for Focus, making it look
   locally incomplete even though it isn't behaviorally incomplete.
   Judged non-blocking — the state genuinely works, verified live via
   Playwright keyboard-tab in prior QA (`docs/DATUM_QA.md`).

**(b) Scope creep.** None found. `git diff --stat` confirms zero touches
to `src/components/layout/Header.astro`, any `src/pages/*/index.astro`
(homepage), Hero, or any CC-02+-scoped file. Diff is contained to
`src/styles/{tokens,global,utilities}.css`, `src/components/brand/*`
(new), `src/components/ui/{Button,SectionHeading,ProcessTimeline}.astro`
(documented compat fixes), `src/layouts/BaseLayout.astro` (font preload
only), the new internal preview page, fonts, and docs.

**(c) Looks-done-but-verify.**

1. **Bilingual reusability — confirmed hardcoded Chinese, exactly the
   open question the verification spec flags.** `ProcessStamp.astro:41`
   unconditionally renders `流程狀態 · PROCESS STATUS` (literal, by explicit
   design per its own comment). `ToleranceBand.astro:60` hardcodes
   `示範數值 · Demo Data`. Neither is locale-neutral; an `/en/` page using
   either would show Chinese text with no prop to override it. This is a
   real gap against the spec's own dual-locale requirement, not a
   hypothetical — confirmed by reading the code, not by trusting the
   docs' framing.
2. Everything else checked out as claimed against the actual code (not
   just doc claims): 10 `@font-face` rules in `global.css`, all with
   `font-display: swap`; all six brand primitives exist; internal preview
   page has correct `noindex,nofollow` meta, exactly one real `<h1>`, and
   is absent from nav/sitemap; only Noto Sans TC 400 is preloaded;
   `SectionHeading`/`ProcessTimeline` token fixes match the two documented
   compat fixes exactly; `Button.astro` loading spinner exposes
   `aria-busy`/`aria-disabled` and honors reduced motion;
   `DatumOrigin`/`CutawayWindow` correctly avoid their banned visual
   patterns in the actual rendered code, not just in comments claiming so.

No evidence of regression in the three touched pre-existing components —
both non-Button changes are narrowly-scoped, single-line color-token
swaps matching their documented justification.

**Spec axis worst issue:** the bilingual-reusability gap (finding (c)#1) —
a real, verified gap against a stated requirement, not a missing-doc
technicality. Severity assessed in §八 below (disposition #1) — this is a
design-scope decision, not a small bug, so it is routed to the explicit
seven-question disposition list rather than auto-ticketed here.

---

## Cross-axis note (not a merged score — see below)

The two axes point at different things: Standards found the codebase
well-built with one trivial cleanup opportunity (S-1); Spec found one real
open requirement gap (bilingual reusability) that Standards' axis doesn't
independently surface because nothing about the code *violates a written
coding standard* by hardcoding Chinese — it violates the *feature
requirement* that the site be bilingual. This is exactly the axis-
separation value the two-axis method is for: a Standards-clean component
can still fail its Spec. Per `/code-review`'s own rule, these are **not**
combined into one score or one ranked list.
