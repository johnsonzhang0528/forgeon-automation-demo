# 00 — Review bundle tooling hardening

**What to build:** Fix the six documented defects in
`scripts/create-review-bundle.sh` that ChatGPT's CC-01 bundle review found
(spec §4.1): parent-repo leakage into bundle metadata, the script not
including itself, screenshot binaries bloating `diff/changes.patch`,
non-project-relative patch paths, a stale historical Codex handoff riding
along by default, and `.claude/skills` noise in `changed-files.txt`.

**File scope:** `scripts/create-review-bundle.sh`,
`docs/engineering/REVIEW_BUNDLE_GUIDE.md`, new
`tests/tooling/review-bundle.test.sh`. No site source (`src/`) touched.

**Blocked by:** None — first task of the round.

**Status:** done

- [x] `git status`/`diff`/`log` calls scoped to `-- .`, with repo-root-
      relative paths from `diff`/`log` stripped back to project-relative;
      `git status`'s own cwd-relative output left unstripped (documented
      why — stripping it was the actual bug found and fixed mid-round).
- [x] `metadata/project-status.txt` (renamed from `status.txt`) contains
      only this project's paths, verified against the real parent repo's
      ~80 unrelated sibling-project changes at test time.
- [x] `source/scripts/create-review-bundle.sh` always present when the
      script itself changed in the commit range.
- [x] `diff/changes.patch` uses `--relative`, excludes
      `docs/screenshots/**` on top of the pre-existing font/skills/
      node_modules excludes.
- [x] `source/` supports `.sh` files and `.gitattributes`/`.gitignore`
      dotfiles, with an explicit belt-and-suspenders check for the bundle
      script and `package.json`.
- [x] Handoff selection prefers the current stage's own non-Codex doc over
      a bare "newest by mtime" pick.
- [x] `metadata/changed-files.txt` itself is now `EXCLUDE_GLOBS`-filtered;
      filtered-out paths land in the new `metadata/excluded-files.txt`
      instead of silently vanishing.
- [x] New `metadata/bundle-summary.txt` — one-page human index.
- [x] `tests/tooling/review-bundle.test.sh` covers all 12 checks from spec
      §4.9 — 20/20 assertions pass (several checks have multiple
      assertions).
- [x] **Hard gate**: if this ticket's tests fail, the whole CC-02 round
      stops — do not proceed to any prototype ticket. (Passed; round
      continued.)
