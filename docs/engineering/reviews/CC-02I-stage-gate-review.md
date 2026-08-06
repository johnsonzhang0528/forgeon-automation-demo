# CC-02I Stage Gate Review

Status: **Awaiting ChatGPT Stage Gate Review — Revision 1.**

**Superseded by Revision 1.** ChatGPT returned a **REVISE AND RESUBMIT**
verdict on the CC-02I-PREP bundle this document originally accompanied
(`20260806-085203-cc02i-prep-explicit-stage-gate.zip`). This document is
kept as the historical record of that first submission — it is not
rewritten to declare a different outcome. The current, active review is
`docs/engineering/reviews/CC-02I-stage-gate-r1-review.md`, produced under
maintenance stage `WF-CC02I-SPEC-R1`, which maps every ChatGPT finding
from this round to its exact fix location in the revised production spec,
registry proposal, and eight tickets. Read the R1 review, not this one,
for the current state of CC-02I's planning package.

This document does not itself approve or reject CC-02I. It exists so
ChatGPT (and the user) can evaluate the spec/ticket package produced this
round without re-deriving the full context from scratch. Nothing in this
round unlocked `CC-02I`, modified `src/**`/`public/**`, or advanced the
project past the planning stage — see §9 for full confirmation.

## 1. Final direction summary

Variant C — **Engineering Editorial Sheet** — is the fixed input to this
round, selected externally by ChatGPT during CC-02F, overriding the
internal preference for Variant A. CC-02I does not reopen that choice. No
blocker was found during this round's research that would meet the
governing prompt's reopening bar (unbuildable / critical architecture
conflict / clear accessibility violation / clear performance
unacceptability / locale-routing incompatibility) — the design proceeds
into a production implementation spec unchanged in direction.

## 2. Consistency with CC-02F

The production spec (`docs/engineering/specs/CC-02I-header-hero-
production-spec.md`) is built directly on top of
`docs/engineering/specs/CC-02F-final-editorial-hero.md`'s §4-§16 content —
copy, grid ratios, visual layering, motion narrative, and accessibility
requirements are carried forward verbatim or with an explicitly recorded,
verified correction (e.g. the Copy column's `1-5` vs. the CC-02F spec's
literal `1-6`, which CC-02F's own implementation already corrected and
recorded in a code comment — CC-02I inherits the verified value, not the
literal spec text). No content in CC-02F's spec was silently altered.

## 3. Prototype → Production differences

Full detail in spec §1. Summary of the load-bearing differences:

- **Page shell**: prototype hand-rolled `<html>`; production must render
  through `BaseLayout.astro` (skip link, `SEOHead`, `StructuredData`,
  `AnalyticsBridge`).
- **Header**: prototype's `FinalPrototypeHeader.astro` is fully isolated
  (no real routes, `href="#"` placeholders, duplicated brand string,
  5-item nav label set not matching the real IA). Production reuses the
  existing, already-correct `Header.astro` and only changes its visual
  treatment (Datum mark, CTA token, nav hover) — real 6-item `navItems`
  are used unchanged.
- **Hero**: no production equivalent exists today — the current homepage
  Hero is a pre-Datum, 55/45-split layout using a hardcoded-hex-color
  placeholder illustration (`HeroIllustration.astro`), never touched by
  CC-01/CC-02/CC-02F. CC-02I is a genuine new build against this surface,
  not an edit.
  variant. 3 visual components (`PrecisionSystemVisual`, `ProcessRail`,
  `EvaluationLedger`) are promoted from `src/components/prototypes/
  cc02-final/` to a production location.
- **Locale data**: prototype's `cc02-final-hero.ts` is a fully isolated
  data file bypassing `getDictionary()`/`siteConfig`. Production moves the
  same content into the real `Dictionary` (`src/data/locales/{zh-tw,
  en}.ts`) — `cc02-final-hero.ts` itself is not deleted or imported by
  production code this round.

## 4. Retained items

- 12-column editorial grid logic and its verified (not literal-spec)
  column ratios.
- Datum Origin as literal layout anchor.
- Primary/Secondary System Visual size-and-connection relationship
  (35-50% smaller, partial overlap/axis-line connection).
- Evaluation Ledger's three-group, no-card, no-fake-number structure.
- Four-step Process Rail built on the existing `AssemblySpine` primitive.
- Single five-step motion narrative (~800-1100ms) with three-layer
  reduced-motion defense.
- All existing Design Tokens, used unchanged — zero new tokens introduced.
- `Header.astro`'s existing, already-fixed mobile drawer implementation
  (focus trap, Escape, focus return, the documented `backdrop-filter`
  containing-block fix) — explicitly not rebuilt.

## 5. Retired items

- Prototype's isolated page shell, isolated Header, and isolated data
  file (superseded by production equivalents; source files not deleted
  this round — see §6 of the production spec).
- 5-item prototype-only nav label set (`engineeringMethod`, `resources`) —
  was a design-spike label set, never a real IA decision.
- `href="#" data-proto-noop` placeholder link pattern.
- Duplicated brand-name string in `cc02-final-hero.ts`'s `finalNavCopy` —
  production sources brand name from `siteConfig` only.
- `ProcessRail`'s inline aria-label ternary — replaced by a required
  `railLabel` prop sourced from the locale dictionary.

## 6. New items

- New `hero` key in both locale dictionaries (`src/data/locales/{zh-tw,
  en}.ts`) — the only schema addition this stage proposes; no new
  top-level data file.
- New `Hero.astro` section component.
- Relocated (not newly designed) `PrecisionSystemVisual`, `ProcessRail`,
  `EvaluationLedger` components.
- Possible new `Button.astro` variant if `--color-action-primary` isn't
  cleanly reachable through the existing variant set (ticket CC-02I-02's
  call, not decided in this document).
- Possible Datum mark integration inside `Logo.astro` (ticket CC-02I-02's
  call, alternative to composing it directly in `Header.astro`).

## 7. Ticket completeness

Eight tickets, `docs/engineering/tickets/CC-02I/00` through `07`,
matching the registry proposal
(`docs/engineering/specs/CC-02I-registry-proposal.json`):

| Ticket | Scope | Depends on |
|---|---|---|
| CC-02I-01 | Locale API / data contract | — |
| CC-02I-02 | Header visual update | CC-02I-01 |
| CC-02I-03 | Mobile nav verification/hardening | CC-02I-02 |
| CC-02I-04 | Hero structure | CC-02I-01, CC-02I-05 |
| CC-02I-05 | Brand primitives / Hero visual | CC-02I-01 |
| CC-02I-06 | Motion / reduced motion / performance | CC-02I-04, CC-02I-05 |
| CC-02I-07 | Responsive / locale / a11y matrix | CC-02I-02 through 06 |
| CC-02I-08 | Regression / QA / review bundle | all prior |

Each ticket carries the full 20-field structure the governing prompt
requires (ID, title, purpose, dependencies, allowed/forbidden paths,
expected files, implementation/design/accessibility/performance/locale
requirements, tests, acceptance criteria, completion evidence, handoff
requirements, rollback/failure conditions, agent eligibility, suggested
agent, estimated risk). None spans the entire Header+Hero surface in one
ticket; each is scoped to be claimable → stepped → implemented → tested →
committed → checkpointed → handed off within a single context window, per
the governing prompt's explicit sizing constraint.

## 8. Scope, locale, accessibility, performance, responsive, testing completeness

- **Scope**: bounded to Header + Hero only (spec §16 non-goals list is
  explicit: no other page, no Footer, no Contact, no new Brand Primitive,
  no scroll-triggered Header state, no 320px support, no photography/CGI/
  Higgsfield).
- **Locale**: every ticket that touches rendered output requires both
  zh-TW and en verification independently, not a single-locale pass with
  an assumed parity.
- **Accessibility**: spec §11 plus dedicated verification ticket
  (CC-02I-07) covering keyboard, focus order, contrast, touch target,
  screen-reader text, reduced motion, 200% zoom — axe threshold matches
  the project's existing Critical/Serious-only convention, not a stricter
  invented bar.
- **Performance**: spec §12 plus dedicated verification ticket
  (CC-02I-06) covering JS payload, SVG size, LCP element identification,
  CLS, animation thread constraints, mobile Lighthouse regression check.
- **Responsive**: spec §14 breakpoint matrix matches the project's
  existing seven-breakpoint fixture set (`tests/e2e/fixtures.ts`) exactly
  — no invented breakpoint, explicit 320px non-support.
- **Testing**: spec requires the full existing sitewide suite
  (`responsive-overflow.spec.ts`'s 98 combinations, `axe.spec.ts`'s 14
  page types) to still pass, not just new Hero-specific assertions —
  enforced by CC-02I-08 as the closing gate.

## 9. Confirmation: zero website change this round

- `src/**`: no file created, modified, or deleted this round.
- `public/**`: no file created, modified, or deleted this round.
- `docs/agents/TASK_REGISTRY.json`: not modified — the registry proposal
  lives at `docs/engineering/specs/CC-02I-registry-proposal.json`, a
  separate, clearly-labeled non-authoritative file.
- `CC-02I.claimable`: unchanged, still `false`.
- No Higgsfield call, no animation build, no remote/push, no merge, no
  reset/restore/clean.
- Full diff/status confirmation is recorded in the completion report (see
  the conversation's final report for exact `git status`/`git diff`
  output at time of writing).

## 10. Risk

- **Highest-risk ticket**: CC-02I-04 (Hero Production Structure) —
  changes the most visible surface of the live site, in both locales,
  touching the primary RFQ conversion CTAs. Any implementation error here
  has maximum visibility.
- **Second-highest**: CC-02I-02 (Header) — the Header renders on every
  page, so even a Hero-unrelated regression here is sitewide, not
  contained to the homepage.
- **Cross-ticket integration risk**: CC-02I-07 is deliberately positioned
  to catch interaction effects between CC-02I-02 through CC-02I-06 that no
  single ticket's narrower scope would surface (e.g. a tablet-width issue
  that only appears once the real Header height combines with the real
  Hero grid).
- **Schema risk**: CC-02I-01's `Dictionary`/`DeepString` pattern has not
  previously carried a nested-array shape like `ledger`/`processRail` —
  flagged as the one condition under which that ticket may propose a
  schema deviation, to be reported at Stage Gate rather than resolved
  unilaterally.

## 11. Material still needed from 岳峰 (the client stand-in)

None. This is a deliberate, load-bearing property of the Variant C
direction — the Primary/Secondary System Visual is fully vector/SVG,
requiring no photography, CGI, or Higgsfield generation to be complete
(spec §9). No ticket in this stage is blocked on external material.

## 12. Open questions (unresolved by this round, by design)

- Whether `PrecisionSystemVisual`/`ProcessRail`/`EvaluationLedger` land
  under `src/components/brand/` (joining the six existing Brand
  Primitives) or `src/components/sections/` — left to CC-02I-05's
  implementer to decide and record, since the governing prompt asked for
  ticket-level judgment calls rather than this document pre-deciding
  every implementation detail.
- Whether the Datum mark integrates inside `Logo.astro` or is composed
  directly in `Header.astro` — same reasoning, left to CC-02I-02.
- Whether `src/pages/internal-preview/cc02-final/**`'s existing test
  suite (`cc02f-final-hero.spec.ts`) needs its import paths updated when
  CC-02I-05 relocates the three components, or whether the prototype route
  keeps independent copies — left to CC-02I-05, with a rollback path
  specified in that ticket if relocation breaks the prototype route.
- Whether `HeroIllustration.astro` has other call sites beyond the
  homepage Hero it's being retired from — CC-02I-04's implementer checks
  and reports; the file is not deleted this round regardless of the
  answer.

## 13. Recommendation on unlocking CC-02I

**This document does not recommend unlocking CC-02I itself** — that
determination is reserved for ChatGPT's Stage Gate review per
`docs/agents/DUAL_AGENT_PROTOCOL.md`. What this round confirms is that a
complete, internally-consistent spec and ticket package now exists where
none did before, built from a genuine reading of CC-02F's decisions, the
production codebase's actual current state, and the project's established
conventions (token reuse, locale contract, testing matrix, Brand Primitive
API-expansion discipline). If ChatGPT finds no critical gap in §7-§9
above, unlocking `CC-02I.claimable` and registering the eight tickets
through the normal workflow-CLI process is the natural next step — but
that action itself is out of this round's scope regardless of the
review's outcome.

## 14. What ChatGPT should focus review on

1. Whether the Copy-column ratio correction (`1-5` vs. spec-literal `1-6`,
   §2 above) is an acceptable inherited deviation or needs its own
   re-verification before tickets are registered.
2. Whether promoting `PrecisionSystemVisual`/`ProcessRail`/
   `EvaluationLedger` without a forced single canonical directory decision
   (§12, left to ticket-level judgment) is acceptable spec looseness or
   should be pinned down now.
3. Whether the `hero` dictionary key's proposed shape (spec §7) is
   final enough to register, or needs adjustment before CC-02I-01 is
   claimable.
4. Whether the explicit non-goals list (spec §16 — no scroll-state Header,
   no 320px, no new Brand Primitive) matches ChatGPT's own expectations
   for this stage's scope, or whether any of those should be pulled in
   now rather than deferred.
5. Whether the ticket dependency graph (§7 above) correctly sequences
   Claude/Codex handoffs given the dual-agent workflow's one-ticket-at-a-
   time claim model.
