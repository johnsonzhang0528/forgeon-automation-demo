# CC-01 Codebase Design Review — Six Brand Primitives

Scope: API boundary and module design of `src/components/brand/*.astro`
(`DatumOrigin`, `ToleranceBand`, `VisionLockFrame`, `AssemblySpine`,
`ProcessStamp`, `CutawayWindow`), 110-279 lines each, 1,159 lines total.
Uses the deep-module vocabulary from `.claude/skills/codebase-design/`:
Module / Interface / Depth / Seam / Adapter.

## 1. Bilingual API

**Finding: all six components hardcode Traditional Chinese strings
directly in their template/props, with no `locale`, `messages`, or
caller-supplied-text escape hatch.**

| Component | Hardcoded string(s) | Where |
|---|---|---|
| `DatumOrigin` | `基準原點` / `基準原點 ${label}` | `aria-label` when `decorative=false` |
| `ToleranceBand` | `公差帶：最小值...`, `目前值`, `（在公差範圍內）`/`（超出公差範圍）`, `示範數值 · Demo Data`, `MIN`/`TARGET`/`MAX` | `aria-label`, visible labels |
| `VisionLockFrame` | `LOCKING`/`LOCKED` (English only, inline script) | `.vision-lock__status` text content |
| `AssemblySpine` | `未連接`/`已對齊`/`已連接` | `stateLabel` map, both server-rendered `aria-label` and the inline click-handler script's own duplicated copy of the same map |
| `ProcessStamp` | `已審閱`/`REVIEWED` etc., `流程狀態 · PROCESS STATUS` | `labels` map, permanent visible eyebrow text |
| `CutawayWindow` | `模組剖面示意 · 尚無素材`, `CUTAWAY · NO MEDIA` | placeholder `aria-label` and visible label |

**Interface consequence:** every one of these is a component whose
*rendered content* depends on which human language the caller's page is
in, but the component's *interface* (its `Props`) has no parameter that
lets a caller supply that. A hypothetical `/en/` page using any of these
six components today would render Chinese text (`基準原點`, `未連接`) on
an English page. This is a real gap against the site's own dual-locale
requirement (`docs/redesign/forgeon_claude_code_redesign_tasks.md` §二
"中英文路由和資料" is listed under 必須保留), not a hypothetical one.

**Depth read:** these are currently *shallow* on the locale axis
specifically — the interface doesn't expose the one thing (language) that
varies across the site's two real call-site contexts, so that variation
leaks into the implementation as a hardcoded assumption instead of being
parameterized. Everything else about these components (SVG geometry,
token consumption, state machines) is appropriately deep — a caller gets a
correctly-drawn Datum Origin mark from `size`/`orientation`/`label` alone,
without knowing SVG.

**Disposition:** recorded as review finding #1 in the two-axis review
(§Standards and §Spec), given an explicit disposition in §八 below. Not
fixed in this round by default — see disposition rationale.

## 2. Static vs. Interactive semantics

**Real finding, `AssemblySpine.astro` lines 61-68:** every node renders a
real `<button type="button" disabled={!interactive} ...>` element,
regardless of whether the caller passed `interactive={true}` or left it at
the default `false`. In the static (default) case this is a **disabled
button that is never enabled by any user action** — not a static visual
marker rendered as a `<span>` or `<div>`, but a genuine interactive-control
element permanently in the disabled state.

Why this matters at the interface level: `disabled` on a real `<button>`
communicates something specific to assistive technology and to any future
maintainer reading the DOM — "this control exists and currently cannot be
activated," implying a live/enabled state exists elsewhere. For the static
usage (e.g. the vertical `AssemblySpine` instance in
`internal-preview/design-system.astro` line 272, and any future non-
interactive page usage such as a System Architecture diagram in CC-04),
there is no enabled state anywhere — it's simply not a control. Using
`disabled` there is the wrong semantic tool for "this is a static marker,"
even though visually and functionally (nothing responds to it) the result
looks identical to a caller.

**Cross-check against ARIA:** the `aria-label` on each marker
(`${node.label}：${stateLabel[state]}`) is applied identically whether
`interactive` or not — consistent at least in that the label doesn't
contradict itself, but it's an `aria-label` on a disabled button that will
never become enabled in the static case, which most screen readers
announce as "dimmed" / "unavailable," an incorrect signal for a purely
informational diagram marker.

**Other five components:** `VisionLockFrame`'s `role={label ? 'img' :
undefined}` correctly switches between decorative (`aria-hidden`,
implicit) and meaningful (`role="img"` + `aria-label`) based on whether a
`label` prop was actually supplied — this is the correct static/dynamic
ARIA pattern and should be the model `AssemblySpine` follows.
`DatumOrigin`'s `role={decorative ? undefined : 'img'}` /
`aria-hidden={decorative ? 'true' : undefined}` does the same correctly.
`ToleranceBand` always renders `role="img"` with a computed `aria-label`
(reasonable — it always conveys real numeric meaning, never pure
decoration, so there's no decorative branch needed). `ProcessStamp` uses
`role="note"` unconditionally (reasonable — it's always a real status
annotation). `CutawayWindow`'s placeholder state uses `role="img"` +
`aria-label` correctly when there's no `src`.

**Disposition:** recorded as review finding #2, explicit disposition in
§八.2 below.

## 3. UID via `Math.random()`

Three of six components declare a UID via `Math.random().toString(36)`:

- **`DatumOrigin.astro` line 44**: `const uid = \`datum-origin-...\`` —
  **declared but never referenced anywhere else in the file.** Not in the
  template, not in the `<style define:vars={{ uid }}>` block (which
  destructures `uid` into a CSS custom property but no CSS rule in the
  file actually reads `var(--uid)`). This is dead code — pure waste, not
  a functional non-determinism risk, since it has no observable effect on
  markup or behavior. Confirmed by reading the full 190-line file: `uid`
  appears at declaration and at the `define:vars` destructure, nowhere
  else.
- **`VisionLockFrame.astro` line 37**: used to build
  `data-vision-lock="${uid}"` / `data-vision-lock-status="${uid}"`
  attributes, but **only when `animated` is true** (line 42: `uid` is
  passed to `data-vision-lock` only inside the ternary, `undefined`
  otherwise). The inline `<script define:vars={{ uid }}>` block that
  consumes it is itself only rendered when `animated` is true (line 74
  `{animated && (...)}`). So the random UID only ever reaches the DOM/JS
  when the animation path is active.
- **`AssemblySpine.astro` line 39**: same pattern — `uid` feeds
  `data-assembly-spine="${uid}"`, gated by `interactive` (line 49), and
  the consuming inline script is gated by the same `interactive` check
  (line 82).

**Is this a real determinism problem?** For Astro's static build:
`Math.random()` runs at build time inside the component's frontmatter,
so a value baked into static HTML differs between builds. This does make
the *exact byte content* of the built HTML non-reproducible build-to-build
for pages using `VisionLockFrame animated` or `AssemblySpine interactive`
(2 of the current 3 real usages in `internal-preview/design-system.astro`
today). Whether that's a real problem depends on what "reproducible build"
means for this project: `docs/redesign/forgeon_claude_code_redesign_tasks.md`
doesn't state a byte-for-byte reproducible-build requirement anywhere
found in this review's reading — the CC-01 acceptance criteria talk about
build *succeeding* (0 errors), not byte-identical output across builds.
No CI/deploy pipeline hashing build output for change detection was found
in this repo (`package.json` scripts, `.github/` if present) that this
non-determinism would break.

**Is a UID actually needed here?** Yes, for the two live cases — both
`VisionLockFrame` and `AssemblySpine`'s inline scripts use
`document.querySelector('[data-x="uid"]')` to find *their own* root
element without a global ID collision if the same component appears more
than once on one page (verified: `internal-preview/design-system.astro`
renders `VisionLockFrame` twice and `AssemblySpine` twice). A `Math.random()`
suffix is one valid way to guarantee that per-instance uniqueness; it is
not the only way — Astro components can also accept `Astro.props.id`
directly from the caller, or the script can use `closest()`/scoped
`querySelector` from the component's own root without any generated ID at
all (i.e., don't `querySelector` globally — find `document.currentScript`'s
preceding sibling, which is deterministic and requires no ID). No global
ID-management system is warranted for 2 call sites; the spec explicitly
warns against building one (§六.3 "不得為解決 UID 建立過度複雜的全域 ID 管理器").

**Disposition:** recorded as review finding #3, explicit disposition in
§八.3 below — treats the `DatumOrigin` dead-code case and the two
functional-but-non-deterministic cases separately since they're different
severities.

## 4. Props

- **Speculative generality:** none of the six components' `Props`
  interfaces expose a parameter with no current caller (checked every
  prop against at least one usage in `internal-preview/design-system.astro`
  or another `.astro` file via grep — all props found in use). No
  evidence of over-engineered flexibility added ahead of need.
- **Primitive obsession:** `ToleranceBand`'s `min`/`max`/`target`/`value`/
  `unit` are plain `number`/`string` primitives representing an
  engineering-tolerance domain concept. This is a defensible primitive-obsession
  judgment call, not a clear violation — the values are genuinely simple
  scalars (a min, a max, a point value) with one unit string, and
  bundling them into a `ToleranceRange` type would add an extra
  construction step at every call site for a shape that's unlikely to
  need independent validation logic beyond what the component itself
  already does (`Math.max(0, Math.min(100, ...))` clamping). Flagged as a
  non-blocking judgment call, not a finding requiring action.
- **Unnecessary variants:** `AssemblySpine`'s node `state` union
  (`'unconnected' | 'aligned' | 'connected'`) and `ProcessStamp`'s
  `status` union (`'reviewed' | 'evaluated' | 'configured' | 'verified'`)
  both map 1:1 to real states named in the redesign spec (§10.4, §10.5) —
  no extra/speculative variant found beyond what's spec'd.
  `DatumOrigin`'s `orientation` (`'horizontal' | 'vertical' | 'both'`) is
  used in exactly this 3-way form in the preview page; no unused branch.
- **Business copy bound to SVG implementation:** `ProcessStamp`'s
  `labels` map (Chinese/English pairs per status) and `AssemblySpine`'s
  `stateLabel` map are both **declared twice** — once server-side in the
  Astro frontmatter, once again inside the inline `<script>` for
  `AssemblySpine`'s interactive click handler (lines 88 vs. 40-44, near-
  identical object literal duplicated verbatim). This is real duplication
  worth naming: if a caller ever changes the Chinese label text, the
  frontmatter map and the inline-script map must be edited in two places
  or they'll drift silently (the inline script's copy would then show
  stale text after a user clicks a node, while the initial server-rendered
  label stays correct). Not the "SVG-bound business copy" pattern the
  spec asks about in the worse sense (i.e., copy isn't unreachably
  hardcoded inside path data) — but it is unreachable-from-one-source
  duplication within the same file.
- **`as any`:** grep across all six component files plus the preview page
  found zero occurrences. Confirmed clean.
- **Parent-scoped CSS reaching into child internals:** grep for
  `:global(`, `::part(` across all six files found zero occurrences.
  Every component's `<style>` block is Astro's default scoped CSS,
  targeting only its own classes — no evidence of a parent page reaching
  past a Brand Primitive's own encapsulation to restyle its internal DOM.

## 5. Comment-to-complexity ratio

Each of the six files opens with a JSDoc-style block comment (13-25 lines)
stating what the component is, what it deliberately is NOT (tying back to
spec §10.1-10.6's explicit bans), and its intended usage. Body comments
are sparse and appear only at genuinely non-obvious points: the asymmetric
axis-arm math in `DatumOrigin` (why 38%/62%, not centered), the mobile
breakpoint rationale in `AssemblySpine` and `CutawayWindow` (why a
breakpoint swap instead of a duplicated markup tree), and the
`clip-path`/`@supports` fallback rationale in `CutawayWindow`.

This reads as proportionate, not AI-style over-commenting: comment density
is highest exactly where a future maintainer would otherwise have to
re-derive a non-obvious decision from scratch (the "why not a crosshair"
framing is exactly the kind of thing that's cheap to state once in a
comment and expensive to silently lose), and near-zero on self-explanatory
lines (no comment restating what `const { size = 48 } = Astro.props`
already says). No comment found that merely restates the adjacent code in
prose. The "is NOT X" framing duplicates across the component file header,
`DESIGN.md`'s CC-01 Addendum, and this review's own domain-modeling
output (§三) — that's acceptable duplication for a fixed, load-bearing
design constraint (three independent readers — component author, design
doc reader, code reviewer — all need the same fact at their own point of
contact), not a case where "should be an ADR instead" applies, since none
of the six "is NOT" framings meets the ADR bar (they're not hard-to-reverse
architectural choices, they're visual-identity constraints already
governed by the redesign spec itself as the source of truth).

**No ADR recommended for any of this section's findings** — per
`/domain-modeling`'s own three-part test (hard to reverse + surprising
without context + real trade-off), none of the five findings above is a
newly-made, hard-to-reverse architectural decision; they are review
findings about existing code, appropriately routed to the two-axis review
and the seven-question disposition list instead.
