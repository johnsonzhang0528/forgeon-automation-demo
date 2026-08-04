# 02 — DatumOrigin's Math.random() UID is dead code

**What to build:** Remove the unused `uid` generation in
`DatumOrigin.astro`. The value is currently generated via
`Math.random().toString(36)` and threaded into `<style define:vars={{
uid }}>`, but no CSS rule in the file reads `var(--uid)` and no template
expression references `uid` — confirmed by reading the full file. This is
pure dead code with a (harmless but pointless) build-non-determinism side
effect. Delete the `uid` declaration and the `define:vars` binding.

**File scope:** `src/components/brand/DatumOrigin.astro` only.

**Blocked by:** None — can start immediately (independent of ticket 01).

**Status:** ready-for-agent

- [ ] `const uid = ...` line removed.
- [ ] `<style define:vars={{ uid }}>` reverts to a plain `<style>` tag (no
      other `define:vars` consumers exist in this file — confirmed).
- [ ] Rendered SVG output byte-identical apart from the removed
      (unused) attribute — no visual/behavioral change.
- [ ] `pnpm check` / `pnpm build` still 0 errors.
- [ ] `pnpm test:e2e` still 197/198 (known `/en/` failure unchanged).
