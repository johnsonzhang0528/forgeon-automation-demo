# 02 — Locale/semantics API for Brand Primitives actually used in CC-02

**What to build:** Minimal locale-aware API additions to the three Brand
Primitives the CC-02 Hero prototypes actually use — `DatumOrigin`,
`VisionLockFrame`, `AssemblySpine` — per the CC-01 post-hoc review's
deferred "Locale/Messages API" disposition. Deliberately NOT a refactor of
all six Brand Primitives, and deliberately NOT a full site-dictionary
import inside any of them.

**File scope:** `src/components/brand/DatumOrigin.astro`,
`src/components/brand/VisionLockFrame.astro`,
`src/components/brand/AssemblySpine.astro`. No other Brand Primitive
touched (`ToleranceBand`, `ProcessStamp`, `CutawayWindow` are out of scope
— none of the three CC-02 prototypes require locale text from them this
round).

**Blocked by:** None.

**Status:** done

- [x] `DatumOrigin`: new `ariaLabel?: string` prop. `decorative=true`
      (default) ignores it entirely. `decorative=false` requires it — a
      dev-only console warning fires if omitted. Visible coordinate
      `label` stays independent of the accessible name (already was;
      confirmed, documented).
- [x] `VisionLockFrame`: new optional `statusLabels?: {locking, locked}`
      for the `aria-hidden` decorative LOCKING/LOCKED HUD text. Defaults
      preserve existing English literals — no call site's behavior changes
      unless it opts in.
- [x] `AssemblySpine`: static-mode marker is `aria-hidden="true"` (was a
      `<span aria-label>`, not reliably exposed by all screen readers);
      semantics now come from the already-visible label + state-tag text.
      Interactive mode's real `<button>` keeps its full `aria-label`,
      synced on click via the same `stateLabels`-resolved dict (no more
      second hardcoded Chinese object inside the inline script).
- [x] None of the six components imports a whole site dictionary.
- [x] All changes additive — the one existing call site
      (`internal-preview/design-system.astro`, zh-tw only) required zero
      changes and was verified live (interactive click-cycling still
      updates `aria-label` correctly; static markers now report
      `aria-hidden="true"`).
- [x] `pnpm check` 0 errors/0 warnings; full e2e 201/201; axe 15/15.
