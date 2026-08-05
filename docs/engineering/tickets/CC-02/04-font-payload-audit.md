# 04 — Font payload audit

**What to build:** Real, measured (not estimated) audit of every WOFF2
request on both homepages — transfer size, resource size, weights used vs.
unused, total first-load cost, cache behavior — with a specific
investigation of whether Noto Sans TC 500 can reasonably be dropped.

**File scope:** `docs/engineering/reviews/CC-02-font-payload-audit.md`
(new). No font files or `@font-face` declarations changed this round.

**Blocked by:** None.

**Status:** done

- [x] Every WOFF2 request on `/zh-tw/` and `/en/` measured via a live
      Playwright network capture against a running `astro preview`
      instance (production build), not file-listing estimates.
- [x] Transfer size + resource size recorded per request; totals: `/zh-tw/`
      4,087,276 bytes, `/en/` 4,100,560 bytes (cold cache, first load).
- [x] Used vs. unused weights per homepage tabulated across all 10 shipped
      weight files.
- [x] Noto Sans TC 500's real usage site identified (`Header.astro`'s
      `.desktop-nav__link`, the only `font-weight: 500` consumer
      site-wide) via grep across every `.astro`/`.css` file.
- [x] Visual before/after comparison (weight 500 vs. forced 600) captured
      via real screenshots on the live rendered nav — real, visible
      difference found.
- [x] Decision recorded with reasoning: NOT removed, since spec §8 requires
      "clear evidence AND no design breakage," and the evidence here found
      a real breakage risk. Theoretical savings (987 KB) recorded anyway
      for completeness.
- [x] Cache-header finding (`Cache-Control: no-cache` on the preview
      server, unhashed `public/fonts/**` paths) recorded as a known,
      separate limitation for a future deploy-configuration stage — not
      silently omitted, not fixed this round (out of scope).
