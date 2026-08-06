# CC-02I-06 — Motion Orchestrator and Performance Verification

## Revision note (R1)

Revision 1 per ChatGPT's REVISE AND RESUBMIT finding. Changes from the
original: resolves the contradiction between "Hero ships no JS" and "five
components animate in a synchronized narrative" by introducing a single,
named Motion Orchestrator owned by `Hero.astro` (R1-06) — one
`IntersectionObserver`, one state machine, no child component creates its
own observer. Performance acceptance criteria are now numeric and
reproducible (R1-11), replacing vague language ("small enough," "does not
regress," "0 CLS," "meaningfully") with actual baseline-derived
thresholds. Fixes the "Lighthouic" typo.

## 1. Ticket ID

CC-02I-06

## 2. Title

Hero Motion Orchestrator implementation and numeric performance verification

## 3. Purpose

CC-02I-04/05 assemble the Hero's structure and components; this ticket
builds the actual Motion Orchestrator — the single piece of JavaScript
that drives the five-step animation narrative (Datum Origin → axis →
modules align → vision lock → rail completes) — and verifies the Hero
meets numeric, reproducible performance budgets on the real production
page.

## 4. Dependencies

CC-02I-04, CC-02I-05 (both must be complete — this ticket adds the
orchestrator script to the already-assembled Hero, it does not build new
visual components).

## 5. Allowed paths

- `src/components/sections/Hero.astro` (orchestrator script + state
  wiring)
- `src/components/sections/PrecisionSystemVisual.astro` (CSS response to
  `data-motion-state`, if not already complete from CC-02I-05)
- `src/components/sections/ProcessRail.astro` (same)
- `tests/e2e/cc02i-motion.spec.ts` (new)

## 6. Forbidden paths

- `src/data/locales/**`
- `src/config/**`
- `src/pages/**` (structural changes belong to CC-02I-04, not this ticket)
- `src/components/brand/**`
- `public/**`

## 7. Expected files

- Modified: `Hero.astro` (adds the orchestrator `<script>`)
- Possibly modified: `PrecisionSystemVisual.astro`, `ProcessRail.astro`
  (CSS-only, responding to orchestrator-set state)
- New: `tests/e2e/cc02i-motion.spec.ts`

## 8. Implementation requirements

### Motion Orchestrator architecture (R1-06 — fixed, mandatory design)

`Hero.astro` owns a single, minimal vanilla-JavaScript orchestrator:

- **One Hero Root state machine.** A single root element (the `<section>`
  or top-level wrapper `Hero.astro` renders) carries a
  `data-motion-state` attribute with exactly one of four values:

  | State | Meaning |
  |---|---|
  | `settled` | Default. No animation has run or will run. All child elements render their fully-complete visual end state immediately. |
  | `armed` | JavaScript has loaded, `prefers-reduced-motion` is NOT set, and the Hero has entered (or is about to enter) the viewport — the orchestrator is about to start the narrative. |
  | `running` | The five-step narrative is actively playing. |
  | `complete` | The narrative has finished. Visually identical to `settled`'s end state, but reachable only after `running` — distinguishes "never animated" from "finished animating," which matters only for internal bookkeeping (e.g. guaranteeing the narrative never re-triggers), not for any visual difference. |

- **One `IntersectionObserver`**, created once, attached to the Hero root.
  No child component (`PrecisionSystemVisual`, `ProcessRail`) creates its
  own observer — both existing CC-02F-era independent-observer patterns
  are removed/not reused in production. The observer fires the
  `settled → armed → running` transition exactly once; after it fires
  once (or after the Hero starts in `complete`/`settled` for any reason),
  the observer is disconnected — the narrative never re-triggers on
  repeated scroll-into-view.
- **State propagation**: the orchestrator sets `data-motion-state` on the
  Hero root only. Every child component (`DatumOrigin` internally,
  `PrecisionSystemVisual`, `ProcessRail`) reads that single ancestor
  attribute via CSS descendant selectors (`[data-motion-state="running"]
  .some-child-selector { ... }`) to time its own visual sub-steps via
  `animation-delay`/`transition-delay` — no child component has its own
  JS-driven state, only CSS that reacts to the shared root attribute.
- **Trigger**: viewport intersection (Hero root crosses into view),
  matching the existing `IntersectionObserver` convention already used by
  `VisionLockFrame`/`DatumOrigin` elsewhere in the codebase — but
  centralized to one instance for the whole Hero, not one per primitive.
- **Delay/Duration**: the five-step narrative (Datum Origin appears →
  axis expands → modules align along Assembly Spine → Vision Frame locks
  → Process Rail completes) totals ~800–1100ms, using existing
  `--duration-section`/`--duration-ui` tokens and their existing
  `animation-delay` stagger values from the CC-02F prototype design — no
  new duration/easing token.
- **Reduced motion**: `window.matchMedia('(prefers-reduced-motion:
  reduce)').matches` is checked once, before the observer is even
  created. If true, the Hero root is set directly to `data-motion-state=
  "settled"` and the `IntersectionObserver` is never created at all — not
  created-then-immediately-disconnected, never created.
- **No-JS fallback**: the Hero root's default HTML (no `data-motion-state`
  attribute, or explicitly `data-motion-state="settled"` set server-side)
  renders the fully-settled end state via CSS alone (`[data-motion-state
  ="settled"], :root:not([data-motion-state])` selectors, or equivalent) —
  H1, Body, CTA, and the Primary/Secondary Visual are never hidden,
  dimmed, or displaced waiting for JavaScript to execute.
- **Failure fallback**: if `IntersectionObserver` is unavailable in the
  browser (matching the existing fallback pattern used elsewhere in the
  codebase), the Hero root stays at `settled` — same behavior as reduced
  motion, no narrative plays, no error.
- **Prohibited**: looping, re-triggering on repeated scroll-into-view,
  blocking H1/Body/CTA interactivity or focus during `running`.

### Numeric performance criteria (R1-11 — fixed, mandatory thresholds)

Baseline capture and comparison methodology:

- **Baseline capture timing**: capture the "before" baseline immediately
  before this ticket's changes are applied (i.e. on the Hero produced by
  CC-02I-04/05, before the orchestrator script is added), on the same
  machine/browser/build used for the "after" measurement in this same
  ticket run — not a historical or cached number from an earlier ticket.
- **Environment**: `astro build && astro preview`, Chromium (matching the
  project's existing Playwright default browser), no network throttling
  applied beyond Lighthouse's own default mobile/desktop presets, same
  machine for both before/after runs within one ticket execution.
- **Lighthouse runs**: 3 runs per condition (before/after × mobile/
  desktop = 4 conditions × 3 runs = 12 total runs), using the **median**
  of the 3 runs per condition — a single-run number is never reported as
  the result, since Lighthouse scores vary run-to-run.
- **Acceptable Performance Score delta**: the after-median Performance
  score must not be more than **5 points** below the before-median score,
  on both mobile and desktop. A drop of ≤5 points is accepted as normal
  run-to-run variance plus the cost of the new Hero content; a drop of
  >5 points fails this ticket's acceptance criteria and must be
  investigated (either fixed, or explicitly justified and escalated to
  Stage Gate — not silently accepted).
- **LCP threshold**: after-median LCP must be ≤2.5s on mobile (Lighthouse
  mobile preset), matching the standard "Good" Core Web Vitals threshold.
  If the LCP element is the new inline SVG rather than the H1 text (see
  CC-02I-04's LCP-element note), this threshold still applies — it does
  not get a separate, looser bar just because the element changed.
- **CLS threshold**: after-median CLS must be **≤0.02** (not "0," which is
  an unrealistic bar for any page with web fonts; not "no regression,"
  which is unmeasurable without a number). 0.02 is comfortably inside the
  "Good" Core Web Vitals band (<0.1) with margin for real-world
  measurement noise.
- **New JS bytes**: the orchestrator script's total size, measured both
  raw and gzip, must be recorded in completion evidence. No fixed cap is
  set (the script is inherently minimal — one observer, one state
  machine — so a numeric cap is unlikely to bind), but the raw/gzip byte
  count itself is mandatory evidence, not optional.
- **Inline SVG bytes**: `PrecisionSystemVisual`'s SVG payload size (raw
  and gzip-equivalent, i.e. as it would compress within the HTML
  response) must be recorded in completion evidence, compared against the
  CC-02F prototype's own SVG size (from CC-02I-05's completion evidence)
  — flag, don't silently accept, any increase greater than 20% over the
  prototype's reference size.
- **HTML payload delta**: total homepage HTML size (both locales) before
  vs. after this ticket, raw and gzip, recorded in completion evidence.
- **Motion duration tolerance**: the five-step narrative's actual measured
  total duration (via Playwright timing, not eyeballing) must fall within
  **800–1100ms ±50ms** (i.e. 750–1150ms is the accepted measured range,
  accounting for CI/measurement jitter around the spec's 800–1100ms
  target).

## 9. Design requirements

None beyond what CC-02I-04/05 already specified — this ticket implements
the orchestrator's timing/state logic and verifies the numeric result, it
does not introduce new visual design.

## 10. Accessibility requirements

- Full three-layer reduced-motion defense verified on the *assembled*
  Hero: `tokens.css` global duration-zero, each component's CSS response
  to `data-motion-state="settled"`, and the orchestrator's own
  `matchMedia` check that skips creating the observer entirely — test via
  Playwright `browser.newContext({ reducedMotion: 'reduce' })`, confirming
  the root's `data-motion-state` is `settled` immediately and no
  `IntersectionObserver` fires.
- No animation blocks keyboard focus from reaching the CTAs or Process
  Rail during the `running` state.
- CTAs and all primary content are interactive and visible from first
  paint regardless of `data-motion-state` — verified by attempting focus/
  click on the Primary CTA immediately after page load, before the
  narrative would have completed.

## 11. Performance requirements

This entire ticket's §8 "Numeric performance criteria" section *is* the
performance requirement.

## 12. Locale requirements

Run all motion/performance checks on both `/zh-tw/` and `/en/` — text
length differences can affect layout timing/CLS differently per locale;
report both locales' numbers separately in completion evidence, not just
one.

## 13. Tests

- New `tests/e2e/cc02i-motion.spec.ts`: asserts the four-state machine
  (`settled`/`armed`/`running`/`complete`) transitions correctly; asserts
  exactly one `IntersectionObserver`-driven trigger (no re-trigger on
  scroll away and back); asserts CTA interactivity during `running`;
  asserts reduced-motion context yields immediate `settled` with no
  observer created (verify via a page-injected instrumentation flag or
  equivalent, not just visual inspection); asserts total narrative
  duration falls in the 750–1150ms accepted range.
- Lighthouse runs per §8's methodology — recorded, not just eyeballed.

## 14. Acceptance criteria

- [ ] `Hero.astro` implements exactly one `IntersectionObserver`, exactly
      one `data-motion-state` root attribute, four states as specified.
- [ ] No child component (`PrecisionSystemVisual`, `ProcessRail`) creates
      its own `IntersectionObserver` in production.
- [ ] Reduced motion: observer is never created, root state is `settled`
      immediately, verified via Playwright context.
- [ ] No-JS/default state renders the fully-settled end state — H1, Body,
      CTA, Primary/Secondary Visual are never hidden or displaced.
- [ ] CTAs are clickable/focusable from first paint, regardless of motion
      state.
- [ ] Narrative never re-triggers on repeated scroll-into-view.
- [ ] Measured narrative duration: 750–1150ms, both locales.
- [ ] Performance Score delta: ≤5 points below baseline, mobile and
      desktop, median-of-3.
- [ ] LCP: ≤2.5s mobile, median-of-3.
- [ ] CLS: ≤0.02, median-of-3.
- [ ] All numeric results (Lighthouse scores, LCP, CLS, JS bytes, SVG
      bytes, HTML delta) recorded in completion evidence — not
      characterized only in prose.

## 15. Completion evidence

- Full Lighthouse before/after tables (3 runs each × mobile/desktop,
  median highlighted), both locales.
- Motion Orchestrator state-transition test output.
- Reduced-motion Playwright test output.
- JS/SVG/HTML byte-size tables (raw + gzip).
- LCP element identification (confirmed, not assumed).

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) reports the actual measured
numbers from §8/§14 — every numeric acceptance criterion gets its actual
measured value in the handoff, not just a pass/fail checkbox.

## 17. Rollback/failure conditions

If the measured Performance Score delta exceeds 5 points and cannot be
brought back into range without a design change outside this ticket's
scope (e.g. the SVG itself needs simplifying, which is CC-02I-05's
territory), do not silently accept the regression — stop, document the
actual delta and its likely cause, and flag it for Stage Gate rather than
lowering the threshold unilaterally. If the 750–1150ms duration range is
consistently missed due to real device/CI timing variance rather than an
implementation bug, record the measured distribution and flag the
tolerance itself (not the implementation) as a possible spec adjustment
for the next revision — do not silently widen it in this ticket.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend the agent with Playwright/Lighthouse tooling
familiarity if there's a meaningful difference in tooling access between
the two worktrees at ticket-claim time.

## 20. Estimated risk

Medium-high. The Motion Orchestrator is new architecture (not a relocation
of existing code), and the numeric performance thresholds are a genuinely
higher bar than the original ticket's qualitative language — this ticket
carries real risk of a first-pass measurement miss that requires
iteration, which is expected and budgeted for, not a sign of a bad spec.
