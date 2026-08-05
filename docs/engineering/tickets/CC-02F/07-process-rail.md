# CC-02F-07 — Process Rail

## Goal

Absorb Variant A's four-step process flow into C+ as an Assembly-Spine/
Datum-Axis visual treatment (not four cards), per spec §1/§11.

## Scope

New component: `src/components/prototypes/cc02-final/ProcessRail.astro`,
built on top of the existing `AssemblySpine.astro` Brand Primitive
(horizontal orientation) rather than a new bespoke component — reuses its
existing mobile-simplification breakpoint, `stateLabels` locale API, and
reduced-motion handling instead of re-deriving them.

- Labels: 需求輸入 → 方案評估 → 模組配置 → 驗證條件 (zh-tw) / INPUT →
  EVALUATE → CONFIGURE → VERIFY (en, literal casing per spec).
- Current step (first, "需求輸入"/INPUT) rendered in the `connected` state
  (Copper); remaining three steps `unconnected`/`aligned` (Steel), not all
  four in identical style — the rail should read as a sequence with a
  starting point.
- Mobile: horizontally scrollable, `tabindex="0"`, `aria-label` on the
  scroll container, keyboard operable (arrow-key or Tab-through node
  focus), no auto-scroll.

## Acceptance criteria

- [ ] Renders as one continuous axis line with node markers — not four
      separate card elements.
- [ ] Keyboard nav: `Tab` reaches the rail container/nodes, no keyboard
      trap, verified via Playwright.
- [ ] Mobile scroll container has `tabindex="0"` and a real `aria-label`.
- [ ] axe reports 0 Critical/0 Serious on the Process Rail markup
      specifically (WCAG 2.1.1 scrollable-region-focusable).
