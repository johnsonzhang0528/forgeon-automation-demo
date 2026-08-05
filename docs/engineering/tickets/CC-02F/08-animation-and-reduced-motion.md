# CC-02F-08 — Animation and reduced motion

## Goal

One clear ~800-1100ms motion narrative, per spec §13/§17, built on the
Brand Primitives' existing animation contracts rather than new bespoke
timing code.

## Scope

Sequence, all triggered on Hero mount (no scroll-triggered replay except
where a primitive already does IntersectionObserver-based one-shot
reveal, e.g. `VisionLockFrame`):

1. Datum Origin appears (`DatumOrigin animated` — axis draw + point light,
   existing `--duration-section` + delay chain).
2. Axis expands (same DatumOrigin animation, no new code).
3. Three modules align along the Assembly Spine (Process Rail's node
   states transition in on mount, staggered by node index only — not
   per-character/per-line text).
4. Vision Frame locks (`VisionLockFrame animated`, existing align→lock→
   complete one-shot).
5. Process Rail completes (final node reaches its resting Copper/Steel
   state).

Total measured wall-clock time from mount to fully-settled state ≤1100ms.

Forbidden: staggered fade-up per text line, infinite loops, mouse-follow,
parallax, particles, scroll-hijacking, heavy blur — none of these are
introduced.

## Acceptance criteria

- [ ] Measured (Playwright, via `performance.now()` timestamps around
      animation-end events or a fixed wait matched against CSS duration
      tokens) total sequence duration is 800-1100ms.
- [ ] `prefers-reduced-motion: reduce` renders the fully-completed end
      state with no visible flash of the pre-animation state, verified by
      screenshot immediately after load.
- [ ] H1/Body/CTA are interactive (clickable/focusable) immediately on
      load, not gated behind animation completion.
