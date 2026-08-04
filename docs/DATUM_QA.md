# Precision Datum System — QA Log

Running QA record for the CC-00 → CC-10 redesign pass. Each stage appends its own
section with commands actually run and actual output — not restated claims.
Full historical QA prior to this redesign lives in `docs/QA_CHECKLIST.md` and
`docs/CODEX_REVIEW_HANDOFF.md` (P0/P1 remediation pass).

## CC-00 — Clean environment verification

**Date:** 2026-08-05
**Environment:** `node_modules`, `.astro`, `dist` deleted and rebuilt from
`pnpm-lock.yaml` — not the pre-existing install carried over from the prior pass.

```
$ pnpm install --frozen-lockfile
Lockfile is up to date, resolution step is skipped
Packages: +401
Done in 1.7s using pnpm v11.20.0

$ pnpm check
Result (78 files):
- 0 errors
- 0 warnings
- 9 hints        # all `is:inline` script-processing hints, pre-existing/cosmetic

$ pnpm build
[build] 50 page(s) built in 3.35s
[build] Complete!

$ pnpm check:h1
H1 check: 50 HTML files scanned, 2 excluded (redirect pages), 48 pass, 0 fail.

$ pnpm check:links
Link check: 50 HTML files scanned, 1951 internal links checked, 0 broken.

$ pnpm check:locale-routes
Insights entrySlug parity: 2 zh-tw slugs, 2 en slugs.
  OK — every insights slug has both locale versions built.
hreflang target check: 141 hreflang links checked across 50 pages, 0 broken.
```

No `pnpm test:e2e` / `pnpm test:axe` run this stage — CC-00 scope is baseline and
naming only, per the task book's explicit instruction not to touch page content or
run the full browser QA suite until CC-09. Those suites already passed in the prior
remediation round (198/198 Playwright, axe 0 critical/0 serious) against the
pre-redesign UI; they will be re-run against the new UI starting once CC-02
(Header/Hero spike) produces the first user-facing change.

**Not yet run this stage (deferred to CC-09 per task book):** Firefox/Edge/WebKit
cross-browser, Lighthouse, NVDA/VoiceOver manual pass, 200% zoom, forced-colors
check. Listing them here so their absence isn't mistaken for an oversight.
