# Precision Datum System — Decision Log

Append-only log of decisions made during the CC-00 → CC-10 redesign. Each entry:
stage, decision, reasoning, alternatives considered where relevant.

## CC-00 — Baseline, clean install, naming unification

**Date:** 2026-08-05

**Git baseline.** Repo state before this stage: working tree clean for
`side_project/頁構所/demo-1/` except the two new redesign spec docs under
`docs/redesign/` (untracked, pre-existing from the prior conversation turn — these
are the instruction inputs for this pass, not stage output). No uncommitted work was
at risk of being overwritten. Prior history already has 12 commits from the initial
build and the P0/P1 remediation pass (baseline `cb23949` → `40d8c5a`). This stage
adds on top rather than resetting.

**Naming audit.** Searched the full project (excluding `node_modules`, `dist`,
`docs/redesign/` — the audit document itself intentionally discusses the naming risk
in prose) for `岳峰` (the incorrect name flagged in the audit report). Zero
occurrences in source, config, or content. The audit report's warning was about risk
in its own drafting process, not an actual defect in the codebase — the initial
build (see prior `SKILL_USAGE_LOG.md`) already used `鋒岳自動化` / `FORGEON
AUTOMATION` consistently throughout. No rename was necessary.

**Brand centralization check.** `src/config/site.ts` already holds
`siteConfig.brandNameZh` / `siteConfig.brandNameEn` as the single source for
brand-name-as-data (nav logo, footer, structured data, meta defaults). The ~20
files with the literal strings `鋒岳自動化` / `FORGEON AUTOMATION` found by grep are
page-level SEO copy (meta titles/descriptions), alt text, and body prose that
*mentions* the brand — not structural duplication of a config value. This is
expected: prose repeats the brand name the way any website's copy does; it is not
the kind of hardcoding the task book's "不在元件硬編碼品牌" rule is aimed at (that
rule targets components pulling brand name as a variable, which they already do via
`siteConfig`). No change made here; flagging so this isn't re-investigated in a
later stage.

**Clean install verification.** `node_modules`, `.astro`, and `dist` were removed
and rebuilt from scratch against the committed `pnpm-lock.yaml`:

- `pnpm install --frozen-lockfile` — 401 packages, resolved entirely from lockfile,
  no re-resolution needed.
- `pnpm check` (`astro check`) — 78 files, 0 errors, 0 warnings, 9 informational
  hints (all the same known `is:inline` script-processing hint on
  `define:vars` scripts in product/solution detail pages — cosmetic, not an error).
- `pnpm build` — 50 static pages built in ~3.3s, 0 errors.
- `pnpm check:h1` — 50 HTML files scanned, 2 redirect pages excluded, 48/48 content
  pages pass (exactly one H1 each).
- `pnpm check:links` — 1,951 internal links checked, 0 broken.
- `pnpm check:locale-routes` — 141 hreflang links checked across 50 pages, 0 broken;
  insights slug parity confirmed 2/2 across both locales.

**Secrets hygiene.** `.gitignore` already excludes `.env`, `.env.production`,
`node_modules/`, `dist/`, `.astro/`, and test-artifact directories
(`playwright-report/`, `test-results/`, `lighthouse-reports/`). `git ls-files`
confirms no `.env` or credential-shaped file has ever been committed under
`demo-1/`.

**Baseline tag.** Created `baseline/pre-datum-redesign` at the commit that adds
this CC-00 output, per the task book's instruction to establish a recoverable
baseline before CC-01 begins touching the design system.

**Outcome:** No functional changes to site code this stage. Three planning docs
added (`DATUM_REDESIGN_PLAN.md`, this file, `DATUM_QA.md`). Ready for CC-01.
