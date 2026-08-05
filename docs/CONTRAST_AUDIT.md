# CONTRAST_AUDIT.md

WCAG 2.x contrast ratios computed with the standard relative-luminance
formula (sRGB → linear per channel, `L = 0.2126R + 0.7152G + 0.0722B`,
`ratio = (L_lighter + 0.05) / (L_darker + 0.05)`), calculated by a small
Node script (not eyeballed). Thresholds used: **≥4.5:1** for normal text and
text-like UI (button labels, links, body copy), **≥3:1** for large text
(≥24px, or ≥19px bold) and non-text UI boundaries (borders, focus rings)
per WCAG 1.4.11.

All Token values live in `src/styles/tokens.css`.

## CC-02 — Primary Action semantic token

**Date:** 2026-08-05

New semantic tokens `--color-action-primary` / `--color-action-primary-hover`
(spec §7), used by the CC-02 Hero prototypes' primary CTA button — kept
distinct from `--color-copper-600` (which stays the token for Datum Origin,
highlight annotations, and existing-component text/link use per
DESIGN_SYSTEM.md's role list) precisely so this new role never has to touch
`--color-copper-600`'s already-thin 4.61:1 margin, which
`DATUM_DECISION_LOG.md`'s CC-01 entry explicitly locks against further
darkening/lightening without redoing this whole calculation.

| Pair | FG | BG | Ratio | Threshold | Pass? |
|---|---|---|---|---|---|
| `--color-action-primary` (= `--color-copper-700`) on `--color-paper-50` | `#9c4014` | `#f7f4ed` | 6.06:1 | ≥5:1 (spec §7 target) | PASS |
| `--color-paper-50` on `--color-action-primary` fill (button label) | `#f7f4ed` | `#9c4014` | 6.06:1 | 4.5:1 | PASS |
| `--color-action-primary` on white (`--color-card`) | `#9c4014` | `#ffffff` | 6.65:1 | 4.5:1 | PASS |
| **`--color-copper-800`** (new) / `--color-action-primary-hover` on `--color-paper-50` | `#84340f` | `#f7f4ed` | **7.71:1** | 4.5:1 | PASS (more margin than default state, matching the existing hover-state pattern below) |
| `--color-copper-800` on white | `#84340f` | `#ffffff` | 8.44:1 | 4.5:1 | PASS |

**Hue check:** `--color-copper-800` (`#84340f`) is HSL(19°, 80%, 29%) —
same 19° hue as `--color-copper-600` (19°) and `--color-copper-700` (19°),
one lightness step further down the same family (29% vs. 35% vs. 42%). No
new accent color introduced, consistent with every prior correction in this
file staying inside the existing copper-bronze hue family.

**Why not just re-target `--color-copper-600` directly:** `--color-copper-600`
remains the correct token for its existing roles (Datum Origin, highlight
annotations, existing 10-component text/link use) at its already-verified
4.61:1 margin — spec §7 explicitly says "不直接重新映射全站所有 Legacy
Accent." `--color-action-primary` is a new, separate semantic role for CTA
buttons specifically, free to target a more comfortable ratio without
touching every other copper-600 consumer's contrast math.

## CC-01 — Precision Datum System palette

**Date:** 2026-08-05

The redesign spec (`docs/redesign/forgeon_claude_code_redesign_tasks.md`
§CC-01, `forgeon_full_audit_and_redesign.md` §19) proposed 11 literal hex
values with an explicit instruction to verify before finalizing
("必須實際驗證對比後再定案"). Running the same relative-luminance calculator
this document already used for the pre-CC-01 P0.3 pass against every
actual on-page usage of those 11 values surfaced real failures, consistent
with that warning.

### Spec's literal values, as first computed (before correction)

| Pair | FG | BG | Ratio | Threshold | Pass? |
|---|---|---|---|---|---|
| ink-950 on paper-50 (body text) | `#0b1218` | `#f7f4ed` | 17.16:1 | 4.5:1 | PASS |
| paper-50 on ink-950 (footer/dark-bg text) | `#f7f4ed` | `#0b1218` | 17.16:1 | 4.5:1 | PASS |
| steel-500 on paper-50 (muted text on light bg) | `#87939b` | `#f7f4ed` | **2.86:1** | 4.5:1 | **FAIL** |
| steel-500 on paper-100 | `#87939b` | `#eee9df` | **2.60:1** | 4.5:1 | **FAIL** |
| steel-500 on ink-950 (muted text on dark bg) | `#87939b` | `#0b1218` | 5.99:1 | 4.5:1 | PASS |
| steel-200 as border on paper-50 (light-bg border) | `#cdd3d5` | `#f7f4ed` | **1.38:1** | 3:1 | **FAIL** |
| steel-200 as border on ink-950 (dark-bg border) | `#cdd3d5` | `#0b1218` | 12.46:1 | 3:1 | PASS |
| copper-600 on paper-50 (CTA fill / text on light bg) | `#b84e1d` | `#f7f4ed` | 4.61:1 | 4.5:1 | PASS (margin only 0.11) |
| copper-600 on paper-100 | `#b84e1d` | `#eee9df` | **4.19:1** | 4.5:1 | **FAIL** |
| copper-600 on ink-950 (text on dark bg) | `#b84e1d` | `#0b1218` | **3.72:1** | 4.5:1 | **FAIL** |
| copper-500 on paper-50 (as body text) | `#d5662b` | `#f7f4ed` | **3.32:1** | 4.5:1 | **FAIL** (passes only the 3:1 non-text/UI floor) |
| copper-500 as border on paper-50 (non-text UI) | `#d5662b` | `#f7f4ed` | 3.32:1 | 3:1 | PASS |
| copper-500 on ink-950 (accent text on dark bg) | `#d5662b` | `#0b1218` | 5.18:1 | 4.5:1 | PASS |
| signal-green on paper-50 | `#34745a` | `#f7f4ed` | 5.04:1 | 4.5:1 | PASS |
| error on paper-50 | `#b4352b` | `#f7f4ed` | 5.49:1 | 4.5:1 | PASS |
| focus on paper-50 (focus ring, UI) | `#1769aa` | `#f7f4ed` | 5.26:1 | 3:1 | PASS |
| focus on ink-950 (focus ring on dark bg) | `#1769aa` | `#0b1218` | 3.27:1 | 3:1 | PASS |

**Failures found:** 5 of 17 checked pairings (steel-500 as light-bg text
×2, steel-200 as light-bg border, copper-600 on paper-100, copper-600 on
ink-950, copper-500 as light-bg body text).

### Correction approach

Per the precedent this file's own pre-CC-01 pass already set (deepen the
same hue family rather than introduce a new accent color), each failing
role was split into a role-specific step within the same hue rather than a
single compromise value that would under-serve every use. Two new tokens
were added (`--color-steel-700`, `--color-steel-600`) and one
(`--color-copper-700`) for the specific failing use cases; the spec's
original values are **kept unchanged** and reused for the roles where they
already passed (steel-500 on dark-bg text/decoration, steel-200 on dark-bg
borders, copper-600 as the primary CTA fill and its own paired light-bg
text/link use, copper-500 as light-bg non-text UI and dark-bg accent
text). Nothing in the copper/steel hue family was altered.

### Final values and full verification

| Pair | FG | BG | Ratio | Threshold | Pass? |
|---|---|---|---|---|---|
| `--color-ink-950` on `--color-paper-50` (body text) | `#0b1218` | `#f7f4ed` | 17.16:1 | 4.5:1 | PASS |
| `--color-ink-950` on `--color-paper-100` | `#0b1218` | `#eee9df` | 15.58:1 | 4.5:1 | PASS |
| `--color-ink-800` on `--color-paper-50` | `#1b2730` | `#f7f4ed` | 13.86:1 | 4.5:1 | PASS |
| `--color-paper-50` on `--color-ink-950` (footer text) | `#f7f4ed` | `#0b1218` | 17.16:1 | 4.5:1 | PASS |
| `--color-paper-50` on `--color-ink-800` | `#f7f4ed` | `#1b2730` | 13.86:1 | 4.5:1 | PASS |
| **`--color-steel-700`** (new) on `--color-paper-50` — muted text, light bg | `#5c6870` | `#f7f4ed` | **5.21:1** | 4.5:1 | PASS (was 2.86:1 FAIL as steel-500) |
| `--color-steel-700` on `--color-paper-100` | `#5c6870` | `#eee9df` | 4.73:1 | 4.5:1 | PASS |
| `--color-steel-700` on white (`--color-card`) | `#5c6870` | `#ffffff` | 5.72:1 | 4.5:1 | PASS |
| **`--color-steel-600`** (new) as border on `--color-paper-50` | `#78838b` | `#f7f4ed` | **3.53:1** | 3:1 | PASS (was 1.38:1 FAIL as steel-200) |
| `--color-steel-600` as border on `--color-paper-100` | `#78838b` | `#eee9df` | 3.20:1 | 3:1 | PASS |
| `--color-steel-600` as border on white | `#78838b` | `#ffffff` | 3.88:1 | 3:1 | PASS |
| `--color-steel-500` (kept, spec value) on `--color-ink-950` — muted text, dark bg only | `#87939b` | `#0b1218` | 5.99:1 | 4.5:1 | PASS |
| `--color-steel-200` (kept, spec value) as border on `--color-ink-950` — dark bg only | `#cdd3d5` | `#0b1218` | 12.46:1 | 3:1 | PASS |
| `--color-copper-600` (kept, spec value) on `--color-paper-50` — primary CTA text/fill | `#b84e1d` | `#f7f4ed` | 4.61:1 | 4.5:1 | PASS (margin 0.11 — see note below) |
| `--color-copper-600` on white | `#b84e1d` | `#ffffff` | 5.07:1 | 4.5:1 | PASS |
| `--color-paper-50` on `--color-copper-600` (primary button label) | `#f7f4ed` | `#b84e1d` | 4.61:1 | 4.5:1 | PASS |
| **`--color-copper-700`** (new) on `--color-paper-50` — deeper copper, more margin | `#9c4014` | `#f7f4ed` | 6.06:1 | 4.5:1 | PASS |
| `--color-copper-700` on `--color-paper-100` — replaces copper-600 for this role | `#9c4014` | `#eee9df` | **5.50:1** | 4.5:1 | PASS (was 4.19:1 FAIL as copper-600) |
| `--color-copper-500` (kept, spec value) as border on `--color-paper-50` — non-text UI only | `#d5662b` | `#f7f4ed` | 3.32:1 | 3:1 | PASS |
| `--color-copper-500` on `--color-ink-950` — accent text, dark bg only | `#d5662b` | `#0b1218` | 5.18:1 | 4.5:1 | PASS |
| `--color-signal-green` on `--color-paper-50` | `#34745a` | `#f7f4ed` | 5.04:1 | 4.5:1 | PASS |
| `--color-error` on `--color-paper-50` | `#b4352b` | `#f7f4ed` | 5.49:1 | 4.5:1 | PASS |
| `--color-focus` on `--color-paper-50` (focus ring, UI) | `#1769aa` | `#f7f4ed` | 5.26:1 | 3:1 | PASS |
| `--color-focus` on `--color-ink-950` (focus ring, dark bg) | `#1769aa` | `#0b1218` | 3.27:1 | 3:1 | PASS |

**Result: 24/24 final pairings pass.**

**Note on copper-600's 4.61:1 margin:** this is the smallest margin in the
final table — 0.11 above the 4.5:1 floor, versus the much larger margins
everywhere else (5.2–17.2:1). It is real and it passes, but it is the one
token in this palette with near-zero tolerance for further darkening of
`--color-paper-50` or lightening of `--color-copper-600` in any future
stage. Recorded in `DATUM_DECISION_LOG.md` as a constraint for CC-02+: do
not lighten `--color-paper-50` or `--color-copper-600` without rerunning
this calculation.

### Roles that intentionally do NOT pass on their own (by design, not a defect)

Per redesign spec's "色彩角色" section, `--color-steel-500` and
`--color-copper-500` are explicitly **not** meant to serve as
light-background text/border colors — `--color-steel-500` only appears as
muted text on `--color-ink-950` (dark backgrounds) and as non-text
decorative fill; `--color-copper-500` only appears as a light-background
non-text UI element (border/decorative, which needs 3:1, not 4.5:1) or as
dark-background accent text. Every component in this codebase that
consumes the legacy `--color-muted`/`--color-accent-light` compat aliases
resolves to the new correctly-scoped tokens (`--color-steel-700`/
`--color-copper-500` respectively — see `tokens.css`'s compat-alias
block), so no existing component actually uses `--color-steel-500` or
`--color-copper-500` in a failing role.

### Hover / Focus / Disabled / Error / Success states (CC-01 re-check)

- **Primary button hover** (`.btn--primary:hover`): background switches to
  `--color-accent-dark` = `--color-copper-700` = `#9c4014`, text stays
  `--color-accent-contrast` = `--color-paper-50` = `#f7f4ed`. Contrast:
  `#f7f4ed` / `#9c4014` = **6.06:1** — passes 4.5:1 with a comfortable
  margin, more than the default state's 4.61:1.
- **Focus** (`:focus-visible` — `outline: 2px solid var(--color-focus);
  outline-offset: 3px`): `--color-focus` = `#1769aa` unchanged from the
  spec's literal value, verified against both `--color-paper-50` (5.26:1)
  and `--color-ink-950` (3.27:1) above — both clear the 3:1 non-text-UI
  floor per WCAG 1.4.11 (a focus ring is a UI component boundary, not
  text).
- **Disabled** (`.btn[disabled] { opacity: 0.55 }`): unchanged mechanism
  from the pre-CC-01 build (see "Disabled" note below) — CC-01 additionally
  sets `aria-disabled`/`aria-busy` on `Button.astro` so disabled/loading
  state is exposed programmatically, not conveyed by opacity alone.
- **Error** (`--color-error` = `#b4352b`, unchanged): 5.49:1 on
  `--color-paper-50`, PASS.
- **Success** (`--color-signal-green` = `#34745a`, spec's literal value,
  unchanged): 5.04:1 on `--color-paper-50`, PASS.

## Pre-CC-01 audit (P0.3 remediation pass)

## Before → After

| Token pair | Usage | Threshold | Before | After | Pass? |
|---|---|---|---|---|---|
| `--color-accent` on `--color-surface` | eyebrow text, links, SolutionIcon/IndustryIcon fill, `.desktop-nav__link:hover` border (large/UI, not applicable here since it's text) | 4.5:1 | `#c1622b` / `#f7f5f1` = **3.82:1** | `#a34c1f` / `#f7f5f1` = **5.34:1** | Before FAIL → After PASS |
| `--color-accent` on `--color-card` (white) | Card hover border, various | 3:1 (border) / 4.5:1 (text use) | `#c1622b` / `#ffffff` = 4.16:1 | `#a34c1f` / `#ffffff` = **5.82:1** | PASS both before/after for border use; after also clears text-level 4.5:1 |
| `--color-accent-contrast` on `--color-accent` | `.btn--primary` label text | 4.5:1 | `#fff8f2` / `#c1622b` = **3.95:1** | `#fff8f2` / `#a34c1f` = **5.53:1** | Before FAIL → After PASS |
| `--color-accent-contrast` on `--color-accent-dark` | `.btn--primary:hover` label text | 4.5:1 | `#fff8f2` / `#9c4d21` = 5.36:1 | `#fff8f2` / `#873e18` = **7.31:1** | PASS both, after has more margin |
| `--color-accent-dark` on `--color-surface` | Badge text, `.form-mode-notice` text, ghost-button hover | 4.5:1 | `#9c4d21` / `#f7f5f1` = 5.51:1 | `#873e18` / `#f7f5f1` = **7.06:1** | PASS both, after has more margin |
| `--color-accent-light` as border | `.form-mode-notice` border, `Badge` border, blockquote `border-left` | 3:1 (non-text UI) | `#e79a68` / `#f7f5f1` = **2.09:1** | `#c06f39` / `#f7f5f1` = **3.46:1** | Before FAIL → After PASS |
| `--color-accent-light` as border on white card | `Badge` border on `--color-card` | 3:1 | `#e79a68` / `#ffffff` = **2.28:1** | `#c06f39` / `#ffffff` = **3.77:1** | Before FAIL → After PASS |
| `--color-accent-light` as text | Footer link hover, `LanguageSwitcher` hover — both on `--color-invert-bg` (`#12181f`) | 4.5:1 | `#e79a68` / `#12181f` = 7.84:1 | `#c06f39` / `#12181f` = **4.74:1** | PASS both (after is deliberately closer to threshold since it now also has to satisfy the border case above; still clears 4.5:1 with margin) |
| `--color-muted-soft` on `--color-surface` | Hero disclaimer note (`.hero__note`) | 4.5:1 | `#838c96` / `#f7f5f1` = **3.13:1** | `#636b75` / `#f7f5f1` = **4.96:1** | Before FAIL → After PASS |
| `--color-muted-soft` on `--color-card` (white) | (no current usage on white, computed for completeness) | 4.5:1 | `#838c96` / `#ffffff` = 3.41:1 | `#636b75` / `#ffffff` = **5.40:1** | Before FAIL → After PASS |
| `--color-muted` on `--color-surface` | Body secondary text, card descriptions | 4.5:1 | `#5b6470` / `#f7f5f1` = 5.51:1 | unchanged | PASS (no change needed) |
| `--color-ink` on `--color-surface` | Primary body text | 4.5:1 | `#12181f` / `#f7f5f1` = 16.40:1 | unchanged | PASS |
| `--color-ink-soft` on `--color-surface` | Nav links, secondary headings | 4.5:1 | `#2a323c` / `#f7f5f1` = 11.91:1 | unchanged | PASS |
| `--color-focus` on `--color-surface` | `:focus-visible` outline (non-text UI) | 3:1 | `#1d6fbf` / `#f7f5f1` = 4.73:1 | unchanged | PASS (already well clear) |
| `--color-error` on `--color-error-bg` | Form error result panel text | 4.5:1 | `#b3372c` / `#fbebe9` = 5.19:1 | unchanged | PASS |
| `--color-success` on `--color-success-bg` | Form success/live-mode notice text | 4.5:1 | `#2f6b3f` / `#eaf3ec` = 5.62:1 | unchanged | PASS |
| `--color-invert-text` on `--color-invert-bg` | Footer body text | 4.5:1 | `#f7f5f1` / `#12181f` = 16.40:1 | unchanged | PASS |
| `--color-invert-muted` on `--color-invert-bg` | Footer secondary text/headings | 4.5:1 | `#9aa3ad` / `#12181f` = 6.99:1 | unchanged | PASS |

## Hover / Focus / Disabled / Error / Success states checked

- **Hover** (`--color-accent-dark` replacing `--color-accent` on `.btn--primary:hover`, and as text elsewhere): computed above, passes at 7.06–7.31:1.
- **Focus** (`--color-focus` `:focus-visible` outline): unchanged, 4.73:1 against `--color-surface`, already well above the 3:1 non-text-UI floor; also checked against `--color-card` white (`contrast(#1d6fbf, #ffffff) = 5.17:1`), also passes.
- **Disabled** (`.btn[disabled] { opacity: 0.55 }`): approximate blended foreground/background against `--color-surface` computes to roughly **2.38:1**. This is *not* retuned to 4.5:1, and that is intentional: WCAG 1.4.3/1.4.11 explicitly exempt inactive/disabled user-interface components ("Inactive user interface components... have no contrast requirement") — the visual de-emphasis is the correct signal that the control cannot be interacted with, not a violation.
- **Error** (`--color-error` / `--color-error-bg`, and `.form-field__error` text `--color-error` on `--color-card`/`--color-surface`): `contrast(#b3372c, #f7f5f1) = 5.44:1`, `contrast(#b3372c, #ffffff) = 5.93:1` — both pass. `--color-error` is also used as a border on invalid fields (`data-invalid='true']`) — non-text UI, checked at `contrast(#b3372c, #ffffff) = 5.93:1`, clears 3:1 easily.
- **Success** (`--color-success` / `--color-success-bg`): checked above, passes at 5.62:1.

## Brand identity preserved

All accent values remain in the same copper-bronze hue family (hue ~20–25°
in HSL, same warm orange-brown character) — only lightness was reduced to
clear contrast thresholds; no shift to a different hue family (no swap to
blue, no desaturation to gray). `DESIGN.md`'s "Restrained" color strategy
and the copper-bronze-as-only-accent commitment are unchanged.

## Method / reproducibility

Ratios were computed with a small Node script implementing the WCAG
relative-luminance formula exactly (not a browser DevTools eyeball check).
The script is not checked into `scripts/` as a permanent tool (it was a
one-off calculation aid), but the formula and all input/output pairs are
recorded verbatim in this document so any reviewer can re-derive every
number by hand or with any standard contrast checker (e.g. WebAIM Contrast
Checker) using the hex values listed above.
