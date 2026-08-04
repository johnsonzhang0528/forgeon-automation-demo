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

# Text-source extensions eligible for inclusion under diff/source/
SOURCE_EXTENSIONS="astro ts js mjs css scss md json yaml yml html"

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

git "${GIT_QUOTEPATH_OPTS[@]}" status --short > "$WORK_DIR/metadata/status.txt"

if [ "$MODE" = "incremental" ]; then
  git log "$BASE_REF..HEAD" --oneline > "$WORK_DIR/metadata/commits.txt"
  # `git diff --name-status` reports paths relative to the repo root, which
  # differs from PROJECT_ROOT whenever this project is nested inside a
  # larger repo. Strip GIT_PATH_PREFIX here, once, so every downstream
  # consumer of changed-files.txt gets project-relative paths for free —
  # and so a file that changed outside this project (shouldn't happen given
  # the pathspec, but be defensive) is dropped rather than mis-copied.
  : > "$WORK_DIR/metadata/changed-files.txt"
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
  PATCH_EXCLUDE_ARGS=()
  for glob in "${EXCLUDE_GLOBS[@]}"; do
    PATCH_EXCLUDE_ARGS+=(":(exclude)$glob")
  done

  git "${GIT_QUOTEPATH_OPTS[@]}" diff --binary "$BASE_REF..HEAD" -- . "${PATCH_EXCLUDE_ARGS[@]}" \
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
LATEST_HANDOFF=""
if [ -d "docs/engineering/handoffs" ]; then
  LATEST_HANDOFF=$(ls -t docs/engineering/handoffs/*.md 2>/dev/null | head -n 1 || true)
fi

if [ -n "$LATEST_HANDOFF" ]; then
  cp -p "$LATEST_HANDOFF" "$WORK_DIR/handoff/"
  echo "-- handoff included: $LATEST_HANDOFF"
else
  echo "WARNING: no docs/engineering/handoffs/*.md found — bundle will not include a handoff doc." >&2
  echo "(no handoff document found at bundle time)" > "$WORK_DIR/handoff/MISSING.txt"
fi

# ---------------------------------------------------------------------------
# 4. Spec / Ticket / Review / ADR / CONTEXT — label-scoped, not the whole history
# ---------------------------------------------------------------------------

mkdir -p "$WORK_DIR/docs"

copy_label_scoped_dir() {
  # copy_label_scoped_dir <src-dir> <dest-subdir-name>
  local src="$1"
  local dest_name="$2"
  [ -d "$src" ] || return 0

  local matches=()
  while IFS= read -r -d '' f; do
    matches+=("$f")
  done < <(find "$src" -type f -iname "*${LABEL}*" -print0 2>/dev/null)

  if [ "${#matches[@]}" -gt 0 ]; then
    for f in "${matches[@]}"; do
      local rel="${f#$PROJECT_ROOT/}"
      copy_preserving_dirs "$rel" "$WORK_DIR"
    done
  fi
}

# Label-scoped copy for specs/tickets/reviews (only files whose path
# contains the label — e.g. label "cc01-posthoc" matches files under a
# "CC-01-posthoc" ticket directory case-insensitively).
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

  while IFS=$'\t' read -r status path _rest; do
    [ -z "$path" ] && continue
    [ -f "$path" ] || continue
    is_excluded_path "$path" && continue

    ext="${path##*.}"
    match=0
    for allowed in $SOURCE_EXTENSIONS; do
      if [ "$ext" = "$allowed" ]; then
        match=1
        break
      fi
    done
    [ "$match" -eq 1 ] || continue

    rel_dest="source/$path"
    mkdir -p "$WORK_DIR/$(dirname "$rel_dest")"
    cp -p "$path" "$WORK_DIR/$rel_dest"
  done < "$WORK_DIR/metadata/changed-files.txt"

  echo "-- changed source files copied under source/"
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

if [ "${#SCREENSHOT_MATCHES[@]}" -eq 0 ]; then
  echo "No screenshots named '${LABEL}-{desktop,tablet,mobile}.png' found." > "$WORK_DIR/screenshots/NO_EXACT_MATCH.txt"
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
