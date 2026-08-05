# 10 — ChatGPT review handoff + bundle

**What to build:** `docs/engineering/handoffs/CC-02-chatgpt-review-
handoff.md` covering the full round (tooling fixes, overflow fix, locale
API, Action Token, font audit, all three variants, Impeccable review,
internal scores, screenshots, tests, known limits, ChatGPT's priority
review items), then a verified review bundle via the fixed
`pnpm review:bundle` tool.

**File scope:**
`docs/engineering/handoffs/CC-02-chatgpt-review-handoff.md` (new). No
Codex handoff created this round.

**Blocked by:** All prior CC-02 tickets (this is the round's closing
ticket).

**Status:** done

- [x] Handoff covers CC02 Base commit, all fixes/features with real
      numbers (contrast ratios, byte counts, test pass counts), all three
      variants, Impeccable summary, internal scores, screenshot manifest,
      test summary, known limitations, and ChatGPT's suggested review
      priority order.
- [x] No `docs/engineering/handoffs/CC-02-codex-handoff.md` or equivalent
      created.
- [x] `pnpm review:bundle <CC02_BASE> cc02-hero-spike` produces a bundle
      whose `metadata/project-status.txt` contains only this project,
      whose `source/scripts/create-review-bundle.sh` is present, whose
      patch paths are all `src/...`/`docs/...`, and whose size is not
      inflated by screenshot binaries in the patch.
- [x] `unzip -l`-equivalent (Python `zipfile` listing, since this sandbox
      has no system `unzip`) run against the final bundle and its contents
      checked against the required-inclusion / must-not-include lists in
      spec §二十六.
