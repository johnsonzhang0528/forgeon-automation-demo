#!/usr/bin/env node
/**
 * Scans every built dist/**\/*.html page and asserts exactly one <h1> per
 * "real content page". Two categories of page are excluded from the
 * one-H1 rule, and the reason is documented inline (spec P0.2 requirement):
 *
 * 1. The root locale-redirect page (dist/index.html). It carries no visible
 *    content of its own — it exists purely to bounce the visitor to
 *    /zh-tw/ or /en/ via <meta http-equiv="refresh"> + a JS
 *    location.replace() fallback, and intentionally has zero headings.
 * 2. The root-level 404 fallback (dist/404.html, from src/pages/404.astro).
 *    Same shape as #1: a bare <meta http-equiv="refresh"> to /zh-tw/404,
 *    used only when a request can't be matched to any locale segment at
 *    all. The real, content-bearing 404 pages are dist/zh-tw/404/index.html
 *    and dist/en/404/index.html, which DO have an <h1> and are NOT
 *    excluded — only this locale-less redirect shim is skipped.
 * 3. robots.txt / sitemap.xml are not HTML at all and are naturally
 *    excluded by the *.html glob; listed here only for documentation.
 *
 * Every other HTML file in dist/, including both locales' 404 pages, is
 * treated as a real content page and must have exactly one <h1>.
 *
 * Usage: node scripts/check-h1.mjs   (run after `astro build`)
 * Exit code 0 = all pages pass. Exit code 1 = at least one failure.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));

const EXCLUDED_RELATIVE_PATHS = new Set([
  'index.html', // root locale-redirect page — see file header
  '404.html', // root locale-less 404 redirect shim — see file header
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function countH1(html) {
  const matches = html.match(/<h1[\s>]/gi);
  return matches ? matches.length : 0;
}

async function main() {
  const files = await walk(DIST_DIR);
  if (files.length === 0) {
    console.error(`No HTML files found under ${DIST_DIR} — did you run "astro build" first?`);
    process.exit(1);
  }

  let passCount = 0;
  let failCount = 0;
  let excludedCount = 0;
  const failures = [];

  for (const file of files.sort()) {
    const rel = relative(DIST_DIR, file);
    if (EXCLUDED_RELATIVE_PATHS.has(rel)) {
      excludedCount++;
      continue;
    }
    const html = await readFile(file, 'utf-8');
    const h1Count = countH1(html);
    if (h1Count === 1) {
      passCount++;
    } else {
      failCount++;
      failures.push({ rel, h1Count });
    }
  }

  console.log(`H1 check: ${files.length} HTML files scanned, ${excludedCount} excluded (redirect pages), ${passCount} pass, ${failCount} fail.\n`);

  if (failures.length > 0) {
    console.log('Failures (path — h1 count found):');
    for (const f of failures) {
      console.log(`  ${f.rel} — ${f.h1Count}`);
    }
  }

  process.exit(failCount === 0 ? 0 : 1);
}

main();
