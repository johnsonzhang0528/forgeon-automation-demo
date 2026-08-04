# CONTRAST_AUDIT.md

WCAG 2.x contrast ratios computed with the standard relative-luminance
formula (sRGB → linear per channel, `L = 0.2126R + 0.7152G + 0.0722B`,
`ratio = (L_lighter + 0.05) / (L_darker + 0.05)`), calculated by a small
Node script (not eyeballed). Thresholds used: **≥4.5:1** for normal text and
text-like UI (button labels, links, body copy), **≥3:1** for large text
(≥24px, or ≥19px bold) and non-text UI boundaries (borders, focus rings)
per WCAG 1.4.11.

All Token values live in `src/styles/tokens.css`.

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
