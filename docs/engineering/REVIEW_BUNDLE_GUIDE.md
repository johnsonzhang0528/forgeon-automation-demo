# ChatGPT Review Bundle Guide

Development happens on a remote host. A local ChatGPT session can't reach
this private repo directly. `scripts/create-review-bundle.sh` (via
`pnpm review:bundle`) produces a small, redacted zip of one dev stage's
changes so that's the only thing that needs downloading and uploading — not
the whole project.

## Workflow: after finishing a dev stage

1. Claude finishes the stage's work and runs its tests.
2. Commit the stage's changes.
3. Run `/handoff` so `docs/engineering/handoffs/` has a current handoff doc
   — the bundle script picks up the most recent one automatically.
4. Codex (or whichever external reviewer) does its independent review.
5. Save that review's output into the repo (e.g. under
   `docs/engineering/reviews/`).
6. Build the review bundle:

   ```bash
   pnpm review:bundle <base-commit> <stage-label>
   ```

   `<base-commit>` is whatever the stage started from — usually the prior
   stage's final commit or an explicit baseline tag. `<stage-label>`
   becomes the zip's filename component and also the string the script
   uses to find stage-specific screenshots and label-scoped docs (see
   below) — use the same label consistently for a stage's spec, tickets,
   reviews, and screenshots so the bundle picks them all up.

   ```bash
   pnpm review:bundle eadf381 cc01-posthoc
   pnpm review:bundle 21dd6bc cc02-hero-spike
   ```

7. Download only the resulting zip from `.review-bundles/`.
8. Upload it to the local ChatGPT session.
9. Alongside the upload, paste the Preview URL (if the stage produced one)
   and the commit hash from `metadata/head.txt` inside the zip — so the
   reviewer has an unambiguous pointer back to the real state, not just the
   bundle's contents.

## Large / milestone review

Routine stage-to-stage review should always use incremental mode (above).
Reach for full mode only for a large milestone handoff spanning many
stages, where a reviewer genuinely needs the whole tracked source tree, not
just a diff:

```bash
pnpm review:bundle --full milestone-cc01
```

Full mode uses `git archive` against `HEAD`'s tracked files (see
[How it works](#how-it-works) below for what that includes/excludes) —
it has no "diff", so `diff/changes.patch` and `source/` (the
changed-files-only copy) don't apply; everything else (handoff,
label-scoped docs, screenshots, test reports, metadata, secret scan) still
runs the same way.

## What's in a bundle

```
<timestamp>-<label>/
├── metadata/
│   ├── head.txt              # git rev-parse HEAD
│   ├── base.txt               # git rev-parse <base-ref>  (full mode: a note, no base)
│   ├── status.txt             # git status --short at bundle time
│   ├── commits.txt            # git log <base>..HEAD --oneline
│   ├── changed-files.txt      # git diff --name-status <base>..HEAD (full mode: full tree listing)
│   ├── file-sizes.txt         # size + path for each changed file (incremental only)
│   └── excluded-binaries.txt  # binaries that exist in the diff but were left out of the patch
├── diff/
│   └── changes.patch          # git diff --binary <base>..HEAD, incremental mode only
├── handoff/
│   └── <latest>.md            # newest file in docs/engineering/handoffs/, or a MISSING.txt note
├── docs/
│   ├── specs/…                # docs/engineering/specs/ files whose path contains the label
│   ├── tickets/…               # docs/engineering/tickets/ files whose path contains the label
│   ├── reviews/…               # docs/engineering/reviews/ files whose path contains the label
│   ├── adr/…                   # all of docs/adr/, unfiltered — small and always relevant
│   └── CONTEXT.md              # always included, unfiltered
├── source/                     # incremental only: changed text files, by allowed extension, original paths preserved
├── source-archive/             # full mode only: git archive output (see What's excluded below)
├── screenshots/                # <label>-desktop.png / -tablet.png / -mobile.png if present, else a listing of what IS available
└── test-reports/                # whichever of DATUM_QA.md / QA_CHECKLIST.md / IMPECCABLE_REVIEW_LOG.md / CONTRAST_AUDIT.md exist
```

### Label matching, precisely

The "label-scoped" doc copies (specs/tickets/reviews) match a file's full
path against **either** of two things, case-insensitively:

1. The full label you passed, as a substring — e.g. label
   `cc01-posthoc` matches a review file named
   `CC-01-posthoc-fix-review.md`.
2. The label's leading stage prefix alone (its `cc` + digits run, if it
   has one) — e.g. label `cc01-chatgpt-review` extracts stage prefix
   `cc01` and, via that prefix, still matches `CC-01-verification-spec.md`,
   `CC-01-two-axis-review.md`, and every other `CC-01-*` doc, even though
   none of those filenames contain the literal string
   "chatgpt-review". Without this second match, any bundle whose label is
   a *descriptive sub-label* rather than the bare stage id would silently
   come back with zero matched specs/tickets/reviews, since this repo's
   docs are named after their CC-stage, not after individual bundle runs.

A label with no `ccNN` prefix (e.g. `milestone-launch`) only gets the
full-label substring match — there's no stage to fall back to.

A label that matches neither returns nothing for that category — the
bundle is still created, just without those docs. This is deliberate
(§four of the source spec: don't indiscriminately copy the whole history),
not a bug — check `metadata/changed-files.txt` and the terminal output if
a bundle looks thinner than expected.

Screenshot matching is exact-name only
(`docs/screenshots/<label>-desktop.png` etc., full label, no stage-prefix
fallback) — if no exact match exists, `screenshots/NO_EXACT_MATCH.txt`
lists what's actually in `docs/screenshots/` so you can see what to rename
or regenerate, rather than the bundle silently including every historical
screenshot. If a stage's screenshots use a different naming convention
than the label you want for this bundle (e.g. screenshots are
`cc01-design-system-*.png` but you're building a `cc01-chatgpt-review`
bundle), the screenshots won't auto-match — pass the exact screenshot
label prefix as your bundle's label instead, or accept the
`NO_EXACT_MATCH.txt` listing and reference the screenshots by their real
path in whatever you're handing the bundle to.

### What's excluded, always

Regardless of mode:

- `public/fonts/**`, `node_modules/**`, `dist/**`, `.astro/**`,
  `test-results/**`, `playwright-report/**`, `.review-bundles/**`,
  `.env`, `.env.*`
- In `--full` mode specifically, `.claude/skills/**` is also excluded (via
  `.gitattributes` `export-ignore`) — third-party skill packages are
  installed tooling, not this project's source, and their documentation
  legitimately discusses several of the environment-variable-name patterns
  listed under [Secret scanning](#secret-scanning) below as illustrative
  examples, which would otherwise trip that scan on every full-mode run
  for no real reason.
- Binary files that changed are never written into `diff/changes.patch`
  even in incremental mode — they're listed by path and size in
  `metadata/excluded-binaries.txt` instead, whether they were skipped
  because they match one of the excluded globs above or because `git diff`
  itself reports them as binary.

## Secret scanning

Runs on the fully-staged bundle contents, before any zip is written.
Blocks (exit code `3`, no zip produced, staging directory left in place at
`.review-bundles/<timestamp>-<label>/` for inspection) if either check
finds something.

Two checks run: a **filename check** against a short list of
secret-shaped basenames (env files, private-key files, anything named
"credentials" or "secrets"), and a **content check** that greps every
staged text file for a handful of common secret-declaration patterns
(cloud/API credential env-var names, a plaintext-password assignment
pattern, and PEM private-key headers). The exact pattern lists live in
`FORBIDDEN_NAME_PATTERNS` and `FORBIDDEN_CONTENT_PATTERNS` near the top of
`scripts/create-review-bundle.sh` — read them there rather than here, so
this guide doesn't itself become a file full of secret-shaped strings that
trips the very scan it's describing.

`.env.example`, `.env.sample`, and `.env.template` are explicitly exempt
from the *filename* check only — they're real, safe-to-share template
files (this repo's own `.env.example` is tracked in git). Content scanning
still runs on them; a real secret value pasted into one would still block
the bundle.

When blocked, the terminal output lists which staged *paths* triggered a
match — never the matched value itself. If a block looks like a false
positive (a doc that discusses these pattern names without containing a
real secret — this guide included, which is exactly why the pattern list
isn't repeated above), the fix is to either exclude that path from the
bundle's source list or rephrase the offending content so it doesn't
contain the literal trigger string, not to weaken the scan patterns
themselves.

## Size

20MB soft cap on the staged (pre-zip) contents. Over that, the script
prints the 20 largest staged files and asks for interactive confirmation
before continuing — it never silently drops files or recompresses images
to get under the limit. If you hit this regularly, the likely cause is a
large diff (many changed files, or a big rewritten doc) rather than an
actual bug; check `metadata/file-sizes.txt` in the resulting bundle to see
what's driving it.

## Fallback behavior

- **Zip tool**: prefers system `zip`; if that binary isn't on `PATH`, falls
  back to Python's `zipfile` module automatically (this sandbox doesn't
  have `zip` installed, and the fallback is what actually produced every
  verification bundle referenced in this guide). No system package install
  is attempted either way.
- **`unzip`**: not required by the script itself. To inspect a bundle
  without `unzip` installed, use Python:
  ```bash
  python3 -c "import zipfile; [print(n) for n in zipfile.ZipFile('BUNDLE.zip').namelist()]"
  ```

## Sample manifest

`docs/engineering/review-bundle-sample-manifest.txt` is the file listing
from a real verification run (`pnpm review:bundle eadf381 cc01-test`) —
useful as a concrete reference for what a bundle actually contains before
you build your first real one.

## What this tool will never do

- Upload anything anywhere automatically.
- `git push`.
- Create or touch any public repo, or change repo visibility.
- Silently include a secret, a font binary, `node_modules`, or `dist`.
- Recompress or otherwise degrade any file to hit the size target.
- Modify site code or behavior — this is a packaging tool only.
