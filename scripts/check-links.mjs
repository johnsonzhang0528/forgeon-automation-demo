#!/usr/bin/env node
/**
 * Scans every built dist/**\/*.html file, extracts internal <a href> and
 * asset (img/link/script src/href) references, and verifies each resolves
 * to a real file (or directory with index.html) inside dist/. External
 * (http/https/mailto/tel) links and hash-only anchors are skipped. Run
 * after `astro build`.
 *
 * Usage: node scripts/check-links.mjs
 * Exit 0 = no broken internal links. Exit 1 = at least one broken link.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));

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

function extractLinks(html) {
  const links = [];
  const hrefRe = /\shref="([^"]+)"/g;
  const srcRe = /\ssrc="([^"]+)"/g;
  let m;
  while ((m = hrefRe.exec(html))) links.push(m[1]);
  while ((m = srcRe.exec(html))) links.push(m[1]);
  return links;
}

function isSkippable(link) {
  if (!link) return true;
  if (link.startsWith('#')) return true;
  if (link.startsWith('mailto:')) return true;
  if (link.startsWith('tel:')) return true;
  if (link.startsWith('http://') || link.startsWith('https://')) return true;
  if (link.startsWith('//')) return true;
  if (link.startsWith('data:')) return true;
  return false;
}

async function resolveTarget(link, fromFile) {
  // Strip hash/query for filesystem resolution.
  const clean = link.split('#')[0].split('?')[0];
  if (clean === '') return true; // pure hash link, already skipped upstream but just in case

  let targetPath;
  if (clean.startsWith('/')) {
    targetPath = join(DIST_DIR, clean);
  } else {
    targetPath = resolve(dirname(fromFile), clean);
  }

  try {
    const s = await stat(targetPath);
    if (s.isDirectory()) {
      await stat(join(targetPath, 'index.html'));
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const files = await walk(DIST_DIR);
  if (files.length === 0) {
    console.error(`No HTML files found under ${DIST_DIR} — did you run "astro build" first?`);
    process.exit(1);
  }

  let totalLinks = 0;
  let brokenCount = 0;
  const broken = [];

  for (const file of files.sort()) {
    const html = await readFile(file, 'utf-8');
    const links = extractLinks(html);
    for (const link of links) {
      if (isSkippable(link)) continue;
      totalLinks++;
      const ok = await resolveTarget(link, file);
      if (!ok) {
        brokenCount++;
        broken.push({ file: relative(DIST_DIR, file), link });
      }
    }
  }

  console.log(`Link check: ${files.length} HTML files scanned, ${totalLinks} internal links checked, ${brokenCount} broken.\n`);
  if (broken.length > 0) {
    console.log('Broken links (source file — target):');
    for (const b of broken) console.log(`  ${b.file} — ${b.link}`);
  }

  process.exit(brokenCount === 0 ? 0 : 1);
}

main();
