# ANALYTICS_EVENT_SPEC.md

Account-agnostic event layer: `window.dataLayer.push({ event, ...payload })`
via `trackEvent()` in `src/utils/analytics.ts`. No real GA4/GTM ID is wired
into this codebase — see `.env.example` and `README.md` "Analytics" for how
a real deployment turns these on (`PUBLIC_GTM_ID` is the only script this
codebase actually injects; route GA4 through a GTM tag rather than adding a
separate direct GA4 integration).

Two dispatch paths feed the same `trackEvent()` sink:
1. **Delegated clicks** — any element with `data-track="<event>"` is caught
   by a single `document.addEventListener('click', ...)` in
   `AnalyticsBridge.astro`, which also forwards `data-intent`/`data-source`
   (when present) and the page's `<html lang>` into the payload.
2. **Custom events** — components that need to fire on something other than
   a raw click (form lifecycle, page-load view events, language switch)
   dispatch a `forgeon:analytics` CustomEvent on `window`, which
   `AnalyticsBridge.astro` listens for and re-emits via `trackEvent()`.

## Event table

| Event | Fires when | Payload fields | Source file(s) | Status |
|---|---|---|---|---|
| `cta_click` | Any `data-track="cta_click"` element is clicked (Header desktop/mobile CTA, homepage hero primary/secondary CTA, product/solution/industry detail-page CTAs) | `label`, `href`, `intent` (`project`/`technical-advice`, when the link carries `data-intent`), `source` (`header-desktop`/`header-mobile`/`home-hero`/etc., when present), `locale` | `AnalyticsBridge.astro` (delegated); intent/source set via `data-*` attrs on `Header.astro`, `src/pages/{en,zh-tw}/index.astro` | **Fires** |
| `cta_click` (contact-page landing) | A visitor lands on `/contact/?intent=project` or `?intent=technical-advice` | `intent`, `locale`, `source: 'contact-page-landing'` | `src/pages/{en,zh-tw}/contact/index.astro` inline script | **Fires** |
| `contact_click` | Direct `mailto:` link is clicked (contact page "Direct Contact" block, footer email link) | `label`, `href`, `source` (`contact-page-direct`/`footer`) | `AnalyticsBridge.astro` (delegated); `data-track="contact_click"` added to the two `mailto:` anchors | **Fires** (previously declared in the `AnalyticsEvent` type but not wired to any element — fixed this pass) |
| `spec_download` | AXM-400 datasheet PDF download button is clicked | `label`, `href` | `AnalyticsBridge.astro` (delegated); `Button trackEvent="spec_download"` on product detail pages | **Fires** |
| `language_switch` | Language switcher link is clicked | `to` (target hreflang) | `LanguageSwitcher.astro` | **Fires** (unchanged this pass) |
| `product_view` | A product detail page finishes loading | `slug`, `locale` | Inline script at the bottom of `src/pages/{en,zh-tw}/products/[slug]/index.astro` | **Fires** (previously declared but never dispatched anywhere — fixed this pass) |
| `solution_view` | A solution detail page finishes loading | `slug`, `locale` | Inline script at the bottom of `src/pages/{en,zh-tw}/solutions/[slug]/index.astro` | **Fires** (previously declared but never dispatched anywhere — fixed this pass) |
| `rfq_start` | First `focusin` event inside the RFQ form (not on every failed submit attempt) | `locale` | `ContactForm.astro` (`markStarted()`, `once: true` listener) | **Fires** (previously fired on every submit attempt including repeated invalid ones — fixed this pass to fire once, on first real interaction) |
| `rfq_submit` | Form submit completes, in any of three outcomes | `mode: 'live' \| 'demo' \| 'failed'`, `locale` | `ContactForm.astro` | **Fires**, now with a `failed` mode (previously only `live`/`demo` were dispatched; a thrown fetch error reached the `catch` block without ever emitting an analytics event) |

## Payload shape

All events share the same envelope pushed to `window.dataLayer`:

```js
{ event: '<event-name>', ...payload }
```

`trackEvent()` never throws if `window.dataLayer` doesn't exist — it's a
silent no-op (`src/utils/analytics.ts`), so nothing here can break the page
in an environment with no GTM container configured.

## What changed this pass (spec 4.2)

- `product_view` / `solution_view`: added — were type-declared, zero call
  sites before this pass.
- `contact_click`: wired to the two real `mailto:` links on site
  (previously type-declared with no element anywhere using it).
- `rfq_start`: moved from "fires on every failed submit attempt" to "fires
  once, on first focus into the form" per spec 2.5.
- `rfq_submit`: added a `failed` mode so a thrown fetch/network error in
  Live Mode is now visible in analytics, not just as a UI error state.
- `cta_click`: now carries `intent`/`source`/`locale` instead of just
  `label`/`href`, so the two-tier CTA strategy (`提交專案需求` vs
  `索取技術建議`) is actually distinguishable in downstream reporting.
- `PUBLIC_GA4_ID` removed entirely (config, `env.d.ts`, `.env.example`,
  README, privacy pages) — it was declared end-to-end but never consumed
  by any script-injection code path, which is exactly the kind of
  "looks wired up but isn't" gap spec 4.2 asked to resolve. `PUBLIC_GTM_ID`
  is the one real, working path; GA4 should be added as a tag inside that
  GTM container rather than via a second, parallel direct integration.

## Not implemented / known limitation

No real GTM/GA4 account was configured or tested against in this sandboxed
session (no network egress to Google's tag serving infrastructure, and no
real container ID exists for this fictional demo brand). Every event above
was verified by (a) reading the dispatch code path, (b) confirming the
triggering DOM element/script exists in the built HTML via `grep`, not by
watching a live GA4 DebugView. A user with a real GTM container ID should
set `PUBLIC_GTM_ID`, rebuild, and use GTM's own Preview mode to confirm
each event fires as documented above — the code path doesn't change
between demo and production accounts, only whether a container ID is
present to receive the pushes.
