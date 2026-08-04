# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static-first) + TypeScript strict. Chosen per the governing brief
(spec §10): no CMS, no WordPress, no heavy UI framework, no unnecessary
dependencies. Native CSS with custom properties for design tokens; native
JavaScript for interactivity (mobile nav, FAQ accordion, form validation,
language switch). No React/Vue/Svelte island framework is needed anywhere in
this build — every interactive surface is expressible with plain DOM APIs, so
none is added.

## Users

Three confirmed audiences, per the governing brief (spec §7 使用者路徑):

1. **Overseas procurement staff** — arrive via search, trade-show lists, or
   sales outreach; need to quickly confirm capability fit, browse English
   solutions/products, confirm applicable industry, then submit an RFQ.
2. **Automation / process engineers** — enter through a product or solution
   page; need feature/spec detail, applicable scenarios, a downloadable
   datasheet, then a channel to ask a technical question.
3. **Enterprise decision-makers** — enter through the homepage; need to
   understand positioning, service capability, and the implementation
   process before deciding whether to engage, then submit a request.

## Product Purpose

A bilingual (zh-TW / en) B2B industrial automation company website for a
fictional company, **鋒岳自動化 / FORGEON AUTOMATION**. The site's job is not
e-commerce; it is to get a qualified industrial buyer from "what does this
company do" to "I've submitted a project inquiry or technical request" in as
few confused clicks as possible. Success = a buyer can self-serve their way
to the right solution/product/industry match and reach a working RFQ form.

This is a portfolio/market-validation piece for an agency, 頁構所 (Yegou
Studio), demonstrating their ability to execute full B2B industrial site
builds: information architecture, bilingual content, conversion-oriented
forms, technical SEO, and production-quality front-end engineering — for a
concept client, not a real one.

## Positioning

FORGEON AUTOMATION's mechanism claim: it converts precision motion, vision
positioning, and line integration into evaluable, deployable automation
plans — as opposed to selling one-off machines with no integration
engineering behind them. Tagline: "精準驅動，更有效率的生產流程" /
"Precision in motion. Efficiency in production."

## Operating Context

- Fictional company based in central Taiwan, positioned as a supplier of
  precision motion modules and automation integration to overseas industrial
  buyers, engineers, and system integrators/distributors.
- Core services: precision linear motion modules, automation equipment
  integration, vision positioning & inspection, existing line upgrades,
  custom fixtures/assembly workstations, overseas technical support.
- Target industries: semiconductor & electronics assembly, precision metal
  machining, automotive components, packaging & logistics, optoelectronics,
  general industrial automation.
- Primary conversion path is an RFQ / contact form with a two-tier CTA
  strategy: 提交專案需求 / Discuss Your Project (primary), 索取技術建議 /
  Request Technical Advice (secondary).

## Capabilities and Constraints

- Fully bilingual: every core page ships in both zh-TW and en with parallel
  routes (`/zh-tw/...`, `/en/...`), correct `lang`, and `hreflang`.
- Structured content (products, solutions, industries, insights) lives in
  Astro Content Collections with a Zod schema, not hardcoded in pages.
- Contact form ships in two modes: live API (when `PUBLIC_RFQ_ENDPOINT` is
  set) and Demo Mode (default): validates fully client-side, never fakes a
  successful send, and visibly labels itself as non-functional demo
  behavior.
- No real GA4/GTM IDs are wired in; a dataLayer-based event layer is present
  but degrades silently when `window.dataLayer` doesn't exist.
- Every fictional spec, claim, or figure is labeled `demoData: true` in its
  content entry and rendered with a visible on-page disclaimer.
- No real customers, certifications (ISO/CE/patents), revenue figures, or
  photographs of real facilities are used anywhere. All imagery is original
  SVG/CSS or explicitly labeled placeholder/concept illustration (paid
  Higgsfield generation was planned but not executed in this build — see
  `docs/HIGGSFIELD_ASSET_PLAN.md` and `docs/SKILL_USAGE_LOG.md`).

## Brand Commitments

- Chinese brand name: 鋒岳自動化. English brand name: FORGEON AUTOMATION.
  Centralized in `src/config/site.ts`; never hardcoded elsewhere.
- Voice: professional, engineering-led, unembellished B2B tone. No
  superlative claims ("world-leading," "number one," "zero failure,"
  "absolutely precise," etc. — full banned list in
  `docs/COPY_STYLE_GUIDE.md`).
- Visual identity keywords: precision, engineering, reliability, modern,
  international B2B, orderly, technical but not cold. Full palette/type
  decisions recorded in `DESIGN.md`.

## Evidence on Hand

None — this is an intentionally fictional concept case. No real client
content, testimonials, press, or data exists or should be fabricated as if
real. Every fact is demo data and is labeled as such throughout the site and
in `docs/ASSET_LICENSES.md`.

## Product Principles

1. **Problem before pitch.** Every solution/product page states the
   manufacturing problem before the mechanism, per the brief's copy rules —
   no adjective-first marketing openers.
2. **Structured truth over prose sprawl.** All product/solution/industry
   facts live in typed content collections so the same data can drive
   listing cards, detail pages, and structured data without drift.
3. **Never fake a signal.** No fake success states, no fake certifications,
   no fake precision numbers presented as verified — every demo figure is
   visibly marked and the contact form never claims a submission succeeded
   when it didn't send.
4. **Bilingual parity, not translation-shaped filler.** English copy is
   written to industrial-B2B register, not transliterated from Chinese
   sentence structure.
5. **Static-first, JS-minimal.** Performance and accessibility outrank
   animation or visual flourish; no framework is introduced unless plain JS
   genuinely cannot express the interaction.

## Accessibility & Inclusion

No formal WCAG audit was performed with assistive-technology hardware in
this build (see `docs/QA_CHECKLIST.md` for what was and was not verified).
Baseline requirements enforced in code: semantic landmarks, visible focus
states, keyboard operability for nav/accordion/form, skip link, labeled form
fields with programmatic error association, `prefers-reduced-motion`
support, and no color-only signaling. The site does not publicly claim full
WCAG 2.2 AA conformance, per spec §24.
