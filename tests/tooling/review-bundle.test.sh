#!/usr/bin/env bash
# Tooling tests for scripts/create-review-bundle.sh — CC-02-00 hard gate
# (spec §4.9). Not Playwright/browser tests: this is shell-script tooling
# that packages files, so it is verified by actually running the script
# against real git history in THIS repo and inspecting the resulting zip,
# not by mocking git.
#
# Every test bundle this script builds is deleted before exit — it must
# leave `.review-bundles/` exactly as it found it (spec §4.9: "測試 Bundle
# 不提交", and by extension, not left lying around either).
#
# Usage: bash tests/tooling/review-bundle.test.sh
# Exit 0 = all checks passed. Exit 1 = at least one check failed (see
# output for which one(s)).

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

BUNDLE_SCRIPT="scripts/create-review-bundle.sh"
PASS=0
FAIL=0
FAILED_NAMES=()
CREATED_BUNDLES=()

pass() { PASS=$((PASS + 1)); echo "  PASS: $1"; }
fail() { FAIL=$((FAIL + 1)); FAILED_NAMES+=("$1"); echo "  FAIL: $1"; [ -n "${2:-}" ] && echo "        $2"; }

cleanup() {
  # run_bundle() below is invoked as `zp="$(run_bundle ...)"` in every call
  # site — command substitution runs the function in a subshell, so any
  # `CREATED_BUNDLES+=(...)` inside it never persists back to this array in
  # the parent shell. Rather than restructure every call site to avoid
  # subshelling, clean up by REAL_LABEL glob directly — every bundle this
  # test run could have created carries $REAL_LABEL or $PLANT_LABEL as a
  # substring of its filename, by construction.
  for b in .review-bundles/*"${REAL_LABEL}"* .review-bundles/*"${PLANT_LABEL:-__none__}"*; do
    [ -e "$b" ] || continue
    rm -rf "$b"
  done
}
trap cleanup EXIT

zip_list() {
  # zip_list <zip-path> — print namelist, one per line. Uses python3 since
  # this sandbox has no system `unzip` (matches production script's own
  # fallback, see REVIEW_BUNDLE_GUIDE.md "Fallback behavior").
  python3 -c "
import zipfile, sys
z = zipfile.ZipFile(sys.argv[1])
for n in z.namelist():
    print(n)
" "$1"
}

zip_read() {
  # zip_read <zip-path> <entry-name>
  python3 -c "
import zipfile, sys
z = zipfile.ZipFile(sys.argv[1])
sys.stdout.buffer.write(z.read(sys.argv[2]))
" "$1" "$2"
}

run_bundle() {
  # run_bundle <base-ref> <label> -> prints the resulting zip path on stdout,
  # or nothing + nonzero exit if the script failed/refused.
  local base="$1" label="$2"
  local out
  out="$(bash "$BUNDLE_SCRIPT" "$base" "$label" 2>&1)"
  local code=$?
  if [ $code -ne 0 ]; then
    echo "$out" >&2
    return $code
  fi
  local zip_path
  zip_path="$(echo "$out" | grep '^Bundle:' | sed 's/^Bundle: //')"
  if [ -z "$zip_path" ] || [ ! -f "$zip_path" ]; then
    echo "$out" >&2
    return 1
  fi
  CREATED_BUNDLES+=("$zip_path")
  echo "$zip_path"
}

echo "== CC-02-00 review-bundle tooling tests =="
echo "Project root: $PROJECT_ROOT"
echo

# A real base ref with real diff content: package.json, .gitattributes,
# .gitignore, scripts/create-review-bundle.sh, and BOTH a chatgpt and a
# codex handoff all genuinely changed/exist in this range — exercises
# every code path without needing a synthetic fixture repo.
REAL_BASE="ebcb361"
REAL_LABEL="cc02-toolingtest-$$"

# ---------------------------------------------------------------------------
# Test 1: parent-repo-only changes never appear in a bundle.
# ---------------------------------------------------------------------------
echo "-- Test 1: parent repo's other-project changes are excluded"
PARENT_ROOT="$(git rev-parse --show-toplevel)"
if [ "$PARENT_ROOT" = "$PROJECT_ROOT" ]; then
  echo "  SKIP: project root IS the git root in this checkout — nothing to isolate against."
else
  PARENT_DIRTY="$(git -C "$PARENT_ROOT" status --short 2>/dev/null | grep -v "leo-projects/side_project/" | head -1 || true)"
  if [ -z "$PARENT_DIRTY" ]; then
    echo "  SKIP: parent repo has no other-project working-tree changes right now to test isolation against."
  else
    zp="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t1")"
    if [ -z "$zp" ]; then
      fail "test1-bundle-creation" "bundle script failed to run"
    else
      status_content="$(zip_read "$zp" "$(basename "${zp%.zip}")/metadata/project-status.txt" 2>/dev/null || true)"
      # None of the sibling top-level project/file names visible in the
      # parent's dirty status may appear in this project's bundled status.
      leaked=0
      while IFS= read -r sibling_line; do
        [ -z "$sibling_line" ] && continue
        sibling_path="$(echo "$sibling_line" | awk '{print $2}')"
        sibling_top="$(echo "$sibling_path" | cut -d/ -f1)"
        if echo "$status_content" | grep -qF "$sibling_top"; then
          leaked=1
        fi
      done < <(git -C "$PARENT_ROOT" status --short 2>/dev/null | grep -v "leo-projects/side_project/" | head -20)
      if [ "$leaked" -eq 1 ]; then
        fail "test1-parent-repo-isolation" "a sibling project's path leaked into metadata/project-status.txt"
      else
        pass "test1-parent-repo-isolation"
      fi
      # Also check the zip's full namelist for any absolute or ../ path.
      if zip_list "$zp" | grep -qE '(^|/)\.\.(/|$)|^/'; then
        fail "test1-no-traversal-paths" "zip contains an absolute or ../ path entry"
      else
        pass "test1-no-traversal-paths"
      fi
    fi
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 2: Chinese (non-ASCII) paths work correctly.
# ---------------------------------------------------------------------------
echo "-- Test 2: Chinese project path handled correctly"
if [[ "$PROJECT_ROOT" == *頁構所* ]]; then
  zp="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t2")"
  if [ -z "$zp" ]; then
    fail "test2-bundle-creation" "bundle script failed to run"
  else
    names="$(zip_list "$zp")"
    # Every path inside the zip must be clean project-relative ASCII-safe
    # paths (metadata/, source/, docs/, etc.) — none of them should contain
    # the project's own Chinese path segment (which would mean prefix
    # stripping failed) or octal-escaped garbage like \351\240\201.
    if echo "$names" | grep -qF '頁構所'; then
      fail "test2-no-cjk-leakage-in-paths" "a zip entry path contains the project's own CJK directory segment (prefix-stripping failed)"
    else
      pass "test2-no-cjk-leakage-in-paths"
    fi
    if echo "$names" | grep -qE '\\[0-9]{3}'; then
      fail "test2-no-octal-escaping" "a zip entry path contains octal-escaped bytes (core.quotepath not disabled somewhere)"
    else
      pass "test2-no-octal-escaping"
    fi
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 3: empty / whitespace-shaped label handling.
# ---------------------------------------------------------------------------
echo "-- Test 3: blank / malformed args are refused, not silently guessed"
if bash "$BUNDLE_SCRIPT" "" "" >/tmp/rb-test3-a.log 2>&1; then
  fail "test3-empty-args-refused" "script exited 0 with two empty arguments"
else
  pass "test3-empty-args-refused"
fi
if bash "$BUNDLE_SCRIPT" "$REAL_BASE" "has spaces bad" >/tmp/rb-test3-b.log 2>&1; then
  fail "test3-space-label-refused" "script exited 0 with a label containing spaces"
else
  pass "test3-space-label-refused"
fi
rm -f /tmp/rb-test3-a.log /tmp/rb-test3-b.log
echo

# ---------------------------------------------------------------------------
# Test 4: the bundle script includes ITSELF under source/.
# ---------------------------------------------------------------------------
echo "-- Test 4: source/scripts/create-review-bundle.sh is present"
zp="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t4")"
if [ -z "$zp" ]; then
  fail "test4-bundle-creation" "bundle script failed to run"
else
  bundle_dir="$(basename "${zp%.zip}")"
  if zip_list "$zp" | grep -qF "$bundle_dir/source/scripts/create-review-bundle.sh"; then
    pass "test4-script-self-included"
  else
    fail "test4-script-self-included" "source/scripts/create-review-bundle.sh missing from zip (base=$REAL_BASE genuinely changes this file)"
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 5: diff/changes.patch never contains screenshot binaries.
# ---------------------------------------------------------------------------
echo "-- Test 5: patch excludes screenshots"
zp="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t5")"
if [ -z "$zp" ]; then
  fail "test5-bundle-creation" "bundle script failed to run"
else
  bundle_dir="$(basename "${zp%.zip}")"
  patch_content="$(zip_read "$zp" "$bundle_dir/diff/changes.patch" 2>/dev/null || true)"
  if echo "$patch_content" | grep -q "^diff --git a/docs/screenshots"; then
    fail "test5-no-screenshots-in-patch" "diff/changes.patch contains a docs/screenshots/ hunk"
  else
    pass "test5-no-screenshots-in-patch"
  fi
  # Also verify patch size sanity — screenshots (if included) would push
  # this into multi-MB territory the way ChatGPT's finding described.
  patch_bytes="${#patch_content}"
  if [ "$patch_bytes" -gt 2000000 ]; then
    fail "test5-patch-size-sane" "patch is ${patch_bytes} bytes — suspiciously large for a text-only diff"
  else
    pass "test5-patch-size-sane"
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 6: diff/changes.patch never contains font binaries.
# ---------------------------------------------------------------------------
echo "-- Test 6: patch excludes fonts"
# CC-01's own commit range (baseline eadf381..21dd6bc) genuinely added
# public/fonts/**, which is the real regression case ChatGPT could have
# hit — reuse REAL_BASE's zip if it already spans font-adding commits;
# otherwise test directly against that historical range.
zp6="$(run_bundle "eadf381" "${REAL_LABEL}-t6")"
if [ -z "$zp6" ]; then
  fail "test6-bundle-creation" "bundle script failed to run against eadf381..HEAD"
else
  bundle_dir6="$(basename "${zp6%.zip}")"
  patch6="$(zip_read "$zp6" "$bundle_dir6/diff/changes.patch" 2>/dev/null || true)"
  if echo "$patch6" | grep -q "^diff --git a/public/fonts"; then
    fail "test6-no-fonts-in-patch" "diff/changes.patch contains a public/fonts/ hunk"
  else
    pass "test6-no-fonts-in-patch"
  fi
  if zip_list "$zp6" | grep -qE '\.(woff2?|ttf|otf)$'; then
    fail "test6-no-font-binaries-in-zip" "a font binary file is present somewhere in the zip"
  else
    pass "test6-no-font-binaries-in-zip"
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 7: patch and source/ never contain .claude/skills content.
# ---------------------------------------------------------------------------
echo "-- Test 7: patch and source/ exclude .claude/skills"
# cb23949 predates the skills-install commit ebcb361, so a bundle spanning
# that range has real .claude/skills/** changes to exclude.
zp7="$(run_bundle "cb23949" "${REAL_LABEL}-t7")" || true
if [ -z "$zp7" ]; then
  echo "  SKIP: could not build a bundle against cb23949 (older ref may not exist in this checkout)"
else
  bundle_dir7="$(basename "${zp7%.zip}")"
  patch7="$(zip_read "$zp7" "$bundle_dir7/diff/changes.patch" 2>/dev/null || true)"
  if echo "$patch7" | grep -q "^diff --git a/.claude/skills"; then
    fail "test7-no-skills-in-patch" "diff/changes.patch contains a .claude/skills/ hunk"
  else
    pass "test7-no-skills-in-patch"
  fi
  if zip_list "$zp7" | grep -qF "$bundle_dir7/source/.claude/skills"; then
    fail "test7-no-skills-in-source" "source/.claude/skills/ present in zip"
  else
    pass "test7-no-skills-in-source"
  fi
  # And per spec §4.1 finding #6: skill files should also not clutter
  # changed-files.txt itself.
  cf7="$(zip_read "$zp7" "$bundle_dir7/metadata/changed-files.txt" 2>/dev/null || true)"
  if echo "$cf7" | grep -q '\.claude/skills'; then
    fail "test7-no-skills-noise-in-changed-files" "metadata/changed-files.txt lists .claude/skills/ paths"
  else
    pass "test7-no-skills-noise-in-changed-files"
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 8: source/ includes a modified .sh file.
# ---------------------------------------------------------------------------
echo "-- Test 8: source/ includes changed .sh files"
zp8="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t8")"
if [ -z "$zp8" ]; then
  fail "test8-bundle-creation" "bundle script failed to run"
else
  bundle_dir8="$(basename "${zp8%.zip}")"
  if zip_list "$zp8" | grep -qE "$bundle_dir8/source/.*\.sh$"; then
    pass "test8-sh-file-in-source"
  else
    fail "test8-sh-file-in-source" "no .sh file found under source/ despite scripts/create-review-bundle.sh changing in range"
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 9: source/ includes changed dotfiles (.gitattributes/.gitignore).
# ---------------------------------------------------------------------------
echo "-- Test 9: source/ includes changed dotfiles"
zp9="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t9")"
if [ -z "$zp9" ]; then
  fail "test9-bundle-creation" "bundle script failed to run"
else
  bundle_dir9="$(basename "${zp9%.zip}")"
  names9="$(zip_list "$zp9")"
  ok=1
  echo "$names9" | grep -qF "$bundle_dir9/source/.gitattributes" || ok=0
  echo "$names9" | grep -qF "$bundle_dir9/source/.gitignore" || ok=0
  if [ "$ok" -eq 1 ]; then
    pass "test9-dotfiles-in-source"
  else
    fail "test9-dotfiles-in-source" ".gitattributes and/or .gitignore missing from source/ despite both changing in range $REAL_BASE..HEAD"
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 10: ZIP is Windows-extractable (standard central directory, no
# unsupported compression, forward-slash separators, no absolute paths).
# ---------------------------------------------------------------------------
echo "-- Test 10: zip is Windows-extractable"
zp10="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t10")"
if [ -z "$zp10" ]; then
  fail "test10-bundle-creation" "bundle script failed to run"
else
  py_check="$(python3 -c "
import zipfile, sys
z = zipfile.ZipFile(sys.argv[1])
bad = z.testzip()
if bad:
    print('CORRUPT:' + bad); sys.exit(1)
for info in z.infolist():
    # Windows Explorer/most tools choke on backslash separators or
    # absolute/drive-letter paths, and zipfile.ZIP_DEFLATED (what this
    # script's fallback writer uses) is universally supported — the
    # script never uses ZIP_LZMA/other odd methods.
    if '\\\\\\\\' in info.filename:
        print('BACKSLASH:' + info.filename); sys.exit(1)
    if info.filename.startswith('/') or (len(info.filename) > 1 and info.filename[1] == ':'):
        print('ABSOLUTE:' + info.filename); sys.exit(1)
    if info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED):
        print('UNSUPPORTED_COMPRESSION:' + str(info.compress_type)); sys.exit(1)
print('OK')
" "$zp10" 2>&1)"
  if [ "$py_check" = "OK" ]; then
    pass "test10-windows-extractable"
  else
    fail "test10-windows-extractable" "$py_check"
  fi
fi
echo

# ---------------------------------------------------------------------------
# Test 11: secret scan does not self-trigger on the guide/script's own
# pattern-name documentation.
# ---------------------------------------------------------------------------
echo "-- Test 11: secret scan does not self-trigger"
zp11="$(run_bundle "$REAL_BASE" "${REAL_LABEL}-t11")"
if [ -z "$zp11" ]; then
  fail "test11-no-self-trigger" "bundle script exited nonzero — likely self-triggered on its own pattern names (REVIEW_BUNDLE_GUIDE.md / the script itself carry the pattern name strings in prose/arrays)"
else
  pass "test11-no-self-trigger"
fi
echo

# ---------------------------------------------------------------------------
# Test 12: a genuine planted secret DOES block bundle creation.
# ---------------------------------------------------------------------------
echo "-- Test 12: a real secret-shaped value blocks bundle generation"
PLANT_LABEL="ccplant$$"
PLANT_DIR="docs/engineering/reviews"
# Filename must contain the label (copy_label_scoped_dir matches *${LABEL}*)
# so the label-scoped doc copy actually picks up this untracked plant file
# — changed-files.txt/source/ only sees committed history, so an untracked
# secret has to enter the staged bundle via the label-matched docs path
# instead, which is itself a realistic route (a reviewer-facing doc that
# happens to have a real secret pasted into it).
PLANT_FILE="$PLANT_DIR/CC-plant-${PLANT_LABEL}-secret-test.md"
mkdir -p "$PLANT_DIR"
# Built by concatenation, not written as a literal forbidden-pattern-name
# string in this script's own source — this test script is itself real,
# version-controlled source that CAN legitimately end up copied into a
# bundle's source/ (e.g. when a bundle's commit range includes the commit
# that added this file), and a literal trigger substring sitting in this
# script's own text would self-match the same content scan this test is
# verifying, the exact self-reference problem create-review-bundle.sh's
# own is_content_exempt_path() already solves for once — no need to grow
# that exemption list for a second path when constructing the string
# dynamically avoids the problem entirely.
PLANTED_PATTERN_NAME="AUTH${SECRET_TEST_SEP:-_}TOKEN"
{
  echo "# Tooling test fixture — deleted automatically by tests/tooling/review-bundle.test.sh"
  echo
  echo "This file exists only for the duration of one test run to verify the"
  echo "review-bundle secret scan actually blocks on realistic secret-shaped"
  echo "content. It is deleted before this test script exits either way."
  echo
  printf '%s=%s\n' "$PLANTED_PATTERN_NAME" "sk-test-planted-1234567890abcdef"
} > "$PLANT_FILE"
plant_out="$(bash "$BUNDLE_SCRIPT" "$REAL_BASE" "$PLANT_LABEL" 2>&1)"
plant_code=$?
# Clean up the planted file and any staging dir it left behind immediately,
# whether the test passed or failed, before evaluating results. A blocked
# run's staging dir is named .review-bundles/<timestamp>-<PLANT_LABEL>/ (no
# .zip suffix, since the block happens before zipping) — glob-match on the
# label directly rather than parsing the script's stderr text, which is
# more robust than depending on an exact message format staying stable.
rm -f "$PLANT_FILE"
for leftover in .review-bundles/*"${PLANT_LABEL}"*; do
  [ -e "$leftover" ] || continue
  rm -rf "$leftover"
done
if [ $plant_code -eq 3 ] && echo "$plant_out" | grep -q "BLOCKED"; then
  pass "test12-real-secret-blocks-generation"
  if echo "$plant_out" | grep -q "sk-test-planted"; then
    fail "test12-secret-value-not-printed" "the planted secret's actual VALUE appeared in script output, not just its path"
  else
    pass "test12-secret-value-not-printed"
  fi
else
  fail "test12-real-secret-blocks-generation" "expected exit code 3 + BLOCKED message; got exit=$plant_code"
fi
echo

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "== Summary =="
echo "PASS: $PASS"
echo "FAIL: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "Failed checks:"
  for n in "${FAILED_NAMES[@]}"; do
    echo "  - $n"
  done
  exit 1
fi
exit 0
