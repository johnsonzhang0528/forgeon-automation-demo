# Legacy Commit Map

- Legacy repository: `<legacy-workspace-repository>`
- Legacy project prefix: `leo-projects/side_project/頁構所/demo-1/`
- Legacy HEAD: `09eee9a09bb35e9fabffde20da5c7a2aa7585aef`
- Extracted HEAD: `b588fe55835b3eaffab60489a9d925ab5540238e`
- Extraction: `git subtree split`; hashes may remain identical when a legacy
  commit already represented a project-root-only history node.

| Milestone | Legacy hash | Standalone hash | Commit message | Mapping |
|---|---|---|---|---|
| CC-00 | `eadf38199dabfdc61c4fffe95d4acd2a29055982` | `2c39417f94ff65e00edc5e7c64aa807c9581e98b` | docs(demo-1): CC-00 baseline — naming audit, clean install verification | Message/tree-derived; a same-hash historical node also exists |
| CC-01 | `01526092ed7dfe0752a920fd10684633e45edb2a` | `9107824b1a0194540ad3dc82ca700bf5a52ad0f3` | feat(brand): add precision datum visual primitives | One-to-one subtree mapping |
| CC-02 | `3df68ddb3e82a00b317486f4c15336ae3983776a` | `020ffb4144022e1dd8f8d8afce35d6c6c461db5d` | docs(review): prepare cc02 chatgpt handoff | One-to-one subtree mapping |
| CC-02F | `0f86195aa8ae4422f100029af954bb107a5702fc` | `523e48e37868a0f9fca135c5f09985326b4a11ca` | docs(review): prepare cc02 final chatgpt handoff | One-to-one subtree mapping |
| Dual Agent v1 | `cfad4519c99a26aa95967f5a5dcaafbe8a371991` | `3cce8207ed5c47527bf04217ff025c42035afc1b` | docs(agent): define claude codex failover protocol | One-to-one subtree mapping |
| Paused baseline | `09eee9a09bb35e9fabffde20da5c7a2aa7585aef` | `b588fe55835b3eaffab60489a9d925ab5540238e` | chore(agent): reset CURRENT_TASK to paused_ready baseline | One-to-one subtree mapping |

Historical review bundles intentionally retain legacy hashes.
