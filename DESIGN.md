# Design

<!-- impeccable:design-schema 1 -->

# DESIGN.md v2 — Production Design Contract

**Status: Approved by Human / ChatGPT Design Contract Gate (Phase 4), with
required fixes applied.** This is the sole canonical design document. The
prior v1 ("Precision Datum System") has been moved in full to
`docs/design-history/DESIGN-v1-precision-datum.md` — read that file only for
historical context, never as active guidance. Keeping current and superseded
instructions in one file risked a future agent reading both as live; they
are now physically separated.

This document is the production contract for FORGEON's next visual
iteration. It governs the Phase 5 Mockup sequence (§18) and — once mockups
pass their own gates — Taste Redesign / Impeccable / implementation work. It
is not an inspiration note; every rule here is something a reviewer can
check a mockup or a build against.

---

## 0. CONTEXT_CONFLICT — RESOLVED

Phase 4 flagged a real conflict between the previously-shipped visual system
and the Direction B research (Phase 3 / 3B). The Human / ChatGPT Design
Contract Gate has now ruled on it directly.

**OLD:** Precision Datum System = Global Brand Grammar. Copper-accent
identity, coordinate-system/engineering-drawing visual metaphor, six Brand
Primitive components (`DatumOrigin`, `ToleranceBand`, `VisionLockFrame`,
`AssemblySpine`, `ProcessStamp`, `CutawayWindow` in `src/components/brand/`)
applied sitewide as chrome/decoration.

**NEW (ruling):** **Precision Instrument Editorial = Global Brand Grammar.**
The Precision Datum System, as a *sitewide* visual grammar, is
**SUPERSEDED**. This includes: sitewide datum grammar, copper identity,
blueprint UI, engineering-drawing decoration, and coordinate decoration as
default page chrome. None of the six existing Brand Primitives are carried
into Phase 5 by default, and their prior existence as working code is not
by itself a reason to reuse them.

**Functional technical overlay = content-specific only.** If VISION-X2 or
the Homepage genuinely need a detection box, measurement line, datum,
alignment marker, coordinate, or pass/fail indicator, it must be designed
fresh from the actual technical behavior it represents, under Rule 07 (§5).
Reusing an existing Brand Primitive component *because it already exists in
the codebase* is explicitly not sufficient justification — the shape, motion,
and role must be re-derived from what Rule 07 actually requires for that
specific piece of content.

Full background on the conflict and the superseded system is preserved in
`docs/design-history/DESIGN-v1-precision-datum.md`. Note also (unresolved,
not blocking, informational only): that archived file records that
`tokens.css` currently defines `--color-copper-600` as a blue hex, not a
copper one — an internal drift from before this Gate ruling, irrelevant now
that copper is not the mandated accent, but worth knowing if `tokens.css` is
inspected during Mockup-to-production translation later.

---

## 1. Project Purpose

鋒岳自動化 / **FORGEON AUTOMATION** is a fictional precision industrial
automation brand, built as a portfolio piece for design studio 頁構所. The
website itself must read as a real, mature, credible, technically competent
industrial automation company — portfolio/demo disclosure exists only in
頁構所's own future case study, never inside the FORGEON site itself. Do not
write "Portfolio Demo," "Concept Project," "Fictional Company," "頁構所
作品," or "Experimental Project" anywhere in FORGEON-facing content.

**Business priority order: D → C → B → A**

- **D (highest):** Prove 頁構所 is capable of premium-priced design/strategy/
  development work.
- **C:** Make FORGEON read as a real, credible, mature industrial company.
- **B:** Prove capability handling complex engineering / technical
  information.
- **A (lowest):** Inquiry conversion. Never trade hierarchy, whitespace,
  premium perception, or technical credibility for a CTA optimization.

---

## 2. Audience

- **Primary fictional persona — 製程工程師 / 自動化工程師 (process /
  automation engineer):** needs to quickly answer — what does this do, what
  process fits, what's the performance, can it integrate, what are the
  specs/interfaces/compatibility/installation implications.
- **Secondary fictional persona — 採購 / 工廠管理者 (procurement / plant
  manager):** needs to quickly answer — who is this company, is the product
  credible, what's the application value, is it worth contacting.
- **Real audience (the one that actually matters for priority D):** an
  enterprise prospect evaluating whether 頁構所 is worth premium pricing.
  Every design decision should be checkable against: "would this make that
  prospect believe 頁構所 can do premium-priced, technically literate design
  work?"

---

## 3. Art Direction

**Locked direction: Precision Instrument Editorial / 精密儀器編輯感**

- Ratio: **70% Precision Industrial Engineering + 30% Premium Minimalism.**
  Not Apple-clone, not generic SaaS, not Awwwards-gimmick-first.
- Portfolio intensity: **75% credible premium commercial website + 25%
  signature WOW.** Credible-and-expensive first; impressive second — never
  the reverse.
- **Highest design principle: PREMIUM MUST COME FROM PRECISION, NOT
  DECORATION.** Perceived value comes from product photography, composition,
  proportion, whitespace, typography, information hierarchy, material
  detail, engineering authenticity, motion timing, and consistency — never
  from decorative effects, gimmicks, excessive animation, or generic luxury
  styling.

---

## 4. Reference Responsibility (LOCKED — do not "mix all references")

Confirmed by Phase 3B real-screenshot verification (52 screenshots,
`docs/design-research/forgeon/04-visual-reference-verification.md`). Each
reference has one clear scope. Do not blend beyond it.

### Leica Camera — PRIMARY

Controls: overall premium rhythm, whitespace, information-density attitude,
product-first composition, typography restraint, product storytelling
rhythm (detail ↔ whole-product alternation).

Do not copy: Leica branding, Leica red, exact layouts, camera-specific
narrative ("photos this device produced" as proof of performance — rejected,
see `REJECT-LEICA-01`), consumer retail structure.

### ZEISS Microscopy — TECHNICAL IA, NARROW SCOPE

**Phase 4 Gate fix:** `KEEP-ZEISS-01` (dual-track taxonomy) and
`KEEP-ZEISS-02` (three-level breadcrumb) are **not** requirements for Phase
5 — they remain valid Research Evidence / Future IA Capability, to draw on
only if actual Phase 5 content genuinely needs a breadcrumb or a dual-track
taxonomy. Do not add either pattern speculatively just because ZEISS
demonstrated it.

What ZEISS actually governs for Phase 5:

- Technical information grouping.
- Specification hierarchy.
- Application/product relationship.
- Progressive disclosure of complex technical information.

Must not control: overall visual style, homepage density, color, typography
personality, card styling. **`KEEP-ZEISS-03` is dropped entirely** (not just
narrowed) — its cited evidence screenshot (`zeiss-product-desktop-specs.png`)
was verified during Phase 4 review to actually show a three-tile
platform-comparison selector, not the "checkmark icon + bold heading +
paragraph" Highlights pattern the entry described. The pattern was never
actually observed and must not appear in any Mockup as a ZEISS-derived
pattern.

### Teenage Engineering — IMAGING ONLY

Controls: product lighting, material treatment, crop consistency, angle
consistency, edge lighting, product-family image system.

Must not be borrowed: typography, IA, playful brand tone, cultural
references, retail UI, ticker/marquee elements, promotional language,
consumer-electronics personality.

### Terminal Industries — INDUSTRIAL REALITY CHECK

Not a visual Primary. Controls: real industrial context, industrial
photography, technology-overlay logic, section structural variety,
functional visualization. Exists specifically to prevent FORGEON from
reading as *"a premium consumer product brand wearing industrial copy."*

Must not be borrowed: neon-green identity, glass nav, SaaS visual grammar,
generic cards, exact typography, exact CTA system.

---

## 5. Core Visual Rules (LOCKED)

### Rule 01 — Precision Detail First

Product Detail Hero leads with a **precise close-up detail**, not the full
product shown all at once. For VISION-X2: lens, optical module, sensor,
lighting module, connector/machining detail. First impression must read as
"precision instrument," not "generic industrial equipment."

### Rule 02 — Product Story Rhythm

Image narrative order: **DETAIL → WHOLE PRODUCT → INDUSTRIAL CONTEXT.**
Detail establishes precision/material; whole product establishes
recognition; context establishes industrial authenticity and use. Do not
repeat the same full-product shot across every section.

### Rule 03 — Controlled Information Density

One viewport communicates **one primary concept.** Do not stack headline +
long intro + 4 cards + stats + CTA + badges + extra notes into a single
screen. High perceived value comes from whitespace, focus, and rhythm — not
information stacking.

### Rule 04 — Copy Restraint

Forbidden as a default: Eyebrow → Heading → Intro paragraph → Explanation
paragraph → Cards → CTA, repeated every section. Every section must answer
"how much text does this actually need?" Delete copy with no function.
Information already expressed by imagery, data, or a technical visual
should not be repeated in a paragraph.

### Rule 05 — Product Family Consistency

AXM-400 / VISION-X2 / FLEXCELL-M must not be forced into a shared color
scheme to read as a family. Use consistent camera angle, lighting direction,
crop logic, background behavior, shadow system, and image scale instead.

### Rule 06 — Signature Product Lighting

VISION-X2 may use dark neutral background + controlled side lighting +
subtle edge/rim lighting to foreground lens/glass/metal/machining/optical
precision. **This is signature product imaging, scoped to specific product
photography — it is explicitly not a global UI theme.** The site as a whole
must not become a dark/black tech site.

### Rule 07 — Industrial Context + Functional Overlay

Industrial-context imagery should be believable/highly realistic real
industrial scenes. Overlays (detection bounding box, inspection marker,
alignment datum, measurement line, pass/fail state, coordinate, recognition
region) must represent **real technical behavior** — never a decorative HUD,
fake scanner line, random particles, arbitrary grid, or meaningless data
visualization. This is the only path by which any datum/coordinate/alignment
visual language may reappear after §0's ruling — content-specific,
re-derived from real behavior, never a reused legacy component.

### Rule 08 — Structural Rhythm

Homepage section skeletons are decided **by content, not by quota.**
Forbidden: three-cards / three-cards / three-cards / three-cards repeated
for 3-4 consecutive sections. Also forbidden: forcing six visibly different
layouts purely to look varied. Structural variation must have an
information reason — different content deserves different structure, no
more, no less.

---

## 6. Content Density Contract

FORGEON's current largest defect is information overload. This section is a
hard content contract, not a style suggestion.

**Homepage objective:** not a company database. In ~15-30 seconds a visitor
should understand (1) who FORGEON is, (2) what FORGEON does, (3) core
product/capability, (4) why it's credible, (5) where to go next. Everything
more detailed belongs on inner pages via progressive disclosure.

**Homepage section count:** not locked to an exact number, but the target is
**~5-6 major sections**, not the current large stack. Initial IA hypothesis
(adjustable at Mockup stage): Hero → Core Capability → Featured Product/
System → Engineering Evidence/Industrial Context → Integration/Deployment
Logic → CTA.

**Hero content budget:**
- Desktop H1: ~1-2 lines. Mobile: max ~3 lines.
- Supporting copy: target ~40-60 Traditional Chinese characters. The hero
  is not an article.
- CTA: max 1 primary + 1 secondary. If the secondary isn't necessary, drop
  it and keep only the primary.

**Section heading:** target ~10-18 Chinese characters — not a hard limit,
but going over needs a specific reason.

**Section intro:** target ~30-50 Chinese characters. Longer content belongs
on an inner page, in expandable content, or in a technical section.

**Body measure (zh-TW desktop):** comfortable reading length as the
priority — initial target ~28-36 full-width Chinese characters per line.
Do not run a full-width line across the entire desktop viewport.

**Technical data:** use grouping, tables, definition lists, diagrams, or
structured data layouts. Do not write specifications as marketing prose
paragraphs.

---

## 7. Homepage IA Principles

Current homepage IA is **NOT locked.** Up to ~40-60% of current homepage
content may move — not be deleted, but relocated to Products, Product
Detail, Solutions, Industries, Contact, or future technical pages. Preserve
business truth; do not preserve a bad information architecture just because
content already exists there.

---

## 8. Product Detail Principles (VISION-X2)

VISION-X2 is the locked **First Showcase Product** (Phase 3B confirmed —
best visual/technical-storytelling fit with Direction B, and the only one of
the three products with no existing detail page, per
`src/content/products/vision-x2.md`'s `hasDetailPage: false`).

**Target: Marketing Website + Credible Engineering Datasheet** — not a full
engineering manual, not a pretty landing page with no technical substance.

**Suggested information hierarchy** (starting hypothesis for Mockup, not
final):

1. **Identity** — VISION-X2, product category, short positioning.
2. **Product Story** — precision detail → whole product → engineering
   rationale (Rule 02).
3. **Core Capabilities** — positioning, defect inspection, barcode/code
   recognition, feature recognition (from `vision-x2.md`'s existing
   `features`).
4. **Optical/Lighting Logic** — lighting options, material-dependent
   selection, vision logic (existing `options` content: multi-lighting
   module combination).
5. **Integration** — controller, I/O, communication, data export, interface
   (existing spec: 通訊介面/Communication Interface).
6. **Technical Specification** — performance, system, integration,
   environment (existing `specs` block).
7. **Application Context** — real industrial scenario + functional detection
   overlay (Rule 07).
8. **Downloads/Contact** — if needed; do not invent a large data set that
   isn't needed yet.

---

## 9. Typography

Do not blindly copy Leica's typeface. This section defines **behavior**, not
a font name (see §20 Open Decisions — exact family is a Mockup-stage
decision).

- **Display:** precise, neutral, contemporary, high legibility. No SaaS
  personality, no luxury-fashion exaggeration.
- **Chinese:** first-class typography, not an afterthought bolted onto an
  English-first design. Must be checked for glyph density, line height,
  punctuation, Latin/Chinese mixing behavior, technical numbers, and English
  model names (AXM-400, VISION-X2, FLEXCELL-M) sitting inline with Chinese
  text.
- **Hierarchy:** built primarily from scale, weight, spacing, and measure —
  not from random colors, pills, or card backgrounds.
- **Technical labels:** short English technical labels may use uppercase
  with modest tracking. Traditional Chinese must not be forced into large
  tracking (large tracking on CJK glyphs reads as broken, not premium — this
  was confirmed as a specific Leica risk in Phase 3B's REJECT list).
- **Monospace:** only for genuine data/measurement/coordinate/technical
  code. Not a decorative "industrial" flourish.

---

## 10. Color

Do not copy Leica red, ZEISS blue, Teenage Engineering orange, or Terminal
Industries' neon green — and, per §0's ruling, do not default back to the
superseded Datum System's copper either. FORGEON must establish its own
color identity for Direction B; none of the references or the prior system
decide this for us.

**Candidate color strategy (to be validated in Mockup, not locked):**
neutral-dominant, an industrial material tone, one controlled accent, high
contrast, accessible. The accent must carry real brand meaning (CTA/active
state/key data point) — not be scattered around "to add design interest."

---

## 11. Image Art Direction

FORGEON images may be cropped, recomposed, background-removed/reconstructed,
relit, color-graded, regenerated, or AI-assisted/generated, including
technical illustration, exploded-view-inspired visuals, and detection
visualization. All of it must read as **one art direction system** — one
brand, one photography team, one visual director — not each image looking
good in isolation with no shared logic.

**AI image rule:** AI is a production tool, not a shortcut around physical
plausibility. Forbidden: impossible machine geometry, fake industrial
detail, inconsistent hardware, impossible conveyor logic, impossible robot
interaction, meaningless cable/sensor placement, incorrect product shape. If
a product's full mechanical detail can't be generated credibly, prefer crop/
abstraction/partial detail/controlled context over a fully generated fake
machine.

---

## 12. Motion

**Locked: 精緻微動態 (refined micro-motion).** Purpose: reveal hierarchy,
guide attention, explain product, reinforce precision.

Allowed: controlled image reveal, subtle product entrance, technical line
animation, restrained hover, section transition, small scroll-linked effect
when it's justified by content.

Forbidden: long cinematic scroll, excessive sticky behavior, horizontal
scroll gimmicks, flying text, custom cursors, particles, meaningless
parallax, animation on every element.

**Motion must not hide weak static design.** Every screen must hold up as a
static screenshot with motion off.

---

## 13. Responsive

Mobile is not Desktop scaled down.

- **Priority to preserve:** hierarchy, product identity, readable
  typography, image focal point, technical usability.
- **Acceptable to sacrifice:** decorative whitespace, secondary visual
  composition.
- **Tabs/secondary nav:** not a blanket "all tabs become dropdowns" rule.
  Collapse to disclosure/dropdown specifically when Traditional Chinese
  label length, option count, or viewport width can't safely carry a
  horizontal nav. Short labels with few options may stay as direct nav.
  (Phase 3B verified this collapse pattern cross-site on Leica and ZEISS —
  it's evidence-backed, not assumed.)
- **Images:** must be re-cropped for mobile, not scaled via `width: 100%`
  from the desktop composition.
- **Tables:** technical tables need an explicit mobile strategy — structured
  stack, horizontal scroll where semantically justified, or grouped
  definition layout. Never let text get compressed into unreadability.

---

## 14. Components

**Cards** must earn their existence — only when content genuinely needs
grouping, comparison, a selectable option, a discrete entity, or a repeated
dataset. A paragraph wrapped in a rounded rectangle for no structural reason
is not a card, it's decoration — forbidden.

**Border radius** is not a premium signal by default. Radius follows
physical-object language, information grouping, or interaction state — not
a uniform 20-32px applied to every section.

**Icons** are for action, navigation, technical meaning, or status only.
Do not attach an icon to every marketing sentence. If the text is already
clear, skip the icon.

---

## 15. Claims Integrity

FORGEON is fictional, so plausible fictional product specifications are
fine — but they must be internally consistent, plausible, clearly treated
as project-demo truth, and must never include: fake certification, fake
customer, fake award, fake patent, fake compliance certificate, fake sales
number, or fake installation count. This matches `PRODUCT.md`'s existing
"Never fake a signal" principle and `Capabilities and Constraints` section —
this document does not loosen that, only restates it for design-decision
context.

**Client Logo Rule:** no client logo wall as Design DNA in this phase.
Terminal Industries' grayscale logo wall (`KEEP-TERMINAL-03`) does not enter
Phase 5 mockups — FORGEON is a fictional portfolio demo and must not
fabricate client relationships to fill layout space, even in grayscale.

---

## 16. Anti-Slop / Forbidden Patterns

Forbidden by default unless a specific content reason survives Design Gate
review: generic SaaS hero; generic centered hero + gradient; three equal
feature cards as the default solution; repeated rounded cards; pastel
category cards; excessive pills/badges; glassmorphism; glow; decorative
gradient; generic 3D blobs; random floating shapes; emoji; fake dashboard
elements; fake HUD; fake technical overlay; random particles; crosshair
decoration; every section using the same structure; every section using
eyebrow+heading+paragraph; giant text with no information purpose; Apple
clone; Awwwards interaction for interaction's sake; decorative monospace
everywhere; unnecessary icon grids; blue-purple neon SaaS aesthetic;
AI-generated generic industrial imagery with impossible machinery; generic
stock photography; decorative charts with no real data.

---

## 17. Signature Moments (~25% of the site)

Candidates, max 2-4 real memorable moments total — concentrated, not spread
thin:

1. Homepage Hero
2. Featured Product Reveal
3. VISION-X2 Product Hero
4. Technical/Detection Visualization

Everywhere else stays restrained. If every section tries to be a WOW moment,
none of them actually is one.

---

## 18. Mockup Sequence (Phase 5)

**Phase 4 Gate fix:** Phase 5 is no longer four mockups produced together.
Each stage requires its own Human / ChatGPT Gate approval before the next
stage starts.

1. **Phase 5A** — Homepage Desktop (1440px) → Human / ChatGPT Gate
2. **Phase 5B** — Homepage Mobile (390px) → Responsive Gate
3. **Phase 5C** — VISION-X2 Product Detail Desktop (1440px) → Product Gate
4. **Phase 5D** — VISION-X2 Product Detail Mobile (390px) → Final Mockup Gate

No stage begins before the prior stage is explicitly approved.

Mockups must use realistic content, realistic text length, real/approved
product imagery, and actual technical information density — not wireframes,
placeholders, Lorem Ipsum, or gray boxes. No production Astro/CSS work
happens before all four mockup stages pass their gates.

**Mockup Gate question (each stage):** can a human say, without hedging,
*"this quality level is one I'm willing to have represent 頁構所's
portfolio"*? If the answer isn't a clear yes, the next stage does not start.

**Design system debt rule:** future implementation replaces, it does not
append. No stacking old CSS + override + patch + refinement. Once a new
direction is approved, superseded visual rules (§0) get removed, not
layered under.

---

## 19. Design QA Checklist

- Does this look like a credible industrial company?
- Does this look premium without decoration?
- Is one viewport trying to say too many things?
- Can copy be removed?
- Are cards actually necessary?
- Does product imagery feel consistent across AXM-400/VISION-X2/FLEXCELL-M?
- Is the image physically/industrially believable?
- Does the page still work without animation?
- Is the Chinese typography first-class, not an English-first afterthought?
- Does mobile preserve hierarchy, not just shrink desktop?
- Is any element copied too literally from a reference (Leica/ZEISS/TE/
  Terminal)?
- Does this feel like FORGEON, not like Leica / ZEISS / Teenage Engineering
  / Terminal Industries?
- Would a prospective enterprise client perceive this as premium work?

---

## 20. Open Decisions for Mockup Stage

**LOCKED (this document, do not re-litigate without a new Gate):** business
priority order; personas; Direction B as sole Global Art Direction (§0);
reference responsibility assignment (§4); the 8 Core Visual Rules (§5); the
Content Density Contract's qualitative principles (§6); Homepage IA
flexibility (§7); VISION-X2 as showcase product; the Anti-Slop list (§16);
Signature Moment count (§17); the Phase 5A→5B→5C→5D gated sequence (§18).

**TO BE VALIDATED IN MOCKUP (not decided yet, do not treat as final):**
exact font family; exact font sizes; exact color hex values; exact spacing
tokens; exact grid values; exact border radius values; exact Hero
composition; exact homepage section count (5-6 is a target, not a lock);
exact motion durations; exact VISION-X2 specification layout; whether any
content-specific technical overlay under Rule 07 is needed at all for the
Homepage or VISION-X2 mockups.
