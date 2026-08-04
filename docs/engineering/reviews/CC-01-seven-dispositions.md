# CC-01 Post-hoc Review — Seven Mandatory Dispositions

Per spec §八, each item below carries exactly one of: 無需修改 (no change) /
本輪修正 (fixed this round) / 延後至指定 CC 階段 (deferred, named stage) /
需要使用者決策 (needs user decision). No "optimize later" without a named
stage.

## 1. Brand Primitive 是否需新增 Locale／Messages API

**Disposition: 延後至 CC-02。**

Confirmed real by both the codebase-design review (§1) and the Spec-axis
code review: all six Brand Primitives hardcode Traditional Chinese strings
with no `locale`/`messages` prop or caller-text override. However, grep
across the entire `src/pages/en/` tree confirms **zero current usages** of
any Brand Primitive on any English page — the only live consumer today is
`internal-preview/design-system.astro`, itself Chinese-only
(`lang="zh-Hant-TW"`, never localized). Designing the right API shape
(prop-per-string vs. a `messages` object vs. slot-based override) is a
real interface-design decision, not a mechanical fix, and doing it without
a concrete bilingual call site to design against risks exactly the
Speculative Generality the codebase-design review's own checklist warns
about. CC-02 (Header/Hero Design Spike) is the first stage in
`docs/DATUM_REDESIGN_PLAN.md`'s table that will plausibly place a Brand
Primitive (most likely `DatumOrigin`, per the redesign task book's "Logo
結合 Datum Origin Mark" line) on a real page in both locales — that is the
right point to design the locale API against a concrete need instead of
speculatively.

## 2. `AssemblySpine` 靜態狀態是否需移除 Disabled Button

**Disposition: 本輪修正。**

Confirmed by direct code read (`AssemblySpine.astro:61-68`): every node
marker renders a real `<button type="button" disabled={!interactive}>`
regardless of caller intent, meaning the static (default, `interactive=false`)
usage path emits a permanently-disabled interactive control element for
what is meant to be a pure visual/informational marker. This is a narrow,
mechanical, well-scoped fix (swap the element used in the static path,
keep the interactive path's real `<button>` unchanged) that does not touch
homepage structure or any CC-02+ file. See ticket 02 and the implementation
section below.

## 3. `Math.random()` UID 是否需修正

**Disposition: 本輪修正（僅 DatumOrigin 死碼部分）／無需修改（VisionLockFrame、AssemblySpine 部分）。**

Split disposition because the three occurrences are not equivalent
severity:

- **`DatumOrigin.astro:44`** — the generated `uid` is genuinely dead code:
  declared, passed into `define:vars`, and never read by any CSS rule or
  template expression in the file (confirmed by reading all 190 lines).
  Zero functional risk, but it is waste and it is the one place where
  "fix the non-determinism" and "delete dead code" are the same one-line
  change. Fixed this round.
- **`VisionLockFrame.astro:37`** and **`AssemblySpine.astro:39`** — the
  UID is functionally load-bearing (scopes each inline script's
  `querySelector` to its own component instance when more than one
  appears on a page, which the internal preview page actually does: both
  components render twice). A more deterministic alternative exists
  (caller-supplied `id` prop, or `document.currentScript`-relative
  lookup instead of a generated global selector) but rearchitecting two
  working inline-script scoping mechanisms for a non-deterministic-build
  concern that no repo doc actually states as a requirement, against
  only 2 real call sites total, is exactly the over-engineering the
  spec's own instruction warns against ("不得為解決 UID 建立過度複雜的全域 ID 管理器").
  No change made to these two this round.

## 4. Noto Sans TC 字型重量是否需精簡

**Disposition: 無需修改。**

Live-verified this round via Playwright `document.fonts.check()` against
the real production build on `/zh-tw/`: all four shipped Noto Sans TC
weights (400/500/600/700) report `loaded: true` — i.e., all four are
actually used somewhere on this page, not speculatively bundled. This
matches `docs/ASSET_LICENSES.md`'s own claim of "只複製實際使用的字重"
with fresh evidence rather than trusting the prior claim. No further
reduction is warranted; the weight set is already minimal.

## 5. Primary Copper 是否應提高至至少約 5:1 的安全餘裕

**Disposition: 需要使用者決策。**

`--color-copper-600` on `--color-paper-50` computes to 4.61:1 (real,
independently re-confirmed against `docs/CONTRAST_AUDIT.md`'s formula) —
passes the 4.5:1 floor with only a 0.11 margin, the thinnest in the
palette. Raising it to ~5:1 means darkening `--color-copper-600` itself
(the sitewide primary CTA fill/text color) or lightening
`--color-paper-50` (the sitewide primary background) — either is a
visual-identity change to the single most repeated brand color in the
system, not a bug fix. `DATUM_DECISION_LOG.md` already recorded this as a
known, accepted trade-off with an explicit "do not touch without
re-running the audit" constraint for future stages. Whether to spend that
margin now is a brand/visual decision, not an engineering defect —
routed to the user rather than decided unilaterally in a review round
whose mandate is narrow, evidence-driven fixes only.

## 6. `/en/` 首頁 360px 溢位應歸入 CC-02 或 CC-03 哪一張 Ticket

**Disposition: 延後至 CC-02（非本輪 Ticket——已是既有已知缺陷，非 CC-01 新增）。**

Re-confirmed live this round via fresh Playwright measurement:
`scrollWidth: 377` vs `clientWidth: 360` at 360×800 on `/en/`, identical
to the number `docs/DATUM_QA.md` recorded as present in the CC-00 baseline
(verified there via `git stash` A/B testing). Per
`docs/DATUM_REDESIGN_PLAN.md`'s stage table, CC-02 ("Header + Hero Design
Spike") is the first stage that legitimately opens homepage/Hero
structure — CC-03 ("首頁核心敘事重構") comes after and would be the wrong
target since by the redesign task book's own ordering, CC-02 must pass its
own gate before CC-03 starts. This bug is not created new by any CC-01
ticket in this round (§九 below) — it predates CC-01 entirely — so it is
not filed as a `CC-01-posthoc` ticket; it is recorded here as the explicit
routing decision for whoever picks up CC-02, and CC-02's own dispatch
brief should carry this forward as a pre-existing known defect to fix
alongside (not instead of) its own Header/Hero scope.

## 7. CC-01 是否可以視為通過 Stage Gate

**Disposition: 通過（Passes），with two tracked non-blocking items.**

Objective acceptance evidence gathered fresh this round:
- `pnpm check`: 85 files, 0 errors, 0 warnings, 11 hints (unchanged from
  documented).
- `pnpm build`: 51 pages, 0 errors.
- `pnpm check:h1`: 49/49 pass (2 redirects excluded).
- `pnpm check:links`: 2049/2049 internal links, 0 broken.
- `pnpm check:locale-routes`: 141/141 hreflang links, 0 broken.
- `pnpm test:e2e`: 197/198 — the 1 failure is the pre-existing, non-CC-01
  `/en/` 360px overflow (disposition #6 above), not a regression.
- `pnpm test:axe`: 15/15, 0 critical, 0 serious.
- Contrast: 24/24 pairings pass WCAG AA (independently re-verified
  formula and values, not just cited).
- Fonts: real self-hosted WOFF2, SIL OFL 1.1 confirmed first-hand, real
  Network 200s and `document.fonts.check()` confirmed live this round.
- No CC-02+ scope creep found (Spec-axis review, confirmed via diff stat).

The two real findings from this round (disposition #1 locale API,
disposition #5 copper margin) are both explicitly deferred/routed to a
user decision, not blocking defects — CC-01 met its own stated acceptance
criteria (`docs/redesign/forgeon_claude_code_redesign_tasks.md` §CC-01
"驗收": preview page + screenshots + contrast pass + real font Network
load, all confirmed). Stage Gate: **PASS**.
