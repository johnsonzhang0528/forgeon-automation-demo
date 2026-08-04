# 01 — AssemblySpine static usage emits a permanently-disabled button

**What to build:** When `AssemblySpine` is used non-interactively
(`interactive` left at its default `false` — e.g. the vertical instance in
`internal-preview/design-system.astro` and any future static System
Architecture diagram usage in CC-04), each node marker must not render as
a real `<button disabled>` element. It should render as a non-interactive
element (a `<span>` or `<div>`) carrying the same visual marker and the
same informational `aria-label` text, while the interactive usage
(`interactive={true}`) keeps its real, always-enabled `<button>` with the
click-to-cycle handler unchanged.

**File scope:** `src/components/brand/AssemblySpine.astro` only. No
homepage, Header, or CC-02+ file touched.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Static usage (`interactive` false/omitted) renders a non-button
      element for each node marker — confirmed via DOM inspection, not a
      `<button>` tag.
- [ ] Interactive usage (`interactive={true}`) is visually and
      behaviorally unchanged — click-to-cycle still works, real `<button>`
      still used, `aria-label` still updates on click.
- [ ] `aria-label` text (`${node.label}：${stateLabel[state]}`) preserved
      in both paths.
- [ ] `pnpm test:axe` still passes 15/15, 0 critical/0 serious.
- [ ] `pnpm test:e2e` still passes 197/198 (the one known `/en/` 360px
      failure is unrelated and must still be present, not silently fixed
      here).
- [ ] `pnpm check` / `pnpm build` still 0 errors.
