# CC-02F-00 — Redact review bundle environment paths

**Status:** Done, committed separately as `fix(tooling): redact review
bundle environment paths` (hard gate, before any Hero work).

## Problem

`metadata/bundle-summary.txt` wrote the literal absolute `PROJECT_ROOT` and
the literal real `GIT_PATH_PREFIX` string into every bundle — leaking this
machine's private workspace layout (username, host directory structure,
parent-repo name) to whoever reviews the zip.

`tests/tooling/review-bundle.test.sh` hardcoded a literal
`leo-projects/side_project/` path segment in its parent-repo isolation
test, making the test depend on this real workspace's actual directory
layout instead of a disposable fixture.

## Fix

1. `scripts/create-review-bundle.sh`'s bundle-summary section now writes:
   ```
   Project root: .
   Nested repository: yes|no
   Project prefix redacted: yes
   ```
   instead of the real absolute path and prefix string.
2. `tests/tooling/review-bundle.test.sh` Test 1 rebuilt against a synthetic
   git fixture created fresh under `/tmp/review-bundle-test-XXXXXX/` for
   each run: a fake parent repo containing `sibling-project/` (dirtied on
   purpose) and `current-project/` (has its own `package.json`, a copy of
   the bundle script). The fixture is created, exercised, and deleted
   inside the test itself (trap-based cleanup, unconditional).
3. New Tests 13-16: no `/home/` in bundle-summary.txt, no real git prefix
   string in bundle-summary.txt, no absolute path into the real workspace
   anywhere in metadata/docs/handoff files, no hardcoded real parent-repo
   path in the test script's own source.

## Verification

`bash tests/tooling/review-bundle.test.sh` — 29/29 checks pass (was 20/20
before this fix; 9 new checks added net of the 2 legacy Test-1 assertions
it replaced).

## Acceptance criteria

- [x] `bundle-summary.txt` never contains `/home/` or the real
      `GIT_PATH_PREFIX` string.
- [x] Parent-repo isolation test runs against a synthetic fixture, not the
      real workspace.
- [x] Test script's own source contains no hardcoded real parent-repo
      directory name.
- [x] All tooling tests pass before any Hero/prototype work begins.
