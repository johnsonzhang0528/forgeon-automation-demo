# 03 — Primary Action color token

**What to build:** New semantic `--color-action-primary` /
`--color-action-primary-hover` tokens for the CTA buttons the CC-02
prototypes render, verified at ≥5:1 contrast, without re-mapping
`--color-copper-600`'s existing (already-thin, 4.61:1) role site-wide.

**File scope:** `src/styles/tokens.css`, `docs/CONTRAST_AUDIT.md`. Consumed
(not defined) by the CC-02 prototype pages.

**Blocked by:** None.

**Status:** done

- [x] `--color-action-primary: var(--color-copper-700)` — 6.06:1 on
      `--color-paper-50`, clears the ≥5:1 target with real margin.
- [x] `--color-action-primary-hover` targets a new `--color-copper-800`
      (`#84340f`) — 7.71:1 on paper-50, same 19° hue as copper-600/700,
      one lightness step darker; hover has MORE margin than default,
      matching every other hover-state pattern already in
      `CONTRAST_AUDIT.md`.
- [x] `--color-copper-600` untouched — still the token for Datum Origin,
      highlight annotations, and existing 10-component text/link use.
- [x] `--color-copper-500` untouched — still non-text UI / dark-bg accent
      only.
- [x] No blanket re-mapping of legacy `--color-accent`/`--color-accent-*`
      aliases.
- [x] `docs/CONTRAST_AUDIT.md` updated with the full verified pairing table
      and hue check for the new tokens.
- [x] Prototype(s) must actually render the new token on their primary CTA
      button — verified in Variant A/B/C (ticket 06/07/08).
