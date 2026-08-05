#!/usr/bin/env bash
# Build a small, redacted, reviewable zip of one dev stage's changes so it can
# be uploaded to a local ChatGPT session without cloning the private repo.
# See docs/engineering/REVIEW_BUNDLE_GUIDE.md for the workflow this fits into.
set -euo pipefail

# ---------------------------------------------------------------------------
# Paths / constants
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Refuse to run from anywhere but this project's own root — a bundle built
# from the wrong cwd would silently scope every git command to the wrong
# tree. package.json is this project's own identity marker (checked instead
# of e.g. .git, since .git may not even exist at PROJECT_ROOT when nested
# inside a larger repo — see GIT_ROOT below).
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo "Error: package.json not found at $PROJECT_ROOT — this script must run from the project root." >&2
  exit 1
fi

GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$GIT_ROOT" ]; then
  echo "Error: not inside a git repository." >&2
  exit 1
fi

# Force `git` to print raw UTF-8 paths instead of C-style-quoting and
# octal-escaping any non-ASCII byte (git's default `core.quotepath=true`).
# This project's path contains Chinese characters (頁構所), and every path
# comparison below (prefix-stripping, exclusion-glob matching) breaks
# silently if git hands back `"...\351\240\201..."` instead of the literal
# UTF-8 bytes. GIT_QUOTEPATH_OPTS is prepended to every git invocation that
# reads or compares a path.
GIT_QUOTEPATH_OPTS=(-c core.quotepath=false)

# This project can live nested inside a larger git repo (its own git
# top-level may be several directories above PROJECT_ROOT). Every git
# plumbing command below reports paths relative to the *repo* root, not
# PROJECT_ROOT — GIT_PATH_PREFIX is what to strip off the front of those
# paths to get a path relative to this project. When PROJECT_ROOT *is* the
# repo root, this is empty and stripping is a no-op.
GIT_PATH_PREFIX="$(git "${GIT_QUOTEPATH_OPTS[@]}" rev-parse --show-prefix 2>/dev/null || true)"

strip_git_prefix() {
  # strip_git_prefix <repo-root-relative-path> -> project-relative path
  local p="$1"
  if [ -n "$GIT_PATH_PREFIX" ] && [[ "$p" == "$GIT_PATH_PREFIX"* ]]; then
    printf '%s' "${p#"$GIT_PATH_PREFIX"}"
  else
    printf '%s' "$p"
  fi
}

BUNDLE_ROOT="$PROJECT_ROOT/.review-bundles"
MAX_BUNDLE_BYTES=$((20 * 1024 * 1024)) # 20MB soft cap — warn, don't block

# Text-source extensions eligible for inclusion under diff/source/. `sh` and
# `.gitattributes`/`.gitignore` (handled separately below, since they have no
# extension) were missing before this fix (spec §4.1 finding #2/§4.5) —
# scripts/create-review-bundle.sh itself, and any other shell tooling this
# project's stages add, was silently never copied into source/ even when it
# was the literal subject of the stage's own diff.
SOURCE_EXTENSIONS="astro ts js mjs sh css scss md json yaml yml html"

# Dotfiles with no extension that must still be picked up by the changed-
# source copy when they appear in the diff (spec §4.5's explicit list).
SOURCE_DOTFILES=(".gitattributes" ".gitignore")

# Directories/globs never copied into a bundle, regardless of mode
EXCLUDE_GLOBS=(
  "public/fonts/*"
  "node_modules/*"
  "dist/*"
  ".astro/*"
  "test-results/*"
  "playwright-report/*"
  ".review-bundles/*"
  ".env"
  ".env.*"
  # Third-party skill packages are installed tooling, not this project's
  # own source under review — excluded from source/ the same way
  # .gitattributes export-ignores them from --full mode's git-archive
  # output, so both modes stay consistent and a bundle doesn't balloon
  # with unrelated skill documentation a reviewer didn't ask to see.
  ".claude/skills/*"
  # Screenshots are binary and are already staged separately, in full,
  # under screenshots/ (see §6 below) — they must never also land inside
  # diff/changes.patch (which would balloon a patch to multiple MB of
  # base64/binary diff noise) or metadata/changed-files.txt's source copy.
  "docs/screenshots/*"
)

# ---------------------------------------------------------------------------
# Usage
# ---------------------------------------------------------------------------

usage() {
  cat <<'EOF'
Usage:
  pnpm review:bundle <base-ref> <label>
  pnpm review:bundle --full <label>

Incremental mode (default):
  Packages the diff between <base-ref> and HEAD into a small, redacted zip
  under .review-bundles/. Use this after finishing a dev stage.

    pnpm review:bundle eadf381 cc01-posthoc
    pnpm review:bundle 21dd6bc cc02-hero-spike

Full mode:
  Packages the entire git-tracked source tree via `git archive` (still
  excludes fonts/secrets/build output). Use only for large milestone
  handoffs, not routine incremental review.

    pnpm review:bundle --full milestone-cc01

Both modes:
  - Refuse to run with missing arguments (no guessing a base ref).
  - Refuse to produce a zip if a secret-shaped file or content pattern is
    found in what would be bundled.
  - Write output to .review-bundles/YYYYMMDD-HHMM-<label>.zip
EOF
}

fail_usage() {
  echo "Error: $1" >&2
  echo >&2
  usage >&2
  exit 1
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

MODE="incremental"
BASE_REF=""
LABEL=""

if [ "$#" -eq 0 ]; then
  fail_usage "no arguments given."
fi

if [ "$1" = "--full" ]; then
  MODE="full"
  if [ "$#" -lt 2 ] || [ -z "${2:-}" ]; then
    fail_usage "--full requires a <label>."
  fi
  LABEL="$2"
else
  if [ "$#" -lt 2 ] || [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
    fail_usage "requires <base-ref> and <label>."
  fi
  BASE_REF="$1"
  LABEL="$2"
fi

# Label becomes a filename component — keep it filesystem-safe.
if ! [[ "$LABEL" =~ ^[A-Za-z0-9._-]+$ ]]; then
  fail_usage "label '$LABEL' must be alphanumeric plus '.', '_', '-' only."
fi

if [ "$MODE" = "incremental" ]; then
  if ! git rev-parse --verify --quiet "$BASE_REF^{commit}" >/dev/null; then
    fail_usage "base-ref '$BASE_REF' does not resolve to a commit in this repo."
  fi
fi

# ---------------------------------------------------------------------------
# Workspace
# ---------------------------------------------------------------------------

TIMESTAMP="$(date +%Y%m%d-%H%M)"
BUNDLE_NAME="${TIMESTAMP}-${LABEL}"
WORK_DIR="$BUNDLE_ROOT/${BUNDLE_NAME}"
ZIP_PATH="$BUNDLE_ROOT/${BUNDLE_NAME}.zip"

mkdir -p "$BUNDLE_ROOT"

if [ -e "$WORK_DIR" ]; then
  fail_usage "staging directory already exists: $WORK_DIR (remove it or wait a minute for a new timestamp)"
fi

mkdir -p "$WORK_DIR"

cleanup_staging() {
  rm -rf "$WORK_DIR"
}
# Only auto-clean on a successful run; on failure we leave the staging dir
# so the user can inspect what would have gone in.
SUCCESS=0
on_exit() {
  if [ "$SUCCESS" -eq 1 ]; then
    cleanup_staging
  else
    echo "Staging directory left in place for inspection: $WORK_DIR" >&2
  fi
}
trap on_exit EXIT

echo "== Review bundle: $BUNDLE_NAME =="
echo "Mode: $MODE"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

is_excluded_path() {
  local path="$1"
  local glob
  for glob in "${EXCLUDE_GLOBS[@]}"; do
    # shellcheck disable=SC2053
    if [[ "$path" == $glob ]]; then
      return 0
    fi
  done
  return 1
}

copy_preserving_dirs() {
  # copy_preserving_dirs <src-relative-path> <dest-root>
  local rel="$1"
  local dest_root="$2"
  local dest="$dest_root/$rel"
  mkdir -p "$(dirname "$dest")"
  cp -p "$rel" "$dest"
}

# ---------------------------------------------------------------------------
# 1. Metadata
# ---------------------------------------------------------------------------

mkdir -p "$WORK_DIR/metadata"

git rev-parse HEAD > "$WORK_DIR/metadata/head.txt"

if [ "$MODE" = "incremental" ]; then
  git rev-parse "$BASE_REF" > "$WORK_DIR/metadata/base.txt"
else
  echo "(full mode — no base ref; this is a complete tracked-source snapshot at HEAD)" > "$WORK_DIR/metadata/base.txt"
fi

# `git status --short` (no pathspec) reports the ENTIRE repo's working-tree
# state, including any other project living in a sibling directory of the
# larger parent repo this project is nested inside. `-- .` scopes it to
# PROJECT_ROOT only.
#
# Unlike `git diff --name-status` (used below for changed-files.txt), which
# always prints paths relative to the *repo root* regardless of cwd, `git
# status --short` prints paths relative to the *current working directory*
# — and this script already `cd`'d to PROJECT_ROOT at startup. So status
# output here is already project-relative with no GIT_PATH_PREFIX stripping
# needed; applying strip_git_prefix() to it (as an earlier draft of this fix
# did) actively breaks it, since a project-relative path never starts with
# GIT_PATH_PREFIX and the "did stripping do nothing -> must be outside the
# project, skip it" defensive check then discards every real line. Renamed
# to project-status.txt (not status.txt) so its project-scoped contract is
# unambiguous from the filename alone, per spec §4.7.
git "${GIT_QUOTEPATH_OPTS[@]}" status --short -- . > "$WORK_DIR/metadata/project-status.txt"

if [ "$MODE" = "incremental" ]; then
  # `git log` has no per-path "changed only inside this pathspec" concept for
  # --oneline history the way diff/status do, but scoping with `-- .` still
  # matters: without it, a merge/parent-repo-wide commit that touched zero
  # files under this project would still appear here, which is exactly the
  # kind of parent-repo noise this fix is removing project-wide.
  git "${GIT_QUOTEPATH_OPTS[@]}" log "$BASE_REF..HEAD" --oneline -- . > "$WORK_DIR/metadata/commits.txt"
  # `git diff --name-status` reports paths relative to the repo root, which
  # differs from PROJECT_ROOT whenever this project is nested inside a
  # larger repo. Strip GIT_PATH_PREFIX here, once, so every downstream
  # consumer of changed-files.txt gets project-relative paths for free —
  # and so a file that changed outside this project (shouldn't happen given
  # the pathspec, but be defensive) is dropped rather than mis-copied.
  #
  # The exclude-glob pathspecs are applied here too (not just when copying
  # into source/ later) — otherwise changed-files.txt itself lists every
  # historically-touched .claude/skills/** file whenever BASE_REF predates
  # the skills-install commit, which is pure reviewer noise for a doc whose
  # entire purpose is "what changed in this project this stage" (spec §4.1
  # finding #6). Excluded-but-real changes are still recorded, separately,
  # in metadata/excluded-files.txt below — nothing is silently dropped from
  # the bundle's account of what happened, just kept out of the noisy list.
  CHANGED_FILES_EXCLUDE_ARGS=()
  for glob in "${EXCLUDE_GLOBS[@]}"; do
    CHANGED_FILES_EXCLUDE_ARGS+=(":(exclude)$glob")
  done
  : > "$WORK_DIR/metadata/changed-files.txt"
  : > "$WORK_DIR/metadata/excluded-files.txt"
  while IFS=$'\t' read -r status raw_path rest; do
    [ -z "$raw_path" ] && continue
    rel_path="$(strip_git_prefix "$raw_path")"
    # Defensive: if stripping did nothing but the prefix is non-empty, the
    # path was outside this project's tree — skip it rather than guess.
    if [ -n "$GIT_PATH_PREFIX" ] && [ "$rel_path" = "$raw_path" ]; then
      continue
    fi
    if [ -n "$rest" ]; then
      printf '%s\t%s\t%s\n' "$status" "$rel_path" "$rest" >> "$WORK_DIR/metadata/changed-files.txt"
    else
      printf '%s\t%s\n' "$status" "$rel_path" >> "$WORK_DIR/metadata/changed-files.txt"
    fi
  done < <(git "${GIT_QUOTEPATH_OPTS[@]}" diff --name-status "$BASE_REF..HEAD" -- . "${CHANGED_FILES_EXCLUDE_ARGS[@]}")

  # Separately record what WAS excluded, so a reviewer can see the full
  # picture (e.g. "24 skill files changed but are intentionally out of
  # scope") without those paths cluttering changed-files.txt itself. A
  # direct second pass over the unfiltered diff, checked against the same
  # is_excluded_path() glob matcher used everywhere else in this script —
  # deliberately not a comm/diff between the two file lists, since that
  # would depend on both files sharing identical sort order.
  while IFS=$'\t' read -r status raw_path rest; do
    [ -z "$raw_path" ] && continue
    rel_path="$(strip_git_prefix "$raw_path")"
    if [ -n "$GIT_PATH_PREFIX" ] && [ "$rel_path" = "$raw_path" ]; then
      continue
    fi
    if is_excluded_path "$rel_path"; then
      printf '%s\t%s\n' "$status" "$rel_path" >> "$WORK_DIR/metadata/excluded-files.txt"
    fi
  done < <(git "${GIT_QUOTEPATH_OPTS[@]}" diff --name-status "$BASE_REF..HEAD" -- .)
else
  git log -1 --oneline > "$WORK_DIR/metadata/commits.txt"
  # `ls-tree -r --name-only HEAD` with no pathspec lists the *whole repo*,
  # not just this project — scope it to "." (cwd, i.e. PROJECT_ROOT) and
  # strip the repo-root prefix the same way the incremental branch does,
  # so full-mode's changed-files.txt only ever lists this project's files.
  : > "$WORK_DIR/metadata/changed-files.txt"
  while IFS= read -r raw_path; do
    [ -z "$raw_path" ] && continue
    rel_path="$(strip_git_prefix "$raw_path")"
    if [ -n "$GIT_PATH_PREFIX" ] && [ "$rel_path" = "$raw_path" ]; then
      continue
    fi
    printf 'A\t%s\n' "$rel_path" >> "$WORK_DIR/metadata/changed-files.txt"
  done < <(git "${GIT_QUOTEPATH_OPTS[@]}" ls-tree -r --name-only HEAD -- .)
fi

: > "$WORK_DIR/metadata/file-sizes.txt"
: > "$WORK_DIR/metadata/excluded-binaries.txt"

if [ "$MODE" = "incremental" ]; then
  while IFS=$'\t' read -r status path _rest; do
    [ -z "$path" ] && continue
    [ -f "$path" ] || continue
    size=$(stat -c '%s' "$path" 2>/dev/null || stat -f '%z' "$path" 2>/dev/null || echo "?")
    echo "$size	$path" >> "$WORK_DIR/metadata/file-sizes.txt"
  done < "$WORK_DIR/metadata/changed-files.txt"
fi

echo "-- metadata written"

# ---------------------------------------------------------------------------
# 2. Patch (incremental mode only — full mode has no "diff")
# ---------------------------------------------------------------------------

if [ "$MODE" = "incremental" ]; then
  mkdir -p "$WORK_DIR/diff"

  # Build a pathspec that excludes the binary/secret-risk globs from the
  # patch itself, so large binaries never land in diff/changes.patch even
  # in --binary mode. Excluded files are still noted in changed-files.txt
  # and, if binary, listed in excluded-binaries.txt below.
  #
  # This script's own path is excluded here too, but for a different
  # reason than the EXCLUDE_GLOBS entries: it's not a secret or a binary,
  # it's fully readable elsewhere in the bundle (source/scripts/create-
  # review-bundle.sh, incremental mode's changed-source copy), and
  # including it in the patch would just recreate, in a second place, the
  # same problem the content-exempt-path check below already solves once
  # — FORBIDDEN_CONTENT_PATTERNS necessarily contains its own pattern
  # names as literal strings, so a patch hunk adding this file always
  # self-matches the content scan. It is intentionally NOT added to
  # EXCLUDE_GLOBS itself, since that array also governs what's copied
  # into source/ (§5 below) — the script should still appear there in
  # full, just not duplicated inside the patch.
  PATCH_EXCLUDE_ARGS=(":(exclude)scripts/create-review-bundle.sh")
  for glob in "${EXCLUDE_GLOBS[@]}"; do
    PATCH_EXCLUDE_ARGS+=(":(exclude)$glob")
  done

  # --relative rewrites a/ and b/ patch paths to be relative to the pathspec
  # root (here, `.` = PROJECT_ROOT, since the script cd'd there at startup)
  # instead of the git repo root — without it, every hunk header in a
  # nested-project checkout reads "a/leo-projects/side_project/頁構所/
  # demo-1/src/..." (the full parent-repo prefix, and in this repo's case, a
  # private absolute-feeling path segment), not "a/src/...". This was
  # ChatGPT finding #4 (spec §4.1): patch paths must be project-relative.
  git "${GIT_QUOTEPATH_OPTS[@]}" diff --binary --relative "$BASE_REF..HEAD" -- . "${PATCH_EXCLUDE_ARGS[@]}" \
    > "$WORK_DIR/diff/changes.patch"

  # Record any changed binary file (regardless of whether it was excluded
  # from the patch by path) so the reviewer knows it exists but isn't here.
  while IFS=$'\t' read -r status path _rest; do
    [ -z "$path" ] && continue
    [ -f "$path" ] || continue
    if is_excluded_path "$path"; then
      size=$(stat -c '%s' "$path" 2>/dev/null || stat -f '%z' "$path" 2>/dev/null || echo "?")
      echo "$path (${size} bytes) — excluded by policy" >> "$WORK_DIR/metadata/excluded-binaries.txt"
      continue
    fi
    if git "${GIT_QUOTEPATH_OPTS[@]}" diff --numstat "$BASE_REF..HEAD" -- "$path" | grep -q '^-\s*-\s*'; then
      size=$(stat -c '%s' "$path" 2>/dev/null || stat -f '%z' "$path" 2>/dev/null || echo "?")
      echo "$path (${size} bytes) — binary, omitted from patch" >> "$WORK_DIR/metadata/excluded-binaries.txt"
    fi
  done < "$WORK_DIR/metadata/changed-files.txt"

  echo "-- patch written: diff/changes.patch"
fi

# ---------------------------------------------------------------------------
# 3. Handoff (latest only)
# ---------------------------------------------------------------------------

mkdir -p "$WORK_DIR/handoff"
SELECTED_HANDOFF=""

# Prefer, in order: (1) a handoff matching this bundle's own label/stage
# prefix — i.e. the doc actually written for the reviewer this bundle is
# for; (2) failing that, the most recently modified handoff that is NOT a
# *-codex-*.md file. A bare "most recent file by mtime" (the prior
# behavior) can resurface a stale historical Codex handoff purely because
# it happens to have a newer mtime than the current stage's real ChatGPT
# handoff (e.g. after a rebase/checkout touches file times) — spec §4.1
# finding #5: a ChatGPT bundle should not carry a historical Codex handoff
# unless nothing else exists.
if [ -d "docs/engineering/handoffs" ]; then
  STAGE_MATCH=""
  if [[ "$LABEL" =~ ^([Cc][Cc][0-9]+) ]]; then
    STAGE_MATCH="${BASH_REMATCH[1]}"
  fi
  if [ -n "$STAGE_MATCH" ]; then
    SELECTED_HANDOFF=$(ls -t docs/engineering/handoffs/*.md 2>/dev/null \
      | grep -i "$STAGE_MATCH" \
      | grep -iv "codex" \
      | head -n 1 || true)
  fi
  if [ -z "$SELECTED_HANDOFF" ]; then
    SELECTED_HANDOFF=$(ls -t docs/engineering/handoffs/*.md 2>/dev/null \
      | grep -iv "codex" \
      | head -n 1 || true)
  fi
  # Last resort: even a Codex handoff is better than nothing, but only if
  # truly nothing else exists.
  if [ -z "$SELECTED_HANDOFF" ]; then
    SELECTED_HANDOFF=$(ls -t docs/engineering/handoffs/*.md 2>/dev/null | head -n 1 || true)
  fi
fi

if [ -n "$SELECTED_HANDOFF" ]; then
  cp -p "$SELECTED_HANDOFF" "$WORK_DIR/handoff/"
  echo "-- handoff included: $SELECTED_HANDOFF"
else
  echo "WARNING: no docs/engineering/handoffs/*.md found — bundle will not include a handoff doc." >&2
  echo "(no handoff document found at bundle time)" > "$WORK_DIR/handoff/MISSING.txt"
fi

# ---------------------------------------------------------------------------
# 4. Spec / Ticket / Review / ADR / CONTEXT — label-scoped, not the whole history
# ---------------------------------------------------------------------------

mkdir -p "$WORK_DIR/docs"

# This repo's specs/tickets/reviews are named by CC-stage ("CC-01-...",
# "CC-02-..."), not by a bundle's specific sub-label ("cc01-chatgpt-review",
# "cc01-posthoc") — so matching only the full label against doc filenames
# would silently drop every stage doc whenever the label is a sub-label
# rather than the bare stage id. Extract a stage prefix from the label
# (its leading "cc" + digits run, e.g. "cc01" out of "cc01-chatgpt-review")
# when present, and match docs against EITHER the full label OR that stage
# prefix — so both a bare-stage label and a descriptive sub-label find the
# same stage's docs, without requiring every doc filename to literally
# repeat the sub-label.
STAGE_PREFIX=""
if [[ "$LABEL" =~ ^([Cc][Cc][0-9]+) ]]; then
  STAGE_PREFIX="${BASH_REMATCH[1]}"
fi

copy_label_scoped_dir() {
  # copy_label_scoped_dir <src-dir> <dest-subdir-name>
  local src="$1"
  local dest_name="$2"
  [ -d "$src" ] || return 0

  local matches=()
  while IFS= read -r -d '' f; do
    matches+=("$f")
  done < <(find "$src" -type f -iname "*${LABEL}*" -print0 2>/dev/null)

  if [ -n "$STAGE_PREFIX" ]; then
    while IFS= read -r -d '' f; do
      matches+=("$f")
    done < <(find "$src" -type f -iname "*${STAGE_PREFIX}*" -print0 2>/dev/null)
  fi

  if [ "${#matches[@]}" -gt 0 ]; then
    # De-duplicate — a file can satisfy both the full-label and
    # stage-prefix searches above.
    local seen=()
    local f rel already
    for f in "${matches[@]}"; do
      rel="${f#$PROJECT_ROOT/}"
      already=0
      for s in "${seen[@]:-}"; do
        [ "$s" = "$rel" ] && { already=1; break; }
      done
      [ "$already" -eq 1 ] && continue
      seen+=("$rel")
      copy_preserving_dirs "$rel" "$WORK_DIR"
    done
  fi
}

# Label-scoped copy for specs/tickets/reviews (matches the full label,
# e.g. "cc01-posthoc" against a "CC-01-posthoc-*" ticket file, OR the
# stage prefix alone, e.g. "cc01" against any "CC-01-*" doc — see
# STAGE_PREFIX above for why both are needed).
copy_label_scoped_dir "docs/engineering/specs" "specs"
copy_label_scoped_dir "docs/engineering/tickets" "tickets"
copy_label_scoped_dir "docs/engineering/reviews" "reviews"

# ADRs and CONTEXT.md are small and stage-independent context a reviewer
# always needs — included in full, not filtered by label.
if [ -d "docs/adr" ] && [ -n "$(ls -A docs/adr 2>/dev/null)" ]; then
  mkdir -p "$WORK_DIR/docs/adr"
  cp -rp docs/adr/. "$WORK_DIR/docs/adr/"
fi
if [ -f "CONTEXT.md" ]; then
  cp -p CONTEXT.md "$WORK_DIR/docs/CONTEXT.md"
fi

echo "-- label-scoped docs copied (specs/tickets/reviews matching '*${LABEL}*', plus ADRs + CONTEXT.md)"

# ---------------------------------------------------------------------------
# 5. Changed source (incremental mode only)
# ---------------------------------------------------------------------------

if [ "$MODE" = "incremental" ]; then
  mkdir -p "$WORK_DIR/source"
  SOURCE_COPY_COUNT=0

  while IFS=$'\t' read -r status path _rest; do
    [ -z "$path" ] && continue
    [ -f "$path" ] || continue
    is_excluded_path "$path" && continue

    base="$(basename "$path")"
    match=0

    # Dotfiles with no extension (.gitattributes, .gitignore) — matched by
    # exact basename, since "${path##*.}" on a leading-dot-only filename
    # returns the whole filename minus the dot, not a real extension.
    for dotfile in "${SOURCE_DOTFILES[@]}"; do
      if [ "$base" = "$dotfile" ]; then
        match=1
        break
      fi
    done

    if [ "$match" -eq 0 ]; then
      ext="${path##*.}"
      for allowed in $SOURCE_EXTENSIONS; do
        if [ "$ext" = "$allowed" ] && [ "$ext" != "$path" ]; then
          match=1
          break
        fi
      done
    fi

    [ "$match" -eq 1 ] || continue

    rel_dest="source/$path"
    mkdir -p "$WORK_DIR/$(dirname "$rel_dest")"
    cp -p "$path" "$WORK_DIR/$rel_dest"
    SOURCE_COPY_COUNT=$((SOURCE_COPY_COUNT + 1))
  done < "$WORK_DIR/metadata/changed-files.txt"

  # Belt-and-suspenders (spec §4.5): this script's own source and
  # package.json must always be present in source/ if they changed in this
  # commit range, independent of the generic extension-match loop above —
  # explicitly re-checked here so a future edit to SOURCE_EXTENSIONS can
  # never silently drop them again.
  for must_include in "scripts/create-review-bundle.sh" "package.json"; do
    if grep -qF "	$must_include" "$WORK_DIR/metadata/changed-files.txt" 2>/dev/null \
      && [ -f "$must_include" ] \
      && [ ! -f "$WORK_DIR/source/$must_include" ]; then
      mkdir -p "$WORK_DIR/$(dirname "source/$must_include")"
      cp -p "$must_include" "$WORK_DIR/source/$must_include"
      SOURCE_COPY_COUNT=$((SOURCE_COPY_COUNT + 1))
    fi
  done

  echo "-- changed source files copied under source/ ($SOURCE_COPY_COUNT files)"
fi

# ---------------------------------------------------------------------------
# 6. Screenshots — label-matched only, else list what's available
# ---------------------------------------------------------------------------

mkdir -p "$WORK_DIR/screenshots"
SCREENSHOT_MATCHES=()
if [ -d "docs/screenshots" ]; then
  for suffix in desktop tablet mobile; do
    candidate="docs/screenshots/${LABEL}-${suffix}.png"
    if [ -f "$candidate" ]; then
      cp -p "$candidate" "$WORK_DIR/screenshots/"
      SCREENSHOT_MATCHES+=("$candidate")
    fi
  done
fi

# A stage that ships more than 3 screenshots (e.g. multiple design-spike
# variants x multiple viewports, as CC-02's Hero prototypes do) organizes
# them under docs/screenshots/<stage-prefix>/ instead of the flat
# <label>-{desktop,tablet,mobile}.png convention the 3-file case above
# covers. Fall back to copying that whole directory — by stage prefix
# (e.g. "cc02" from label "cc02-hero-spike") first, then by exact label —
# when the flat 3-file match finds nothing, rather than leaving a bundle
# that's supposed to carry 11 required screenshots with zero.
if [ "${#SCREENSHOT_MATCHES[@]}" -eq 0 ] && [ -d "docs/screenshots" ]; then
  SCREENSHOT_DIR=""
  if [ -n "$STAGE_PREFIX" ] && [ -d "docs/screenshots/${STAGE_PREFIX}" ]; then
    SCREENSHOT_DIR="docs/screenshots/${STAGE_PREFIX}"
  elif [ -d "docs/screenshots/${LABEL}" ]; then
    SCREENSHOT_DIR="docs/screenshots/${LABEL}"
  fi
  if [ -n "$SCREENSHOT_DIR" ]; then
    while IFS= read -r -d '' f; do
      cp -p "$f" "$WORK_DIR/screenshots/"
      SCREENSHOT_MATCHES+=("$f")
    done < <(find "$SCREENSHOT_DIR" -maxdepth 1 -type f -name '*.png' -print0)
  fi
fi

if [ "${#SCREENSHOT_MATCHES[@]}" -eq 0 ]; then
  echo "No screenshots named '${LABEL}-{desktop,tablet,mobile}.png' found, and no docs/screenshots/<stage-prefix>/ or docs/screenshots/<label>/ directory found." > "$WORK_DIR/screenshots/NO_EXACT_MATCH.txt"
  echo "Available screenshots in docs/screenshots/:" >> "$WORK_DIR/screenshots/NO_EXACT_MATCH.txt"
  if [ -d "docs/screenshots" ]; then
    ls docs/screenshots/ >> "$WORK_DIR/screenshots/NO_EXACT_MATCH.txt" 2>/dev/null || true
  fi
  echo "-- no exact-match screenshots for label '$LABEL'; listed available ones instead (not auto-included)"
else
  echo "-- ${#SCREENSHOT_MATCHES[@]} label-matched screenshot(s) included"
fi

# ---------------------------------------------------------------------------
# 7. Test reports
# ---------------------------------------------------------------------------

mkdir -p "$WORK_DIR/test-reports"
for report in docs/DATUM_QA.md docs/QA_CHECKLIST.md docs/IMPECCABLE_REVIEW_LOG.md docs/CONTRAST_AUDIT.md; do
  if [ -f "$report" ]; then
    cp -p "$report" "$WORK_DIR/test-reports/"
  fi
done
echo "-- test reports copied (whichever of DATUM_QA/QA_CHECKLIST/IMPECCABLE_REVIEW_LOG/CONTRAST_AUDIT exist)"

# ---------------------------------------------------------------------------
# 8. Bundle summary — a one-page human index of what's actually in here
# ---------------------------------------------------------------------------

{
  echo "Review bundle: $BUNDLE_NAME"
  echo "Mode: $MODE"
  # Never print the real absolute PROJECT_ROOT or the literal GIT_PATH_PREFIX
  # string here — both can contain private path segments (username, host
  # workspace layout, parent-repo directory names) that have no business
  # leaving this machine inside a bundle a reviewer downloads. "Project
  # root: ." plus a yes/no nestedness flag conveys everything a reviewer
  # needs (all paths in this bundle are already project-relative) without
  # leaking anything. See docs/engineering/specs/CC-02F-final-editorial-hero.md
  # §CC-02F-00 / spec §五 for the exact required wording.
  echo "Project root: ."
  if [ -n "$GIT_PATH_PREFIX" ]; then
    echo "Nested repository: yes"
  else
    echo "Nested repository: no"
  fi
  echo "Project prefix redacted: yes"
  echo "Head: $(cat "$WORK_DIR/metadata/head.txt" 2>/dev/null || echo '?')"
  echo "Base: $(cat "$WORK_DIR/metadata/base.txt" 2>/dev/null || echo '?')"
  echo
  if [ "$MODE" = "incremental" ]; then
    echo "Commits in range: $(wc -l < "$WORK_DIR/metadata/commits.txt" 2>/dev/null | tr -d ' ')"
    echo "Changed files (in scope): $(wc -l < "$WORK_DIR/metadata/changed-files.txt" 2>/dev/null | tr -d ' ')"
    echo "Excluded files (by policy): $(wc -l < "$WORK_DIR/metadata/excluded-files.txt" 2>/dev/null | tr -d ' ')"
    echo "Source files copied under source/: ${SOURCE_COPY_COUNT:-0}"
  fi
  echo "Screenshots included: ${#SCREENSHOT_MATCHES[@]}"
  echo "Handoff: ${SELECTED_HANDOFF:-none found}"
} > "$WORK_DIR/metadata/bundle-summary.txt"

echo "-- bundle summary written"

# ---------------------------------------------------------------------------
# Full-mode addition: git archive of tracked source
# ---------------------------------------------------------------------------

if [ "$MODE" = "full" ]; then
  mkdir -p "$WORK_DIR/source-archive"
  # --worktree-attributes: read .gitattributes from the working tree, not
  # from HEAD's committed tree. Without this, export-ignore rules added in
  # an uncommitted (or freshly-committed-but-not-yet-HEAD-at-archive-time)
  # .gitattributes are silently ignored, because `git archive` otherwise
  # only honors the attributes file as it existed in the commit being
  # archived.
  git archive --worktree-attributes HEAD | tar -x -C "$WORK_DIR/source-archive"
  # .gitattributes export-ignore handles node_modules/dist/.astro/.git/etc.
  # Fonts are export-ignored too, but ASSET_LICENSES.md and font *names* are
  # plain tracked text files, so they still come through — which is the point.
  echo "-- full mode: git archive of HEAD extracted to source-archive/"
fi

# ---------------------------------------------------------------------------
# 5. Secret scan — must run before any zip is written
# ---------------------------------------------------------------------------

echo "== Scanning staged bundle for secrets =="

FORBIDDEN_NAME_PATTERNS=(
  "*.env"
  ".env.*"
  "*.pem"
  "*.key"
  "id_rsa"
  "id_ed25519"
  "credentials*"
  "secrets*"
)

FORBIDDEN_CONTENT_PATTERNS=(
  "API_KEY"
  "SECRET_KEY"
  "PRIVATE_KEY"
  "ACCESS_TOKEN"
  "AUTH_TOKEN"
  "PASSWORD="
  "BEGIN RSA PRIVATE KEY"
  "BEGIN OPENSSH PRIVATE KEY"
)

# Narrow, explicit exemptions — real example/template files that happen to
# match a forbidden *filename* pattern but never carry real secret values.
# This is not a general bypass: content scanning below still runs on these
# files, so a real secret pasted into one would still block the bundle.
is_exempt_filename() {
  case "$(basename "$1")" in
    .env.example|.env.sample|.env.template) return 0 ;;
    *) return 1 ;;
  esac
}

# Content-scan exemption for exactly this script's own source. Its
# FORBIDDEN_CONTENT_PATTERNS array necessarily contains these pattern
# *names* as literal strings — that's what makes it a pattern list — so
# without this exemption, staging a copy of the script in source/ would
# always self-match. This is not a general secret-scan bypass: it matches
# only this one known, public, non-secret path, by exact relative path
# (not a name/extension category that could be reused to smuggle
# something else past the scan). A real secret anywhere ELSE in the
# staged bundle is still caught. `diff/changes.patch` is handled by a
# different mechanism (see the PATCH_EXCLUDE_ARGS pathspec above, in the
# "Patch" section) — this script's own path is excluded from the patch
# entirely, on the reasoning that its content is already fully visible,
# unredacted, in source/scripts/create-review-bundle.sh when the bundle
# includes it, so repeating it inside the patch adds no reviewer value
# and only recreates this same self-match problem in a second place.
is_content_exempt_path() {
  [ "$1" = "source/scripts/create-review-bundle.sh" ]
}

SECRET_HITS=()

while IFS= read -r -d '' f; do
  is_exempt_filename "$f" && continue
  base="$(basename "$f")"
  for pat in "${FORBIDDEN_NAME_PATTERNS[@]}"; do
    # shellcheck disable=SC2053
    if [[ "$base" == $pat ]]; then
      SECRET_HITS+=("filename match ($pat): ${f#$WORK_DIR/}")
    fi
  done
done < <(find "$WORK_DIR" -type f -print0)

CONTENT_GREP_PATTERN=$(IFS='|'; echo "${FORBIDDEN_CONTENT_PATTERNS[*]}")
while IFS= read -r -d '' f; do
  rel_for_exempt="${f#$WORK_DIR/}"
  is_content_exempt_path "$rel_for_exempt" && continue
  # Only grep text-ish files — binary false positives aren't useful and
  # grep -I already skips binaries, but be explicit for clarity.
  if grep -Il -E "$CONTENT_GREP_PATTERN" "$f" >/dev/null 2>&1; then
    SECRET_HITS+=("content match: ${f#$WORK_DIR/}")
  fi
done < <(find "$WORK_DIR" -type f -print0)

if [ "${#SECRET_HITS[@]}" -gt 0 ]; then
  echo "BLOCKED: possible secret material found in staged bundle. No zip was created." >&2
  echo "Affected paths (values not printed):" >&2
  for hit in "${SECRET_HITS[@]}"; do
    echo "  - $hit" >&2
  done
  echo >&2
  echo "Staging directory left at $WORK_DIR for inspection — delete it manually once resolved." >&2
  exit 3
fi

echo "-- secret scan clean"

# ---------------------------------------------------------------------------
# Size check
# ---------------------------------------------------------------------------

STAGED_BYTES=$(du -sb "$WORK_DIR" 2>/dev/null | cut -f1 || du -sk "$WORK_DIR" | awk '{print $1*1024}')

if [ "$STAGED_BYTES" -gt "$MAX_BUNDLE_BYTES" ]; then
  echo "WARNING: staged bundle is $(( STAGED_BYTES / 1024 / 1024 ))MB, over the 20MB soft cap." >&2
  echo "Largest files:" >&2
  find "$WORK_DIR" -type f -exec du -b {} \; 2>/dev/null \
    | sort -rn | head -n 20 \
    | awk -v root="$WORK_DIR/" '{ sub(root, "", $2); printf "  %10d bytes  %s\n", $1, $2 }' >&2
  echo >&2
  read -r -p "Continue and create the zip anyway? [y/N] " CONFIRM
  case "$CONFIRM" in
    y|Y|yes|YES) ;;
    *)
      echo "Aborted by user. Staging directory left at $WORK_DIR." >&2
      exit 4
      ;;
  esac
fi

# ---------------------------------------------------------------------------
# Zip
# ---------------------------------------------------------------------------

echo "== Creating zip =="

if command -v zip >/dev/null 2>&1; then
  (cd "$BUNDLE_ROOT" && zip -rq "${BUNDLE_NAME}.zip" "${BUNDLE_NAME}")
else
  echo "(system 'zip' not found — using Python zipfile fallback)"
  python3 - "$WORK_DIR" "$ZIP_PATH" "$BUNDLE_NAME" <<'PYEOF'
import os
import sys
import zipfile

work_dir, zip_path, bundle_name = sys.argv[1], sys.argv[2], sys.argv[3]

with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, _dirs, files in os.walk(work_dir):
        for name in files:
            full = os.path.join(root, name)
            rel = os.path.join(bundle_name, os.path.relpath(full, work_dir))
            zf.write(full, rel)
PYEOF
fi

if [ ! -f "$ZIP_PATH" ]; then
  echo "Error: zip creation appears to have failed — $ZIP_PATH not found." >&2
  exit 5
fi

ZIP_BYTES=$(stat -c '%s' "$ZIP_PATH" 2>/dev/null || stat -f '%z' "$ZIP_PATH" 2>/dev/null || echo "?")

echo
echo "== Done =="
echo "Bundle: $ZIP_PATH"
echo "Size:   ${ZIP_BYTES} bytes"

SUCCESS=1
