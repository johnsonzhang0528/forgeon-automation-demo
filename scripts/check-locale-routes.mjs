#!/usr/bin/env node
/**
 * Build-time Locale Route Map check (spec §4.3 / SEO section).
 *
 * Background: switchLocalePath() (src/utils/i18n.ts) blindly swaps the
 * locale segment of a path and falls back to that locale's homepage if the
 * target doesn't exist — it never actually verifies the target page is
 * real. Whether that can produce a broken hreflang/language-switch link
 * depends on the content model:
 *
 * - solutions / products / industries content collections store BOTH
 *   locales' fields in one frontmatter object ({ 'zh-tw': ..., en: ... }),
 *   so every entrySlug that exists in one locale exists in the other by
 *   construction — switchLocalePath can't 404 for these.
 * - insights is the one collection stored as per-locale files
 *   (insights/zh-tw/<slug>.md, insights/en/<slug>.md) paired by
 *   `entrySlug`. Nothing enforces that both files exist for every slug —
 *   an editor could add insights/zh-tw/new-post.md without the matching
 *   insights/en/new-post.md, and BaseLayout's otherLocalePath prop for
 *   that detail page would then point at a hreflang / language-switch
 *   target with no corresponding built page.
 *
 * This script reads both dist/zh-tw/insights/*\/index.html and
 * dist/en/insights/*\/index.html (post-build, so it reflects what was
 * actually generated), and cross-checks:
 *   1. Every zh-tw insights slug has a matching en slug and vice versa.
 *   2. Every built page's hreflang="zh-Hant-TW"/"en" <link> targets a path
 *      that actually exists as a built HTML file in dist/.
 *
 * Usage: node scripts/check-locale-routes.mjs   (run after `astro build`)
 */
import { readdir, readFile, access } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));

async function listSlugs(localeDir) {
  try {
    const entries = await readdir(join(DIST_DIR, localeDir, 'insights'), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function pathExists(urlPath) {
  // urlPath like "/zh-tw/insights/foo/" -> dist/zh-tw/insights/foo/index.html
  const clean = urlPath.replace(/^\//, '').replace(/\/$/, '');
  const candidate = join(DIST_DIR, clean, 'index.html');
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkHtml(full)));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

async function main() {
  const zhSlugs = await listSlugs('zh-tw');
  const enSlugs = await listSlugs('en');
  const zhSet = new Set(zhSlugs);
  const enSet = new Set(enSlugs);

  const missingInEn = zhSlugs.filter((s) => !enSet.has(s));
  const missingInZh = enSlugs.filter((s) => !zhSet.has(s));

  console.log(`Insights entrySlug parity: ${zhSlugs.length} zh-tw slugs, ${enSlugs.length} en slugs.`);
  if (missingInEn.length > 0) console.log(`  Missing en/ counterpart for: ${missingInEn.join(', ')}`);
  if (missingInZh.length > 0) console.log(`  Missing zh-tw/ counterpart for: ${missingInZh.join(', ')}`);
  if (missingInEn.length === 0 && missingInZh.length === 0) {
    console.log('  OK — every insights slug has both locale versions built.');
  }

  // hreflang target existence check across ALL built pages, not just insights.
  const allHtml = await walkHtml(DIST_DIR);
  let hreflangChecked = 0;
  const hreflangBroken = [];
  for (const file of allHtml) {
    const html = await readFile(file, 'utf-8');
    const matches = [...html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"\s*\/?>/g)];
    for (const m of matches) {
      let href = m[1];
      // href is absolute (https://site/...); strip origin to get the path.
      try {
        href = new URL(href).pathname;
      } catch {
        // already a path
      }
      hreflangChecked++;
      const exists = await pathExists(href);
      if (!exists) {
        hreflangBroken.push({ file: relative(DIST_DIR, file), href });
      }
    }
  }

  console.log(`\nhreflang target check: ${hreflangChecked} hreflang links checked across ${allHtml.length} pages, ${hreflangBroken.length} broken.`);
  if (hreflangBroken.length > 0) {
    for (const b of hreflangBroken) console.log(`  ${b.file} -> ${b.href}`);
  }

  const failed = missingInEn.length > 0 || missingInZh.length > 0 || hreflangBroken.length > 0;
  process.exit(failed ? 1 : 0);
}

main();
