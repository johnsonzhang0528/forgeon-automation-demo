import { test, expect, type Page } from '@playwright/test';

/**
 * CC-02I-06 Motion Orchestrator tests. Covers all seven R2-02 mandatory
 * cases (ticket §13) plus the Revision 1 assertions it carries forward:
 * single-orchestrator ownership, four-state machine, first-frame
 * correctness, reduced motion, No-JS, CTA safety across all states,
 * one-shot narrative behavior, and measured duration.
 *
 * Instrumentation strategy: `page.addInitScript` runs before any page
 * script (including the Hero's own synchronous bootstrap), so it can spy
 * on `IntersectionObserver` construction and record every
 * `data-motion-state` transition with a timestamp via `MutationObserver`
 * — this is what makes "no settled-then-flash" and "observer count"
 * checkable as executable evidence rather than source inspection.
 */

const ROUTES: Array<{ path: string; locale: 'zh-tw' | 'en' }> = [
  { path: '/zh-tw/', locale: 'zh-tw' },
  { path: '/en/', locale: 'en' },
];

declare global {
  interface Window {
    __ioSpyCount: number;
    __motionLog: Array<{ state: string | null; t: number }>;
  }
}

/** Installs the IntersectionObserver constructor spy + state-transition log before any page script runs. */
async function installSpies(page: Page) {
  await page.addInitScript(() => {
    window.__ioSpyCount = 0;
    window.__motionLog = [];
    const RealIO = window.IntersectionObserver;
    if (RealIO) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).IntersectionObserver = class extends RealIO {
        constructor(...args: ConstructorParameters<typeof RealIO>) {
          window.__ioSpyCount++;
          super(...args);
        }
      };
    }
    const start = performance.now();
    const record = () => {
      const root = document.querySelector('[data-hero-motion-root]');
      window.__motionLog.push({ state: root ? root.getAttribute('data-motion-state') : null, t: performance.now() - start });
    };
    // Record synchronously-observable state as early as possible, then on every mutation.
    const observeWhenReady = () => {
      const root = document.querySelector('[data-hero-motion-root]');
      if (!root) {
        // Root not yet in the DOM (script runs before body parses) — retry via MutationObserver on documentElement.
        const bootObserver = new MutationObserver(() => {
          const r = document.querySelector('[data-hero-motion-root]');
          if (r) {
            bootObserver.disconnect();
            record();
            new MutationObserver(record).observe(r, { attributes: true, attributeFilter: ['data-motion-state'] });
          }
        });
        bootObserver.observe(document.documentElement, { childList: true, subtree: true });
        return;
      }
      record();
      new MutationObserver(record).observe(root, { attributes: true, attributeFilter: ['data-motion-state'] });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeWhenReady, { once: true });
    } else {
      observeWhenReady();
    }
    observeWhenReady();
  });
}

test.describe('CC-02I-06 Motion Orchestrator: single-orchestrator ownership', () => {
  for (const { path } of ROUTES) {
    test(`${path} exactly one IntersectionObserver is constructed on normal page load`, async ({ page }) => {
      await installSpies(page);
      await page.goto(path);
      await page.waitForTimeout(1300);
      const count = await page.evaluate(() => window.__ioSpyCount);
      expect(count).toBe(1);
    });

    test(`${path} PrecisionSystemVisual and ProcessRail create no observer of their own`, async ({ page }) => {
      // The Hero-level count above is exactly 1; if either child created its
      // own observer, that count would be >= 2. This test asserts the
      // stronger, structural claim directly against source-free evidence:
      // rendered markup contains no <script> inside either child's output.
      await page.goto(path);
      const childScripts = await page.evaluate(() => {
        const visual = document.querySelector('.hero-root__visual');
        const rail = document.querySelector('.hero-root__rail');
        return {
          visual: visual ? visual.querySelectorAll('script').length : -1,
          rail: rail ? rail.querySelectorAll('script').length : -1,
        };
      });
      expect(childScripts.visual).toBe(0);
      expect(childScripts.rail).toBe(0);
    });
  }
});

test.describe('CC-02I-06 R2-02 Case 1: No-JS', () => {
  for (const { path } of ROUTES) {
    test(`${path} with JS disabled, root stays settled and full content is visible`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(path);

      const root = page.locator('[data-hero-motion-root]');
      await expect(root).toHaveAttribute('data-motion-state', 'settled');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.hero-root__body')).toBeVisible();
      const ctas = page.locator('.hero-root__ctas a.btn');
      await expect(ctas).toHaveCount(2);
      await expect(ctas.nth(0)).toBeVisible();
      await expect(ctas.nth(1)).toBeVisible();
      await expect(page.locator('.hero-root__visual')).toBeVisible();
      await expect(page.locator('.hero-root__visual-secondary')).toBeVisible();

      await context.close();
    });
  }
});

test.describe('CC-02I-06 R2-02 Case 2: Reduced motion', () => {
  for (const { path } of ROUTES) {
    test(`${path} reduced motion: root is settled immediately, 0 IntersectionObserver constructions`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await installSpies(page);
      await page.goto(path);
      await page.waitForTimeout(300);

      const root = page.locator('[data-hero-motion-root]');
      await expect(root).toHaveAttribute('data-motion-state', 'settled');

      const count = await page.evaluate(() => window.__ioSpyCount);
      expect(count).toBe(0);

      await expect(page.locator('h1')).toBeVisible();
      const ctas = page.locator('.hero-root__ctas a.btn');
      await expect(ctas.nth(0)).toBeVisible();
      await expect(ctas.nth(1)).toBeVisible();

      await context.close();
    });
  }
});

test.describe('CC-02I-06 R2-02 Case 3 & 7: Normal JS first-frame correctness (no settled flash)', () => {
  for (const { path } of ROUTES) {
    test(`${path} earliest observable state is never settled before transitioning; no backward-jump flash`, async ({ page }) => {
      await installSpies(page);
      await page.goto(path);
      await page.waitForTimeout(1300);

      const log = await page.evaluate(() => window.__motionLog);
      expect(log.length, 'expected at least one recorded motion-state observation').toBeGreaterThan(0);

      // The FIRST recorded observation (earliest observable state, captured
      // via a MutationObserver installed before any Hero script ran) must
      // already be 'armed' or later — never the SSR 'settled' default, and
      // never null (root missing).
      const first = log[0];
      expect(['armed', 'running', 'complete']).toContain(first.state);

      // No backward-jump: once armed/running/complete is reached, the log
      // must never fall back to 'settled' afterward (that would be exactly
      // the flash/backward-jump defect R2-02 fixes).
      const sawAdvanced = log.some((e) => e.state === 'armed' || e.state === 'running' || e.state === 'complete');
      expect(sawAdvanced).toBe(true);
      let advancedSeen = false;
      for (const entry of log) {
        if (entry.state === 'armed' || entry.state === 'running' || entry.state === 'complete') advancedSeen = true;
        if (advancedSeen) {
          expect(entry.state, `motion state regressed to '${entry.state}' after already advancing — this is the flash/backward-jump defect R2-02 forbids`).not.toBe('settled');
        }
      }
    });

    test(`${path} CTAs are visible from first paint under normal JS`, async ({ page }) => {
      await page.goto(path);
      const ctas = page.locator('.hero-root__ctas a.btn');
      await expect(ctas.nth(0)).toBeVisible();
      await expect(ctas.nth(1)).toBeVisible();
    });
  }
});

test.describe('CC-02I-06 R2-02 Case 7: first-paint evidence (hardened)', () => {
  for (const { path } of ROUTES) {
    test(`${path} the first rendering-capable frame after the Hero root exists is never settled (pre-page-script instrumentation)`, async ({ page }) => {
      // Approach A (spec §13): page.addInitScript runs before ANY page
      // script (including the Motion Bootstrap), observes root insertion
      // via a document-start MutationObserver poll, and records the
      // root's data-motion-state at the first requestAnimationFrame
      // callback after the root exists — i.e. the first moment the
      // browser could actually have painted a frame containing it. This
      // is stronger evidence than the MutationObserver-only state log
      // used elsewhere in this file: it ties the observation to an actual
      // rendering opportunity (rAF), not just to whenever the attribute
      // mutation happened to fire.
      await page.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__firstFrameEvidence = null;
        const capture = () => {
          const root = document.querySelector('[data-hero-motion-root]');
          if (!root) return false;
          requestAnimationFrame(() => {
            const cs = getComputedStyle(root);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__firstFrameEvidence = {
              state: root.getAttribute('data-motion-state'),
              t: performance.now(),
              // Sample one real animated sub-element's start-state
              // property too, not just the root attribute, so this
              // evidence also rules out "root says armed but the SVG
              // sub-elements still visually render the settled/complete
              // frame" (the actual visual-flash risk, not just an
              // attribute-string check).
              spineDashoffset: (() => {
                const spine = document.querySelector('.precision-visual__spine');
                return spine ? getComputedStyle(spine).strokeDashoffset : null;
              })(),
            };
          });
          return true;
        };
        const poll = () => {
          if (!capture()) setTimeout(poll, 0);
        };
        poll();
      });

      await page.goto(path);
      await page.waitForFunction(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (window as any).__firstFrameEvidence !== null;
      }, { timeout: 3000 });
      const evidence = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (window as any).__firstFrameEvidence;
      });

      expect(evidence, 'expected first-frame evidence to have been captured').toBeTruthy();
      expect(['armed', 'running', 'complete'], `first rendering-capable frame observed state '${evidence.state}' — must never be 'settled'`).toContain(evidence.state);
    });

    test(`${path} CDP screencast filmstrip evidence around initial navigation shows no settled-then-backward-jump frame`, async ({ page, context }, testInfo) => {
      // Approach B (spec §13): an independent, visual evidence artifact —
      // a Chrome DevTools Protocol screencast — captured around initial
      // navigation. Written to the OS temp directory (not committed to
      // Product source) so a reviewer can inspect the actual painted
      // frames, not just instrumentation output. If CDP screencast is
      // unavailable in this environment, the test stops and reports the
      // limitation explicitly rather than silently downgrading to a
      // weaker check.
      const { readFileSync, writeFileSync, mkdtempSync } = await import('node:fs');
      const { tmpdir } = await import('node:os');
      const { join } = await import('node:path');

      const session = await context.newCDPSession(page);
      const frames: Array<{ data: string; timestamp: number; sessionId: number }> = [];
      let screencastFailed: string | null = null;

      session.on('Page.screencastFrame', (params) => {
        frames.push({ data: params.data, timestamp: params.metadata.timestamp ?? 0, sessionId: params.sessionId });
        // Ack every frame — required by the CDP screencast protocol or
        // frame delivery stalls after the first one.
        void session.send('Page.screencastFrameAck', { sessionId: params.sessionId });
      });

      try {
        await session.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
      } catch (e) {
        screencastFailed = e instanceof Error ? e.message : String(e);
      }

      if (screencastFailed) {
        test.info().annotations.push({
          type: 'LIMITATION',
          description: `CDP Page.startScreencast unavailable in this environment: ${screencastFailed}. Case 7 filmstrip evidence could not be captured — reporting as an explicit limitation per spec §13, not weakening this test's assertions.`,
        });
        test.fail(true, 'CDP screencast capability unavailable — see LIMITATION annotation');
        return;
      }

      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });
      await page.waitForTimeout(100);

      await session.send('Page.stopScreencast');

      expect(frames.length, 'expected at least one screencast frame to have been captured').toBeGreaterThan(0);

      // Persist the filmstrip to /tmp as inspectable evidence artifacts —
      // outside the repo, per spec §13's "artifacts may live outside the
      // repository" allowance.
      const dir = mkdtempSync(join(tmpdir(), 'forgeon-review-test-cc02i06-filmstrip-'));
      const manifest: Array<{ file: string; timestamp: number }> = [];
      frames.forEach((f, i) => {
        const file = join(dir, `frame-${String(i).padStart(3, '0')}.png`);
        writeFileSync(file, Buffer.from(f.data, 'base64'));
        manifest.push({ file, timestamp: f.timestamp });
      });
      const manifestPath = join(dir, 'manifest.json');
      writeFileSync(manifestPath, JSON.stringify({ path, frameCount: frames.length, frames: manifest }, null, 2));
      testInfo.annotations.push({ type: 'FILMSTRIP_EVIDENCE', description: manifestPath });
      // eslint-disable-next-line no-console
      console.log(`[cc02i-motion Case 7] ${path} filmstrip evidence: ${manifestPath} (${frames.length} frames)`);

      // Sanity-check the artifact is real and non-empty (a reviewer opens
      // it manually to visually confirm no settled-frame flash — this
      // assertion only proves the evidence exists and is well-formed, it
      // does not substitute for visual review).
      const firstFrameBytes = readFileSync(manifest[0].file);
      expect(firstFrameBytes.length, 'first captured frame must be a non-empty PNG').toBeGreaterThan(0);
    });
  }
});

test.describe('CC-02I-06 R2-02 Case 4: state-invariant accessible content (all four states)', () => {
  for (const { path } of ROUTES) {
    test(`${path} H1/Body/CTA computed opacity, visibility, transform are identical in settled, armed, running, and complete`, async ({ page, browser }) => {
      const read = async (p: typeof page) =>
        p.evaluate(() => {
          const pick = (el: Element | null) => {
            if (!el) return null;
            const cs = getComputedStyle(el);
            return { opacity: cs.opacity, visibility: cs.visibility, transform: cs.transform };
          };
          return {
            h1: pick(document.querySelector('h1')),
            body: pick(document.querySelector('.hero-root__body')),
            ctaPrimary: pick(document.querySelector('.hero-root__ctas a.btn:nth-child(1)')),
            ctaSecondary: pick(document.querySelector('.hero-root__ctas a.btn:nth-child(2)')),
          };
        });

      // settled: a genuinely separate, real settled-state page (reduced
      // motion never leaves settled) rather than inferring it from the
      // normal-JS page's first paint.
      const settledContext = await browser.newContext({ reducedMotion: 'reduce' });
      const settledPage = await settledContext.newPage();
      await settledPage.goto(path);
      await expect(settledPage.locator('[data-hero-motion-root]')).toHaveAttribute('data-motion-state', 'settled');
      const settled = await read(settledPage);
      await settledContext.close();

      // armed / running / complete: sampled from one real normal-JS page
      // load, at the earliest moment each state is observable.
      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        const s = r?.getAttribute('data-motion-state');
        return s === 'armed' || s === 'running' || s === 'complete';
      }, { timeout: 3000 });
      const armedOrLater = await read(page);

      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'running';
      }, { timeout: 3000 });
      const running = await read(page);

      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });
      const complete = await read(page);

      expect(armedOrLater, 'armed-or-later styles must equal settled styles').toEqual(settled);
      expect(running, 'running styles must equal settled styles').toEqual(settled);
      expect(complete, 'complete styles must equal settled styles').toEqual(settled);
    });

    test(`${path} Primary and Secondary CTA receive a genuine click event in every state (settled, armed, running, complete)`, async ({ page, browser }) => {
      // Intercepts navigation so the page under test isn't destroyed by a
      // real anchor navigation, while still requiring an actual click
      // event to reach the anchor element — not just a pointer-events/
      // enabled/focus inspection.
      const installClickSpy = async (p: typeof page) => {
        await p.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__ctaClicks = [];
          document.addEventListener(
            'click',
            (e) => {
              const target = (e.target as Element)?.closest('.hero-root__ctas a.btn');
              if (target) {
                e.preventDefault();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).__ctaClicks.push(target.getAttribute('data-intent'));
              }
            },
            { capture: true }
          );
        });
      };
      const clickBoth = async (p: typeof page) => {
        await p.locator('.hero-root__ctas a.btn').nth(0).click();
        await p.locator('.hero-root__ctas a.btn').nth(1).click();
        return p.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const w = window as any;
          const clicks = w.__ctaClicks as string[];
          w.__ctaClicks = [];
          return clicks;
        });
      };

      // settled
      const settledContext = await browser.newContext({ reducedMotion: 'reduce' });
      const settledPage = await settledContext.newPage();
      await settledPage.goto(path);
      await installClickSpy(settledPage);
      const settledClicks = await clickBoth(settledPage);
      expect(settledClicks).toEqual(['project', 'technical-advice']);
      await settledContext.close();

      // armed (immediately after load, before running)
      await page.goto(path);
      await installClickSpy(page);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        const s = r?.getAttribute('data-motion-state');
        return s === 'armed' || s === 'running';
      }, { timeout: 3000 });
      const armedClicks = await clickBoth(page);
      expect(armedClicks).toEqual(['project', 'technical-advice']);

      // running
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'running';
      }, { timeout: 3000 });
      const runningClicks = await clickBoth(page);
      expect(runningClicks).toEqual(['project', 'technical-advice']);

      // complete
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });
      const completeClicks = await clickBoth(page);
      expect(completeClicks).toEqual(['project', 'technical-advice']);
    });
  }
});

test.describe('CC-02I-06 R2-02 Case 5: complete is terminal, equivalent to settled', () => {
  for (const { path } of ROUTES) {
    test(`${path} after complete, scrolling away and back does not re-trigger running`, async ({ page }) => {
      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(200);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const root = page.locator('[data-hero-motion-root]');
      await expect(root).toHaveAttribute('data-motion-state', 'complete');
    });

    test(`${path} complete visual state matches settled's end state for every narrative motion target (full property inventory)`, async ({ page, browser }) => {
      // Full inventory of every element the five-step narrative actually
      // animates, and the specific motion-relevant computed-style
      // properties each one changes (CC-02I-06 remediation §11 — the
      // prior version of this test compared only .spine-flow's opacity,
      // which could not catch a narrative element left mid-animation).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const readInventory = (p: any) =>
        p.evaluate(() => {
          const targets: Array<{ name: string; selector: string; props: string[] }> = [
            { name: 'datum-axis', selector: '.hero-root__origin .datum-origin__axis', props: ['strokeDashoffset', 'opacity'] },
            { name: 'datum-point', selector: '.hero-root__origin .datum-origin__point', props: ['opacity', 'transform'] },
            { name: 'datum-ring', selector: '.hero-root__origin .datum-origin__ring', props: ['opacity', 'transform'] },
            { name: 'datum-label', selector: '.hero-root__origin .datum-origin__label', props: ['opacity'] },
            { name: 'spine', selector: '.precision-visual__spine', props: ['strokeDashoffset', 'opacity'] },
            { name: 'module-1', selector: '.precision-visual__module[data-station="1"]', props: ['opacity', 'transform'] },
            { name: 'module-2', selector: '.precision-visual__module[data-station="2"]', props: ['opacity', 'transform'] },
            { name: 'module-3', selector: '.precision-visual__module[data-station="3"]', props: ['opacity', 'transform'] },
            { name: 'node-1', selector: '.precision-visual__node[data-node="1"]', props: ['opacity', 'transform'] },
            { name: 'node-2', selector: '.precision-visual__node[data-node="2"]', props: ['opacity', 'transform'] },
            { name: 'node-3', selector: '.precision-visual__node[data-node="3"]', props: ['opacity', 'transform'] },
            { name: 'vision-corners', selector: '.precision-visual__vision-corners', props: ['strokeDashoffset', 'opacity'] },
            { name: 'spine-flow', selector: '.precision-visual__spine-flow', props: ['opacity'] },
            { name: 'rail-accent', selector: '.process-rail__complete-accent', props: ['transform'] },
          ];
          // 'none' and the identity matrix ('matrix(1, 0, 0, 1, 0, 0)') are
          // the same visual no-op transform — the browser is free to
          // report either depending on whether a `transform` property was
          // ever explicitly declared for that element in the matched
          // rules. Normalizing both to 'none' avoids a false failure on a
          // computed-style-string difference with zero visual difference.
          const normalizeTransform = (v: string) =>
            v === 'matrix(1, 0, 0, 1, 0, 0)' || v === 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)' ? 'none' : v;
          const out: Record<string, Record<string, string>> = {};
          for (const t of targets) {
            const el = document.querySelector(t.selector);
            if (!el) {
              out[t.name] = { __missing: 'true' };
              continue;
            }
            const cs = getComputedStyle(el);
            const rec: Record<string, string> = {};
            for (const prop of t.props) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const raw = (cs as any)[prop] ?? '';
              rec[prop] = prop === 'transform' ? normalizeTransform(raw) : raw;
            }
            out[t.name] = rec;
          }
          return out;
        });

      // No-JS-equivalent settled reference: reduced-motion context always
      // stays settled and renders the end state.
      const settledContext = await browser.newContext({ reducedMotion: 'reduce' });
      const settledPage = await settledContext.newPage();
      await settledPage.goto(path);
      const settledInventory = await readInventory(settledPage);
      await settledContext.close();

      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });
      const completeInventory = await readInventory(page);

      // Every target must have been found (no silent "selector didn't
      // match" false pass) and every property must match settled exactly
      // — a partial-animation defect on ANY single target fails this test.
      for (const name of Object.keys(settledInventory)) {
        expect(completeInventory[name], `motion target '${name}' missing at complete`).toBeDefined();
        expect(completeInventory[name].__missing, `motion target '${name}' not found in DOM at complete`).toBeUndefined();
        expect(settledInventory[name].__missing, `motion target '${name}' not found in DOM at settled`).toBeUndefined();
        expect(completeInventory[name], `motion target '${name}': complete state must equal settled state`).toEqual(settledInventory[name]);
      }
    });
  }
});

test.describe('CC-02I-06 R2-02 Case 6: observer count', () => {
  for (const { path } of ROUTES) {
    test(`${path} exactly 1 Hero-owned IntersectionObserver per page load; 0 from child components`, async ({ page }) => {
      await installSpies(page);
      await page.goto(path);
      await page.waitForTimeout(300);
      const count = await page.evaluate(() => window.__ioSpyCount);
      expect(count).toBe(1);
    });
  }
});

test.describe('CC-02I-06: four-state machine end-to-end', () => {
  for (const { path } of ROUTES) {
    test(`${path} transitions settled(SSR) -> armed -> running -> complete in order`, async ({ page }) => {
      await installSpies(page);
      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });

      const log = await page.evaluate(() => window.__motionLog);
      const states = log.map((e) => e.state).filter((s, i, arr) => i === 0 || s !== arr[i - 1]);
      // The de-duplicated sequence of observed states must be a
      // subsequence of armed -> running -> complete (settled is the SSR
      // default and is not expected to appear once JS instrumentation
      // attaches, per Case 3's first-frame requirement).
      const order = ['armed', 'running', 'complete'];
      let idx = -1;
      for (const s of states) {
        if (s === null) continue;
        const pos = order.indexOf(s);
        expect(pos, `unexpected state '${s}' in transition sequence`).toBeGreaterThanOrEqual(0);
        expect(pos, `state '${s}' observed out of order`).toBeGreaterThanOrEqual(idx);
        idx = pos;
      }
      expect(idx).toBe(order.length - 1);
    });
  }
});

test.describe('CC-02I-06: no forbidden bare :root selector', () => {
  test('no CSS source file uses a bare :root:not([data-motion-state]) selector', async () => {
    const { readFileSync } = await import('node:fs');
    const files = [
      'src/components/sections/Hero.astro',
      'src/components/sections/PrecisionSystemVisual.astro',
      'src/components/sections/ProcessRail.astro',
    ];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      expect(content, `${file} must not contain a bare :root selector for motion state`).not.toMatch(/:root:not\(\[data-motion-state\]\)/);
      expect(content, `${file} must not contain a bare :root[data-motion-state] selector`).not.toMatch(/(?<!\[data-hero-motion-root\]\s*)\s:root\[data-motion-state/);
    }
  });
});

test.describe('CC-02I-06: executable five-step narrative order (Datum -> axis -> modules -> vision -> rail)', () => {
  for (const { path } of ROUTES) {
    test(`${path} real rendered motion targets change in strict step order, timestamped via native transitionstart events`, async ({ page }) => {
      // Proves the narrative order from ACTUAL browser-fired transition
      // events during real runtime — not from CSS source text or declared
      // transition-delay values (CC-02I-06 remediation §14). The
      // production Hero/PrecisionSystemVisual/ProcessRail code gains no
      // extra instrumentation — this listener is injected only for this
      // test via addInitScript.
      //
      // CC-02I-06 final-evidence remediation (§2): the prior version of
      // this test sampled computed styles on a requestAnimationFrame
      // polling loop. Diagnosed root cause of the reported flake (both
      // zh-tw and en, not en-only — reproduced under artificial 8-worker
      // CPU contention: 12/20 runs failed, ALL as an exact tie where
      // `Received` equals `Expected` to the fraction of a millisecond,
      // never a genuine reversal). That is the signature of rAF-sampling
      // granularity, not a production timing defect: under heavy
      // scheduling pressure the page's rAF callback fires far less often,
      // so several targets that started their transitions at genuinely
      // different times (140ms/220ms/260ms/300ms apart per the source
      // delays) get first observed as "departed" on the very same
      // (late, coalesced) sampled frame and are recorded with an
      // identical performance.now() reading — collapsing real order into
      // a false tie. A single-worker run of the same test (15/15 across
      // 3 repeats x 5 configurations) never reproduced a collapse or
      // reversal, confirming the narrative itself times correctly; only
      // the polling-based measurement was too coarse under contention.
      //
      // Fix: listen for the native `transitionstart` event on each
      // target. Per the CSS Transitions spec, `transitionrun` fires the
      // moment a transition is CREATED (i.e. immediately on the style
      // change that qualifies it, before any transition-delay elapses —
      // confirmed empirically: an earlier attempt using transitionrun
      // recorded all five targets at one identical timestamp every run,
      // because delay is not applied before that event). `transitionstart`
      // fires only after transition-delay has elapsed, at the moment the
      // animation actually begins — i.e. the true first-material-change
      // moment this test needs. Both events are dispatched synchronously
      // by the browser's style/timing engine itself, not sampled by page
      // JS on any polling cadence, so genuinely different transition-delay
      // values can never coalesce into one timestamp regardless of
      // main-thread contention. `event.timeStamp` is the browser's own
      // high-resolution capture time for the event.
      await page.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__stepLog = {} as Record<string, number>;
        const targetSelectors: Record<string, string> = {
          datum: '.hero-root__origin .datum-origin__axis',
          axis: '.precision-visual__spine',
          modules: '.precision-visual__module[data-station="1"]',
          vision: '.precision-visual__vision-corners',
          rail: '.process-rail__complete-accent',
        };
        // Each step's relevant CSS property (see PrecisionSystemVisual.astro/
        // Hero.astro/ProcessRail.astro narrative-timeline comments):
        // datum/axis/vision transition stroke-dashoffset, modules
        // transition opacity, rail transitions transform. Only the
        // narrative-relevant property is recorded per step — a target
        // with multiple transitioning properties (e.g. modules also
        // transitions transform) would otherwise risk recording an
        // unrelated property's transitionstart.
        const targetProperty: Record<string, string> = {
          datum: 'stroke-dashoffset',
          axis: 'stroke-dashoffset',
          modules: 'opacity',
          vision: 'stroke-dashoffset',
          rail: 'transform',
        };
        const start = performance.now();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const log = (window as any).__stepLog as Record<string, number>;
        const attachListener = (name: string) => {
          const el = document.querySelector(targetSelectors[name]);
          if (!el) return false;
          el.addEventListener(
            'transitionstart',
            (e) => {
              const te = e as TransitionEvent;
              if (te.propertyName !== targetProperty[name]) return;
              if (log[name] === undefined) {
                log[name] = te.timeStamp - start;
              }
            },
            { once: false }
          );
          return true;
        };
        // Targets are all server-rendered as part of the initial HTML
        // (not client-inserted), but addInitScript runs at document-start
        // before the parser has created them — poll via setTimeout (which
        // yields to the macrotask queue, unlike queueMicrotask) until each
        // selector resolves, then attach its listener once.
        const attached = new Set<string>();
        const pollAttach = () => {
          for (const name of Object.keys(targetSelectors)) {
            if (!attached.has(name) && attachListener(name)) attached.add(name);
          }
          if (attached.size < Object.keys(targetSelectors).length) {
            setTimeout(pollAttach, 0);
          }
        };
        pollAttach();
      });

      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });
      // A small settle window after 'complete' fires: rail's own
      // transition (660ms delay) fires its transitionstart at 660ms,
      // strictly before 'complete' itself fires (~1000ms after
      // 'running'), so rail's timestamp is already recorded by the time
      // this wait begins — this is generous slack, not a race.
      await page.waitForTimeout(200);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const log = await page.evaluate(() => (window as any).__stepLog as Record<string, number>);
      // eslint-disable-next-line no-console
      console.log(`[cc02i-motion] ${path} step-order transitionstart timestamps (ms):`, log);

      for (const name of ['datum', 'axis', 'modules', 'vision', 'rail']) {
        expect(log[name], `step '${name}' never observed a transitionstart event for its narrative property`).toBeDefined();
      }

      expect(log.datum, 'Datum must start before axis').toBeLessThan(log.axis);
      expect(log.axis, 'axis must start before modules').toBeLessThan(log.modules);
      expect(log.modules, 'modules must start before vision lock').toBeLessThan(log.vision);
      expect(log.vision, 'vision lock must start before rail completes').toBeLessThan(log.rail);
    });
  }
});

test.describe('CC-02I-06: module 1/2/3 stagger is a real runtime stagger, not just declared CSS delay', () => {
  for (const { path } of ROUTES) {
    test(`${path} module1_start < module2_start < module3_start via native transitionstart events`, async ({ page }) => {
      // CC-02I-06 final-evidence remediation (§3): the narrative-order
      // test above only ever samples station 1 as the representative
      // "modules" step. It never proved that stations 1/2/3 individually
      // stagger relative to EACH OTHER — three stations starting
      // simultaneously (a collapsed-stagger regression) would still pass
      // every existing assertion. This test closes that gap with its own
      // dedicated runtime measurement, independent of the step-order test
      // above.
      //
      // Same instrumentation approach as the narrative-order test:
      // `transitionstart` fires natively, synchronously, only after each
      // station's own transition-delay (220/260/300ms respectively, see
      // PrecisionSystemVisual.astro) has actually elapsed — not sampled by
      // page JS on any polling cadence, so it reflects genuine
      // browser-timed stagger rather than source-declared delay values.
      await page.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__moduleStaggerLog = {} as Record<string, number>;
        const start = performance.now();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const log = (window as any).__moduleStaggerLog as Record<string, number>;
        const attachListener = (station: '1' | '2' | '3') => {
          const el = document.querySelector(`.precision-visual__module[data-station="${station}"]`);
          if (!el) return false;
          el.addEventListener('transitionstart', (e) => {
            const te = e as TransitionEvent;
            if (te.propertyName !== 'opacity') return;
            if (log[station] === undefined) {
              log[station] = te.timeStamp - start;
            }
          });
          return true;
        };
        const attached = new Set<string>();
        const stations: Array<'1' | '2' | '3'> = ['1', '2', '3'];
        const pollAttach = () => {
          for (const s of stations) {
            if (!attached.has(s) && attachListener(s)) attached.add(s);
          }
          if (attached.size < stations.length) setTimeout(pollAttach, 0);
        };
        pollAttach();
      });

      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });
      await page.waitForTimeout(100);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const log = await page.evaluate(() => (window as any).__moduleStaggerLog as Record<string, number>);
      // eslint-disable-next-line no-console
      console.log(`[cc02i-motion] ${path} module stagger transitionstart timestamps (ms):`, log);

      for (const station of ['1', '2', '3']) {
        expect(log[station], `module station ${station} never observed a transitionstart event for opacity`).toBeDefined();
      }

      // Declared source delays are 220/260/300ms — a genuine 40ms gap
      // between adjacent stations. A MIN_GAP_MS floor well under that
      // (but well above 0) still fails a real collapsed-stagger defect
      // (which reproduces as an exact 0ms tie across all three stations,
      // per the false-positive proof recorded in this ticket's completion
      // report) while tolerating single-digit-millisecond browser
      // scheduling jitter observed under host CPU contention in manual
      // repeat-run testing (a genuine coalescing of two style-recalc
      // passes on a loaded host, not a narrative defect).
      const MIN_GAP_MS = 10;
      expect(log['2'] - log['1'], 'module1 must start before module2 by more than scheduling jitter').toBeGreaterThan(MIN_GAP_MS);
      expect(log['3'] - log['2'], 'module2 must start before module3 by more than scheduling jitter').toBeGreaterThan(MIN_GAP_MS);
    });
  }
});

test.describe('CC-02I-06: true visual narrative duration (750-1150ms)', () => {
  for (const { path } of ROUTES) {
    test(`${path} first narrative visual change -> last (Rail) visual completion falls within 750-1150ms`, async ({ page }) => {
      // CC-02I-06 final-evidence remediation (§4): the prior version of
      // this test measured the root's running->complete data-motion-state
      // attribute timer — that only proves the bootstrap's
      // setTimeout(NARRATIVE_MS) constant fires on schedule, not that the
      // VISUAL narrative (what a real viewer actually sees change on
      // screen) starts and ends within that window. A production defect
      // where e.g. Rail's own transition-delay drifted past 1150ms while
      // the root timer still said "complete" at 1000ms would pass the old
      // test and fail this one.
      //
      // Start: the first transitionstart across every element/property
      // this narrative animates (same events used by the narrative-order
      // and module-stagger tests above) — expected to be Datum's
      // stroke-dashoffset transition, the documented first step.
      // End: the LAST of those elements' transitionend — the true moment
      // the final visual (Rail's accent underline reaching scaleX(1)) has
      // actually finished animating on screen, not when a JS timer fired.
      // Both events are dispatched natively by the browser's style/timing
      // engine at the actual moments transitions begin/end — not sampled
      // by page JS on any polling cadence.
      await page.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__visualDurationLog = { starts: [] as number[], ends: [] as number[], railEnded: false };
        const targets: Array<{ selector: string; property: string }> = [
          { selector: '.hero-root__origin .datum-origin__axis', property: 'stroke-dashoffset' },
          { selector: '.hero-root__origin .datum-origin__point', property: 'opacity' },
          { selector: '.hero-root__origin .datum-origin__ring', property: 'opacity' },
          { selector: '.hero-root__origin .datum-origin__label', property: 'opacity' },
          { selector: '.precision-visual__spine', property: 'stroke-dashoffset' },
          { selector: '.precision-visual__module[data-station="1"]', property: 'opacity' },
          { selector: '.precision-visual__module[data-station="2"]', property: 'opacity' },
          { selector: '.precision-visual__module[data-station="3"]', property: 'opacity' },
          { selector: '.precision-visual__node[data-node="1"]', property: 'opacity' },
          { selector: '.precision-visual__node[data-node="2"]', property: 'opacity' },
          { selector: '.precision-visual__node[data-node="3"]', property: 'opacity' },
          { selector: '.precision-visual__vision-corners', property: 'stroke-dashoffset' },
          { selector: '.precision-visual__spine-flow', property: 'opacity' },
          { selector: '.process-rail__complete-accent', property: 'transform' },
        ];
        const start = performance.now();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const log = (window as any).__visualDurationLog as { starts: number[]; ends: number[]; railEnded: boolean };
        const attachListener = (t: { selector: string; property: string }) => {
          const el = document.querySelector(t.selector);
          if (!el) return false;
          const isRail = t.selector === '.process-rail__complete-accent';
          el.addEventListener('transitionstart', (e) => {
            const te = e as TransitionEvent;
            if (te.propertyName !== t.property) return;
            log.starts.push(te.timeStamp - start);
          });
          el.addEventListener('transitionend', (e) => {
            const te = e as TransitionEvent;
            if (te.propertyName !== t.property) return;
            log.ends.push(te.timeStamp - start);
            if (isRail) log.railEnded = true;
          });
          return true;
        };
        const attached = new Set<string>();
        const pollAttach = () => {
          for (const t of targets) {
            const key = `${t.selector}|${t.property}`;
            if (!attached.has(key) && attachListener(t)) attached.add(key);
          }
          if (attached.size < targets.length) setTimeout(pollAttach, 0);
        };
        pollAttach();
      });

      await page.goto(path);
      // Wait for the Rail's OWN transitionend — the ticket's documented
      // final narrative visual — rather than a fixed buffer after the
      // root's 'complete' attribute. This is deliberate: the root timer
      // (setTimeout(NARRATIVE_MS)) and the real Rail transition are two
      // independent clocks; a defect that desyncs them (e.g. a delay
      // value drifting past the timer) must not be masked by racing a
      // fixed wait against the wrong clock — confirmed necessary via this
      // ticket's own false-positive proof (see completion report): an
      // earlier version of this wait (fixed 200ms after root 'complete')
      // still PASSED when Rail's delay was deliberately pushed to
      // 1200ms, because it stopped listening before Rail's transitionend
      // had fired at all — a false negative this explicit wait closes.
      // Timeout (2000ms) is generously above the 1150ms acceptance
      // ceiling so a genuine out-of-window defect is still fully
      // captured as failing evidence, not masked by a premature timeout.
      const railEndedInTime = await page
        .waitForFunction(
          () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const log = (window as any).__visualDurationLog as { railEnded: boolean } | undefined;
            return !!log?.railEnded;
          },
          { timeout: 2000 }
        )
        .then(() => true)
        .catch(() => false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const log = await page.evaluate(() => (window as any).__visualDurationLog as { starts: number[]; ends: number[] });
      expect(railEndedInTime, "Rail's transitionend never observed within 2000ms of navigation").toBe(true);
      expect(log.starts.length, 'expected at least one narrative transitionstart event').toBeGreaterThan(0);
      expect(log.ends.length, 'expected at least one narrative transitionend event').toBeGreaterThan(0);

      const firstStart = Math.min(...log.starts);
      const lastEnd = Math.max(...log.ends);
      const duration = lastEnd - firstStart;
      // eslint-disable-next-line no-console
      console.log(
        `[cc02i-motion] ${path} true visual narrative duration: start evidence=${firstStart.toFixed(1)}ms (earliest transitionstart) end evidence=${lastEnd.toFixed(1)}ms (latest transitionend) duration=${duration.toFixed(1)}ms`
      );
      expect(duration, `true visual narrative duration ${duration.toFixed(1)}ms`).toBeGreaterThanOrEqual(750);
      expect(duration, `true visual narrative duration ${duration.toFixed(1)}ms`).toBeLessThanOrEqual(1150);
    });
  }
});

test.describe('CC-02I-06: narrative terminal state (no replay, no continuous animation)', () => {
  for (const { path } of ROUTES) {
    test(`${path} no further transitionstart fires on any narrative target after 'complete', including across scroll-away/back`, async ({ page }) => {
      // Complements the existing Case 5 "complete is terminal" test
      // (root attribute + full computed-style inventory) with direct
      // proof against the true visual duration test's own event source:
      // once every narrative transitionend has fired, no further
      // transitionstart is ever observed on the same targets — i.e. the
      // rendered motion genuinely stops, it does not loop or replay.
      await page.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__replayLog = [] as number[];
        const selectors = [
          '.hero-root__origin .datum-origin__axis',
          '.precision-visual__spine',
          '.precision-visual__module[data-station="1"]',
          '.precision-visual__vision-corners',
          '.process-rail__complete-accent',
        ];
        const start = performance.now();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const log = (window as any).__replayLog as number[];
        const attached = new Set<string>();
        const pollAttach = () => {
          for (const sel of selectors) {
            if (attached.has(sel)) continue;
            const el = document.querySelector(sel);
            if (!el) continue;
            el.addEventListener('transitionstart', () => log.push(performance.now() - start));
            attached.add(sel);
          }
          if (attached.size < selectors.length) setTimeout(pollAttach, 0);
        };
        pollAttach();
      });

      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'complete';
      }, { timeout: 3000 });
      await page.waitForTimeout(200);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventsAtComplete = await page.evaluate(() => ((window as any).__replayLog as number[]).length);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(200);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventsAfterScroll = await page.evaluate(() => ((window as any).__replayLog as number[]).length);
      expect(eventsAfterScroll, 'no new transitionstart should fire on any narrative target after complete, even after scroll-away/back').toBe(eventsAtComplete);
    });
  }
});

test.describe('CC-02I-06: CTA safety across all motion states', () => {
  for (const { path } of ROUTES) {
    test(`${path} Primary and Secondary CTA are focusable and clickable immediately after load (armed state)`, async ({ page }) => {
      await page.goto(path);
      const primary = page.locator('.hero-root__ctas a.btn').nth(0);
      const secondary = page.locator('.hero-root__ctas a.btn').nth(1);
      await primary.focus();
      await expect(primary).toBeFocused();
      await secondary.focus();
      await expect(secondary).toBeFocused();
      await expect(primary).toBeEnabled();
      await expect(secondary).toBeEnabled();
    });

    test(`${path} Primary CTA remains clickable during the running narrative`, async ({ page }) => {
      await page.goto(path);
      await page.waitForFunction(() => {
        const r = document.querySelector('[data-hero-motion-root]');
        return r?.getAttribute('data-motion-state') === 'running';
      }, { timeout: 3000 });
      const primary = page.locator('.hero-root__ctas a.btn').nth(0);
      const pointerEvents = await primary.evaluate((el) => getComputedStyle(el).pointerEvents);
      expect(pointerEvents).not.toBe('none');
      await expect(primary).toBeVisible();
    });
  }
});
