import { test, expect } from '@playwright/test';

test.describe('Header production implementation (CC-02I-02)', () => {
  test('desktop header height is approximately 80px at 100% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const height = await page.locator('[data-header]').evaluate((el) => el.getBoundingClientRect().height);
    expect(height, `desktop header height was ${height}px`).toBeGreaterThanOrEqual(76);
    expect(height, `desktop header height was ${height}px`).toBeLessThanOrEqual(96);
  });

  for (const locale of ['zh-tw', 'en']) {
    test(`1024px uses the compact header without wrapped desktop navigation (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 900 });
      await page.goto(`/${locale}/`);

      await expect(page.locator('.desktop-nav')).toBeHidden();
      await expect(page.locator('.site-header__cta')).toBeHidden();
      await expect(page.locator('[data-mobile-nav-toggle]')).toBeVisible();

      const height = await page.locator('[data-header]').evaluate((el) => el.getBoundingClientRect().height);
      expect(height, `${locale} @ 1024px: compact header height was ${height}px`).toBeGreaterThanOrEqual(64);
      expect(height, `${locale} @ 1024px: compact header height was ${height}px`).toBeLessThanOrEqual(68);
    });

    test(`1120px desktop navigation stays on one row (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 1120, height: 900 });
      await page.goto(`/${locale}/`);

      await expect(page.locator('.desktop-nav')).toBeVisible();
      await expect(page.locator('.site-header__cta')).toBeVisible();
      await expect(page.locator('[data-mobile-nav-toggle]')).toBeHidden();

      const linkTops = await page.locator('.desktop-nav__link').evaluateAll((links) =>
        links.map((link) => Math.round(link.getBoundingClientRect().top)),
      );
      expect(new Set(linkTops).size, `${locale} @ 1120px: desktop nav wrapped to multiple rows`).toBe(1);
    });
  }

  // Remediation (review HIGH-01): the previous 60-84px range accepted
  // measured failures (77px @ 390px, 90px @ 360px, 94px @ 320px) as
  // passing. The ticket's actual contract is 64-68px — tightened here to
  // reflect that contract, not the pre-fix measured behavior. Covers all
  // three ticket-mandated mobile widths and both locales (ticket §12).
  for (const width of [390, 360, 320]) {
    for (const locale of ['zh-tw', 'en']) {
      test(`mobile header height is within the 64-68px contract (${width}px, ${locale})`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(`/${locale}/`);
        const height = await page.locator('[data-header]').evaluate((el) => el.getBoundingClientRect().height);
        expect(height, `${locale} @ ${width}px: mobile header height was ${height}px`).toBeGreaterThanOrEqual(64);
        expect(height, `${locale} @ ${width}px: mobile header height was ${height}px`).toBeLessThanOrEqual(68);
      });
    }
  }

  // Playwright/Chromium has no faithful emulation of real browser-chrome
  // page zoom (Ctrl/Cmd+): the CSS `zoom` property is a distinct Chromium
  // feature that shrinks the effective layout viewport reported by
  // `clientWidth`, which is not how actual browser UI zoom behaves
  // (`window.innerWidth` is unaffected by real zoom). This suite therefore
  // verifies the CSS invariants that guarantee no-clipping at any zoom
  // level (min-block-size, no overflow:hidden, no fixed-height overlap) via
  // automation, and separately exercises a 2x-font-size reflow proxy as a
  // best-effort functional check — neither is claimed to BE real browser
  // 200% zoom. Real 200% zoom must be confirmed by manual verification and
  // recorded in completion evidence (ticket §15); this is an automation
  // limitation, not a lowered acceptance bar (see remediation report).
  test('header uses min-block-size (not a fixed height that clips at zoom), no overflow:hidden clipping', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const result = await page.evaluate(() => {
      const header = document.querySelector('[data-header]') as HTMLElement | null;
      if (!header) return null;
      const style = getComputedStyle(header);
      const clippingDescendants: string[] = [];
      header.querySelectorAll('*').forEach((el) => {
        if (el.tagName.toLowerCase() === 'svg' || el instanceof SVGElement) return; // SVG's own overflow:hidden UA default does not clip surrounding text/layout
        const s = getComputedStyle(el);
        if (s.overflow === 'hidden' || s.overflowX === 'hidden') {
          clippingDescendants.push(el.tagName + '.' + (el.className || '').toString());
        }
      });
      return { minBlockSize: style.minBlockSize, height: style.height, clippingDescendants };
    });
    expect(result).not.toBeNull();
    expect(result!.minBlockSize, 'header must use min-block-size, not a fixed block-size').not.toBe('auto');
    expect(result!.clippingDescendants, 'no header descendant may use overflow:hidden (would clip content at zoom)').toEqual([]);
  });

  // Functional zoom-equivalent reflow check: text scaled 2x within the same
  // layout viewport (closer to how large-text/zoom accessibility settings
  // actually affect content than the CSS `zoom` property) must not clip,
  // truncate, or overlap Header content. This is explicitly a proxy, not a
  // substitute for real 200% browser zoom (see suite-level comment above).
  // Covers the ticket-mandated narrow viewports and both locales (§12).
  for (const vp of [
    { name: '1440px', width: 1440, height: 900, locale: 'zh-tw' },
    { name: '1440px', width: 1440, height: 900, locale: 'en' },
    { name: '390px', width: 390, height: 844, locale: 'zh-tw' },
    { name: '390px', width: 390, height: 844, locale: 'en' },
    { name: '360px', width: 360, height: 800, locale: 'zh-tw' },
    { name: '360px', width: 360, height: 800, locale: 'en' },
    { name: '320px', width: 320, height: 800, locale: 'zh-tw' },
    { name: '320px', width: 320, height: 800, locale: 'en' },
  ]) {
    test(`2x font-size reflow proxy: no clipped/overlapping/off-screen Header content (${vp.name}, ${vp.locale})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/${vp.locale}/`);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });

      const result = await page.evaluate((viewportWidth) => {
        const header = document.querySelector('[data-header]') as HTMLElement | null;
        const selectors = ['.site-header__brand', '.site-header__lang', '.site-header__cta a.btn', '.mobile-nav-toggle'];
        const boxes = selectors
          .map((sel) => {
            const el = document.querySelector(sel) as HTMLElement | null;
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            // Zero-size box means responsively hidden here (e.g. desktop
            // CTA on mobile, mobile toggle on desktop) via this element's
            // own display:none or an ancestor's — not a zoom-clipping
            // failure, so it's excluded from overlap/containment checks.
            if (rect.width === 0 && rect.height === 0) return null;
            return { sel, rect };
          })
          .filter((b): b is { sel: string; rect: DOMRect } => b !== null);

        const offScreen = boxes
          .filter((b) => !(b.rect.left < viewportWidth && b.rect.right > 0))
          .map((b) => b.sel);

        // Pairwise overlap check among the visible interactive/brand boxes
        // — two controls' boxes intersecting means one visually covers the
        // other at this zoom level.
        const overlapping: string[] = [];
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i]!.rect;
            const b = boxes[j]!.rect;
            const intersects = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
            if (intersects) overlapping.push(`${boxes[i]!.sel} × ${boxes[j]!.sel}`);
          }
        }

        // Truncation proxy: an element whose scrollWidth/scrollHeight
        // exceeds its own clientWidth/clientHeight is clipping its own
        // content (e.g. `overflow: hidden` + text that no longer fits).
        const truncated: string[] = [];
        header?.querySelectorAll('*').forEach((el) => {
          if (el instanceof SVGElement) return;
          const e = el as HTMLElement;
          if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) {
            const cs = getComputedStyle(e);
            if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') {
              truncated.push(e.tagName + '.' + (e.className || '').toString());
            }
          }
        });

        // Scoped to the header's own box, not document.documentElement —
        // other page sections (Hero, etc.) are out of this ticket's file
        // scope (§6 forbidden paths) and may have their own, separately
        // tracked reflow behavior at 2x font-size; this check only asserts
        // the Header itself does not push its own right edge past the
        // viewport.
        const headerRect = header?.getBoundingClientRect();

        return {
          headerRight: headerRect?.right ?? 0,
          headerScrollWidth: header?.scrollWidth ?? 0,
          headerClientWidth: header?.clientWidth ?? 0,
          offScreen,
          overlapping,
          truncated,
        };
      }, vp.width);

      expect(result.offScreen, `controls off-screen at 2x font-size: ${result.offScreen.join(', ')}`).toEqual([]);
      expect(result.overlapping, `overlapping controls at 2x font-size: ${result.overlapping.join(', ')}`).toEqual([]);
      expect(result.truncated, `truncated/clipped elements at 2x font-size: ${result.truncated.join(', ')}`).toEqual([]);
      expect(result.headerRight, `Header's own right edge (${result.headerRight}px) must not exceed viewport width (${vp.width}px) at 2x font-size`).toBeLessThanOrEqual(vp.width + 1);
      expect(result.headerScrollWidth, `Header itself overflows horizontally at 2x font-size (scrollWidth ${result.headerScrollWidth} > clientWidth ${result.headerClientWidth})`).toBeLessThanOrEqual(result.headerClientWidth + 1);
    });
  }

  // Remediation (review HIGH-03): the previous test measured
  // .site-header__lang, a wrapper <div> whose min-block-size faked the
  // 44px floor while the actual <a class="lang-switch"> rendered ~32.5px
  // tall — what a real pointer/assistive-tech hit-test targets. This
  // measures the anchor itself, both locales, both the desktop and mobile
  // instances (Header.astro renders LanguageSwitcher twice: the desktop
  // .site-header__lang wrapper and the mobile drawer's .mobile-nav__footer
  // — the acceptance criterion applies to both, not just one occurrence).
  for (const locale of ['zh-tw', 'en']) {
    test(`language switch anchor itself (not a wrapper) meets 44x44px (desktop, ${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${locale}/`);
      const box = await page.locator('.site-header__lang a.lang-switch').boundingBox();
      expect(box, 'language switch anchor must be present').not.toBeNull();
      expect(box!.width, `anchor width was ${box!.width}px`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `anchor height was ${box!.height}px`).toBeGreaterThanOrEqual(44);
    });
  }

  test('language switch anchor itself meets 44x44px on mobile (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');
    const box = await page.locator('.site-header__lang a.lang-switch').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width, `anchor width was ${box!.width}px`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `anchor height was ${box!.height}px`).toBeGreaterThanOrEqual(44);
  });

  // Remediation (review HIGH-03, extended per remediation brief §4): the
  // mobile hamburger toggle is the other Header control the ticket names
  // explicitly ("Touch targets >=44x44px unchanged for language switch and
  // mobile toggle", §10) — it measured 40x40px (24px svg + 8px padding)
  // before this remediation.
  test('mobile nav toggle button itself meets 44x44px (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');
    const box = await page.locator('[data-mobile-nav-toggle]').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width, `toggle width was ${box!.width}px`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `toggle height was ${box!.height}px`).toBeGreaterThanOrEqual(44);
  });

  // The Datum Origin mark was part of the Precision Datum System, which
  // DESIGN.md v2 §0 explicitly supersedes (Human/ChatGPT Design Contract
  // Gate ruling, Phase 4). Header.astro no longer renders it — this test
  // now asserts its absence instead of its presence, plus that the logo
  // alone still renders correctly without it.
  test('Datum Origin mark (superseded Precision Datum System) is not rendered; logo renders alone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const datum = page.locator('.site-header__brand .site-header__datum');
    await expect(datum).toHaveCount(0);
    const logo = page.locator('.site-header__brand a.logo');
    await expect(logo).toBeVisible();
  });

  test('Logo.astro renders with unchanged accessible name (no duplicated brand string in Header)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const logo = page.locator('.site-header__brand a.logo');
    await expect(logo).toHaveAttribute('aria-label', '鋒岳自動化 FORGEON AUTOMATION');
  });

  // Rewritten for DESIGN.md v2 §0/§10 (Phase 5A-R2): the header CTA is a
  // bordered/transparent button whose ACCENT lives in its text `color`, not
  // `background-color` (background stays transparent until :hover, when it
  // switches to --color-ink — an unrelated dark-fill state, not an accent
  // variant). The previous version of this test asserted background-color
  // against --color-action-primary — that assertion was already incorrect
  // against the property the CSS actually sets, independent of this
  // phase's token change. It also predates the Header/Hero-scoped
  // --color-accent override (Hero.astro/Header.astro's own comments) that
  // replaces the superseded Precision Datum System's --color-action-primary
  // for this phase's scope — see DESIGN.md v2 §0.
  test('header CTA text resolves to the scoped --color-accent (computed style, exact token match)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const cta = page.locator('.site-header__cta a.btn');
    await expect(cta).toBeVisible();

    const { ctaColor, tokenColor, ctaBg } = await page.evaluate(() => {
      const el = document.querySelector('.site-header__cta a.btn') as HTMLElement;
      const probe = document.createElement('div');
      probe.style.position = 'fixed';
      probe.style.left = '-9999px';
      probe.style.color = 'var(--color-accent)';
      el.appendChild(probe); // inside .site-header__cta's subtree so the scoped override applies
      const tokenColor = getComputedStyle(probe).color;
      probe.remove();
      return { ctaColor: getComputedStyle(el).color, tokenColor, ctaBg: getComputedStyle(el).backgroundColor };
    });
    expect(ctaColor, `header CTA text color (${ctaColor}) must equal scoped --color-accent (${tokenColor})`).toBe(
      tokenColor,
    );
    expect(ctaBg, 'header CTA background must stay transparent until hover').toBe('rgba(0, 0, 0, 0)');
  });

  test('header CTA hover fills with --color-ink and inverts text to --color-invert-text', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const cta = page.locator('.site-header__cta a.btn');
    await expect(cta).toBeVisible();
    await cta.hover();
    // Button.astro's .btn transitions background-color over
    // --duration-fast (--duration-micro = 160ms) — read the computed
    // style only after the transition has settled, not mid-interpolation.
    await page.waitForTimeout(300);

    const { ctaBg, tokenBg, ctaColor, tokenColor } = await page.evaluate(() => {
      const el = document.querySelector('.site-header__cta a.btn') as HTMLElement;
      const probe = document.createElement('div');
      probe.style.position = 'fixed';
      probe.style.left = '-9999px';
      probe.style.background = 'var(--color-ink)';
      probe.style.color = 'var(--color-invert-text)';
      document.body.appendChild(probe);
      const tokenBg = getComputedStyle(probe).backgroundColor;
      const tokenColor = getComputedStyle(probe).color;
      probe.remove();
      return { ctaBg: getComputedStyle(el).backgroundColor, tokenBg, ctaColor: getComputedStyle(el).color, tokenColor };
    });
    expect(ctaBg, `header CTA hover background (${ctaBg}) must equal --color-ink (${tokenBg})`).toBe(tokenBg);
    expect(ctaColor, `header CTA hover text (${ctaColor}) must equal --color-invert-text (${tokenColor})`).toBe(
      tokenColor,
    );
  });

  // Rewritten for Phase 5B-R1 §A/§B: the desktop top-level row was trimmed
  // from 6 to 4 items (solutions/products/industries/about) to fix a real
  // production blocker — the 5th/6th items ("技術資源"/"聯絡我們") wrapped
  // to a second row at 1120px with no width budget left to fit them
  // without cramming. Both dropped items remain real, reachable site
  // navigation — just no longer duplicated into the desktop primary row —
  // via the mobile drawer (unchanged, still renders all 6 from the same
  // navItems config) and Footer.astro (already links both). This test now
  // asserts the desktop row's new 4-item contract plus that the two
  // relocated items are still genuinely reachable from the mobile drawer,
  // rather than just asserting a raw count that would mask either an
  // accidental over-trim or a silent loss of site functionality.
  test('desktop nav shows the 4 primary entry points with valid hrefs; insights/contact remain reachable via mobile drawer', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const links = page.locator('.desktop-nav__link');
    await expect(links).toHaveCount(4);
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    for (const href of hrefs) {
      expect(href, 'every nav link must have a real href').toBeTruthy();
      expect(href!.startsWith('#'), `nav link ${href} must not be a placeholder anchor`).toBe(false);
    }
    expect(hrefs).toEqual(['/zh-tw/solutions/', '/zh-tw/products/', '/zh-tw/industries/', '/zh-tw/about/']);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');
    await page.locator('[data-mobile-nav-toggle]').click();
    const mobileHrefs = await page
      .locator('.mobile-nav__link')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(mobileHrefs).toContain('/zh-tw/insights/');
    expect(mobileHrefs).toContain('/zh-tw/contact/');
  });

  // Remediation (review §6.C): `toBeFocused()` alone only proves the
  // element is document.activeElement, not that a sighted keyboard user
  // can see where focus is. This additionally resolves the element's own
  // :focus-visible computed style (global.css's `--color-focus` outline
  // rule, §"Focus visibility") and asserts a real, visible outline is
  // present — not merely `outline: none`.
  test('desktop nav links are keyboard operable with a visible focus indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const firstLink = page.locator('.desktop-nav__link').first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    const outline = await firstLink.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor };
    });
    expect(outline.style, `:focus-visible outline-style was "${outline.style}"`).not.toBe('none');
    expect(parseFloat(outline.width), `:focus-visible outline-width was "${outline.width}"`).toBeGreaterThan(0);
  });

  for (const [label, selector, viewport] of [
    ['language switch', '.site-header__lang a.lang-switch', { width: 1440, height: 900 }],
    ['mobile nav toggle', '[data-mobile-nav-toggle]', { width: 390, height: 844 }],
    ['header CTA', '.site-header__cta a.btn', { width: 1440, height: 900 }],
  ] as const) {
    test(`${label} has a visible focus indicator on keyboard focus`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/zh-tw/');
      const el = page.locator(selector);
      await el.focus();
      await expect(el).toBeFocused();
      const outline = await el.evaluate((node) => {
        const cs = getComputedStyle(node);
        return { style: cs.outlineStyle, width: cs.outlineWidth };
      });
      expect(outline.style, `${label}: :focus-visible outline-style was "${outline.style}"`).not.toBe('none');
      expect(parseFloat(outline.width), `${label}: :focus-visible outline-width was "${outline.width}"`).toBeGreaterThan(0);
    });
  }

  test('no horizontal overflow at 360px and 320px, both locales', async ({ page }) => {
    for (const width of [360, 320]) {
      for (const locale of ['zh-tw', 'en']) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${locale}/`);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `${locale} @ ${width}px: scrollWidth (${scrollWidth}) must be <= clientWidth (${clientWidth})`).toBeLessThanOrEqual(clientWidth);
      }
    }
  });
});
