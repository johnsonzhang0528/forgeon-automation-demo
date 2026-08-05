# Sudden Recovery Protocol

Normal handoff and sudden recovery are distinct. A normal handoff transfers a
clean checkpoint commit and a structured handoff record. Sudden recovery is
used only after interruption, when the watcher has preserved an autosnapshot
and binary patch in the Git common runtime state. Never reconstruct work from
chat history.

The recovering agent works only in its own worktree. The source worktree is
read-only throughout recovery. Verify the snapshot base commit exists and the
patch SHA-256 matches the snapshot record. Preserve CJK and quoted paths by
using the recorded NUL-safe path data and Git's patch machinery; do not parse
paths from display-formatted output.

Create a new `recovery/<agent>/<timestamp>` branch from the snapshot base. Run
`git apply --3way --check` against the recorded patch before applying it. Only
after that check succeeds may the patch be applied. A conflict, missing base,
or hash mismatch fails closed: record a recovery report and stop without
reset, clean, restore, force, or any change to the source worktree.

After application, inspect the recovered paths and run the ticket's targeted
tests through the workflow test command. The recovery report must identify the
agents, snapshot, patch digest, recovery branch, apply-check result, and time,
without secrets or private absolute paths. Continue through the normal claim,
review, safe stage, safe commit, checkpoint, and handoff controls. ChatGPT's
stage gate still applies; recovery never makes a blocked stage claimable and
never authorizes integration, merge, remote, or push operations.
