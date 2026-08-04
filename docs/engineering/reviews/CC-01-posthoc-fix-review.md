# CC-01 Post-hoc Fix — Narrow Review

Second, scoped-down review pass required after code changes were made in
this round (spec §十四). New fixed point: `ebcb361` ("chore(agent):
initialize project engineering skills" — the governance commit).
Commit under review: `49d3d90` ("fix(design-system): harden datum
primitives"). `git diff ebcb361..49d3d90` — 2 files changed, 14
insertions(+), 10 deletions(-).

## Verdict: no new problems introduced.

1. **CSS selectors preserved.** `.assembly-spine__marker` styling
   (base rule, `:focus-visible`, `[data-assembly-spine]
   .assembly-spine__marker` cursor override, per-state modifiers) all key
   off the class on the marker element, not its tag name — apply
   correctly to both the `<span>` (static) and `<button>` (interactive)
   branches.
2. **Inline script correctly scoped.** `<script define:vars={{ uid }}>`
   only renders when `interactive` is true, and in that same render pass
   `clamped.map` only ever produces `<button>` elements (never `<span>`)
   — so `li.querySelector('button')` always finds its target when the
   script runs, and the static `<span>` path is never reachable by the
   script.
3. **No accessibility regression.** Both branches carry the identical
   `aria-label`. The static `<span>` correctly inherits `cursor: default`
   (not `pointer` — the `[data-assembly-spine]` override only applies
   when `interactive`, since `data-assembly-spine` is only set in that
   case), so no accidental clickability affordance was introduced.
4. **DatumOrigin fully clean.** `<style>` reverted to a plain (non-
   `define:vars`) tag; zero remaining references to `uid` anywhere in the
   file (props, script, template, style).
5. **No new smell.** The two AssemblySpine JSX branches are near-
   duplicates by necessity (two different semantic elements sharing one
   visual treatment) — the minimal correct expression of the fix, not
   gratuitous duplication.

## Fresh test evidence after the fix (re-run, not cited from before)

- `pnpm check`: 85 files, 0 errors, 0 warnings, 11 hints (unchanged).
- `pnpm build`: 51 pages, 0 errors.
- `pnpm test:e2e`: 197 passed, 1 failed — the failure is
  `responsive-overflow.spec.ts`'s `home-en @ 360x800` check
  (`scrollWidth 377 > clientWidth 360`), identical to the pre-fix number
  and to the CC-00-baseline number. Confirms the fix did not touch or
  change this known, pre-existing, non-CC-01 defect.
- `pnpm test:axe`: 15 passed, 0 critical/0 serious (unchanged).
- Live Playwright confirmation on `/internal-preview/design-system/`:
  the interactive `AssemblySpine` instance renders 3 real `<button>`
  elements and click-to-cycle still works (`connected` → `unconnected`
  confirmed by simulated click); the static (vertical) instance renders
  3 `<span>` elements, zero `<button>`. Zero console errors on page load.
