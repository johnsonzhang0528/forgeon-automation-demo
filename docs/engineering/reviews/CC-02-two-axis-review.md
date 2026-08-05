# CC-02 Two-Axis Code Review

Fixed point (CC02_BASE): `1513643d84bdd1aff39f896490fbea5d325e731a`. Review
endpoint (HEAD): `f632343` (`docs(design): record cc02 hero comparison`).
Diff: `git diff 1513643..HEAD -- .` — 43 files changed, 3994 insertions(+),
41 deletions(-). Commits, in order: `9f35747`, `277f49c`, `c048881`,
`116f14d`, `5e28797`, `e5ca945`, `dfa3f42`, `0363cdf`, `20bf6aa`, `f632343`.
Spec source: `docs/engineering/specs/CC-02-header-hero-design-spike.md` and
the original CC-02 task book. Standards sources: `CLAUDE.md`, `CONTEXT.md`,
`DESIGN_SYSTEM.md`, `src/styles/tokens.css`, `docs/CONTRAST_AUDIT.md`,
`docs/DATUM_DECISION_LOG.md`. Run in-thread (this session's own review, not
delegated to sub-agents — findings kept strictly separate per axis below).

---

## Standards

**Git Hygiene: good.** 10 atomic commits, each conventionally-typed and
scoped to one concern (tooling fix, overflow fix, brand-primitive
locale API, token addition, font audit, a self-correcting tooling fix,
spec+tickets, prototype build, asset plan, Impeccable review). No commit
mixes unrelated concerns. One self-correction is visible in the log
(`e5ca945` fixes a self-trigger bug introduced by `9f35747`'s own test
suite) — left as a separate commit rather than squashed, which is the
correct call per this project's own git-hygiene convention (CC-01's
post-hoc review also kept its own self-corrections as separate commits).

**Prototype isolation: strong, with one deliberate, documented deviation.**
All four `internal-preview/cc02-hero/*.astro` routes carry
`<meta name="robots" content="noindex, nofollow">`, are absent from
`sitemap.xml.ts`'s hand-built `staticSegments` array (verified: no
filesystem walk exists in that file, so nothing needed excluding), are not
referenced in `src/config/nav.ts`, and pull in zero `AnalyticsBridge`/GTM
code. `_shared/PrototypeHeader.astro` deliberately does NOT import
`src/config/nav.ts` or link into real `/zh-tw//en/` routes (every link is
`href="#"` + `data-proto-noop`) — a real, checked isolation boundary, not
just a comment claiming one.

**CSS Scope: clean.** Every prototype file uses Astro's native scoped
`<style>` blocks. One `:global(.btn)` use in `CTABanner.astro`'s CTA-
button-wrap fix — pre-existing pattern from before this round (see the
file's own comment citing `docs/REMEDIATION_PLAN.md` P0.1), not newly
introduced, and the new addition in this round
(`.cta-banner__actions :global(.btn)`) follows the identical, already-
established, narrowly-scoped pattern rather than inventing a new one.

**Runtime JS: within spec's constraint ("不增加大型框架" /
"不增加 Runtime Dependency").** `package.json`'s dependency list is
unchanged by this round (`git diff -- package.json` between CC02_BASE and
HEAD is empty) — confirmed no new npm package was added anywhere in Part
1 or Part 2. All prototype interactivity (mobile drawer, locale toggle) is
vanilla DOM API script, matching the real site's own established pattern.

**i18n: correctly scoped, not over-engineered.** CC-02-02's brand-primitive
API additions (`DatumOrigin.ariaLabel`, `VisionLockFrame.statusLabels`,
`AssemblySpine.stateLabels`) are each optional with a default that
preserves every existing call site's behavior unchanged — verified: the
one production call site (`internal-preview/design-system.astro`)
required zero edits and both `pnpm check` and the full e2e suite passed
without modification to that file. This matches the CC-01 post-hoc
review's own explicit guidance ("等 CC-02 把 DatumOrigin 放進 Header 時再
依真實需求設計 API，而非預先臆測介面") — the API shape that landed is
exactly the minimal shape the three prototypes actually needed, not a
speculative general-purpose i18n layer.

**Finding S-1 (soft, informational) — locale toggle uses a client-side
dual-render pattern, not the site's own locale-as-URL-path convention.**
The real site (`src/pages/{zh-tw,en}/`) uses separate directory trees per
locale; the CC-02 prototypes instead render both locales into one static
HTML file and toggle visibility client-side, because these are `output:
'static'` pages and the spec's exact required filenames
(`variant-a.astro`, not `variant-a/[locale].astro`) don't leave room for a
`getStaticPaths` locale-as-path split without renaming the files. This is
a deliberate, documented deviation (see `PrototypeHeader.astro`'s own
file-header comment) scoped entirely to prototype-only code — it does not
touch or set a precedent for the real site's locale routing. Not a defect;
recorded so a future reviewer doesn't mistake it for an oversight.

**Finding S-2 (hard, low severity, already caught and fixed in-round) —
duplicate `<h1>` risk from the dual-locale-render pattern.** Because both
locale blocks render into the same static file, an early draft of all
three variants emitted two literal `<h1>` tags per page (one `[hidden]`).
This project's own `check:h1` script greps raw HTML text, not the
post-render accessibility tree, so it correctly caught this as a real
violation (53/53 passing only after the fix). Fixed by making the
non-default-visible locale block's headline a `<p>` with the identical
CSS class instead of a second `<h1>` — documented inline in all three
variant files. Recorded here because it demonstrates the H1-discipline
check is doing real work, not being rubber-stamped.

**Component boundaries: respected.** All three variants consume
`DatumOrigin`/`VisionLockFrame`/`AssemblySpine`/`CutawayWindow` through
their public `Astro.props` interfaces only — no reach-into-child-scope
CSS hacks, no prop drilling past what each component's own `Props`
interface declares. `CTABanner.astro`'s fix stays entirely within its own
file; no change bled into `Button.astro` (a global `white-space: nowrap`
change there would have altered every button's wrap behavior sitewide,
which the fix's own comment explicitly reasons is why it wasn't done that
way).

**Bundle Tooling privacy: verified, not assumed.** `tests/tooling/
review-bundle.test.sh` (20/20 assertions passing at HEAD) independently
re-verifies every one of ChatGPT's six original findings is actually
fixed — not just claimed fixed in a commit message. Re-ran at the end of
this review (after all 10 commits landed) specifically to catch the
self-reference class of bug the tooling test itself had (see `e5ca945`) —
came back clean.

**Parent-repo path leakage: none found.** `docs/engineering/
REVIEW_BUNDLE_GUIDE.md`'s updated structure section and every new
metadata filename introduced by `9f35747` (`project-status.txt`,
`excluded-files.txt`, `bundle-summary.txt`) were spot-checked against a
real bundle build in this session — no parent-repo file path, no
sibling-project name, no absolute filesystem path outside this project's
own tree appeared in any staged bundle content.

---

## Spec

**Are the three variants substantively different? Yes, verified via
layout measurement, not just visual impression.** Variant A's desktop
grid is a real 12-column split (`grid-template-columns: repeat(12,
minmax(0,1fr))`, copy at `1/7`, visual at `7/14` — crossing the container
edge as required). Variant B's Header is `position: absolute` overlaying
a `min-height: 640-820px` full-bleed stage, a structurally different
containing-block relationship than A/C's in-flow sticky Header. Variant
C's headline sits in its own dedicated grid wrapper spanning `1/9` of 12
columns, with two independently-positioned `CutawayWindow` instances at
`5/9` and `9/13` — the one variant with no left/right split at all. These
are not the same layout with different colors; the grid math differs
structurally in each case.

**Same copy across all three? Yes, byte-verified.** All three variants
import from the single `_shared/copy.ts` module — no variant defines its
own copy strings for headline/body/CTA. `_shared/copy.ts`'s own comment
states the verbatim-copy contract explicitly, and diffing the rendered
`heroCopy['zh-tw'].headline`/`.body`/`.ctaPrimary`/`.ctaSecondary` (and
the `en` equivalents) across all three variants' rendered HTML confirms
character-for-character identity.

**All three sizes done? Yes.** 9/9 manual overflow-sweep checks (3
variants × 360/390/768) plus the required 1440×900/768×1024/390×844
screenshot set (11/11 files present in `docs/screenshots/cc02/`, real
non-trivial byte sizes, none blank).

**Impeccable done? Yes.** `docs/engineering/reviews/
CC-02-impeccable-hero-review.md` covers every checklist item from spec
§十八 with cited evidence (screenshot paths, measured pixel values, axe
results) rather than unsupported adjectives, plus the required internal
scoring with per-line evidence and an explicit "not a final decision"
disclaimer.

**360px handled? Yes, both the production bug and the prototypes.**
CC-02-01 fixed the real, previously-known `/en/` 360px overflow (17px →
0px, root-caused to `CTABanner.astro`'s double-gutter bug, NOT the Hero)
without touching Hero content/structure on either locale homepage —
confirmed via `git diff --stat` showing zero touches to
`src/pages/{zh-tw,en}/index.astro`. All three CC-02 prototypes
independently pass 0px overflow at 360px too (9/9 sweep + the dedicated
`tests/e2e/cc02-hero-prototype.spec.ts` checks).

**Locale API done? Yes**, scoped to exactly the three components the
prototypes actually use (see Standards section above) — not all six Brand
Primitives, matching the CC-01 post-hoc review's own explicit guidance
against speculative API design.

**Action Token done? Yes**, and actually rendered (not just defined) —
every variant's primary CTA button uses `--color-action-primary`/`-hover`,
verified via `grep -c` returning non-zero on all three variant source
files, and visually distinct from `--color-copper-600` in every
screenshot.

**Font Payload measured? Yes**, with real captured network data (not
estimated from file listings) — `docs/engineering/reviews/
CC-02-font-payload-audit.md` records exact byte counts per request on both
homepages, investigates the one weight spec named explicitly (Noto Sans TC
500), and makes a reasoned "do not remove" call backed by a real
before/after screenshot comparison rather than removing it to chase a
smaller number.

**Higgsfield used? No** — verified independently in this review via a
fresh `grep -ril "higgsfield" src/pages/internal-preview/cc02-hero/`: one
hit, a compliance-note comment in `variant-b.astro` stating Higgsfield is
banned this round, not a call or dependency. `docs/DATUM_ASSET_PLAN_CC02.md`
explicitly states no generation was submitted.

**Production homepage mistakenly touched? No**, with one narrow, spec-
permitted exception. `git diff --stat` confirms `src/pages/{zh-tw,en}/
index.astro` do not appear anywhere in this round's diff — the only Hero-
adjacent production file touched is `CTABanner.astro` (not itself part of
either homepage's Hero section; it's the page-bottom CTA banner), for
exactly the overflow fix spec §5 explicitly authorized.

**Entered CC-03? No.** No file, commit message, ticket, or doc in this
round references CC-03-scoped work. The round's last commit
(`f632343`) is the Impeccable comparison doc, which is explicitly the
round's closing deliverable per spec §二十六-二十七's own ordering.

## Overall verdict

No hard, unresolved findings on either axis. The one hard finding (S-2,
duplicate H1 risk from the dual-locale-render pattern) was caught by this
project's own `check:h1` gate during construction and fixed before this
review — not discovered by this review after the fact. The one soft
finding (S-1, locale-toggle mechanism deviates from the site's own
locale-as-path convention) is a deliberate, documented, prototype-scoped
choice with no bleed into production routing.
