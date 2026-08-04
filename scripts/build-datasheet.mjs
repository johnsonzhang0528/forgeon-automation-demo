#!/usr/bin/env node
/**
 * Builds public/documents/forgeon-axm-400-datasheet.pdf from
 * scripts/datasheet-template.html using Playwright's page.pdf() (spec
 * P0.6). This reuses the already-installed Playwright/Chromium instead of
 * adding pdf-lib/pdfkit, guarantees syntactically valid, text-selectable
 * output, and lets the datasheet share the site's actual design tokens
 * (colors/type) by hand-porting them into the template's inline <style>
 * (Playwright's page.pdf() renders a standalone HTML file, not the live
 * Astro site, so token values are copied rather than imported).
 *
 * Usage: node scripts/build-datasheet.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, 'datasheet-template.html');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'documents');
const OUTPUT_PATH = join(OUTPUT_DIR, 'forgeon-axm-400-datasheet.pdf');

// Cover page hero diagram: abstract line-art representing a linear module +
// carriage, consistent with the site's stroke-based SVG icon language
// (see src/components/ui/ProductGlyph.astro) — original vector art, not a
// generated/photographic image, so there is no licensing question and no
// risk of AI-generated text artifacts inside the graphic.
const COVER_DIAGRAM = `
<svg width="380" height="140" viewBox="0 0 380 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="340" height="24" rx="4" fill="#2a323c" stroke="#c06f39" stroke-width="1.2"/>
  ${Array.from({ length: 16 }).map((_, i) => `<circle cx="${38 + i * 20}" cy="92" r="1.6" fill="#c06f39"/>`).join('')}
  <rect x="150" y="52" width="80" height="56" rx="6" fill="#f7f5f1" stroke="#f7f5f1" stroke-width="2"/>
  <rect x="170" y="70" width="40" height="20" rx="3" fill="#c06f39"/>
  <rect x="10" y="108" width="360" height="10" rx="2" fill="#12181f" stroke="#5b6470" stroke-width="1"/>
  <text x="190" y="132" font-family="JetBrains Mono, monospace" font-size="9" fill="#9aa3ad" text-anchor="middle">AXM-400 · LINEAR MODULE · CONCEPT DIAGRAM</text>
</svg>`;

// Structural diagram for page 3: labeled cross-section-style schematic
// (still abstract line art, not a claimed engineering drawing).
const STRUCTURE_DIAGRAM = `
<svg width="100%" height="180" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="120" width="300" height="18" rx="3" fill="#e2e0da" stroke="#5b6470" stroke-width="1.2"/>
  ${Array.from({ length: 12 }).map((_, i) => `<circle cx="${28 + i * 24}" cy="129" r="1.4" fill="#5b6470"/>`).join('')}
  <rect x="120" y="90" width="60" height="40" rx="4" fill="#ffffff" stroke="#12181f" stroke-width="1.6"/>
  <rect x="138" y="104" width="24" height="12" rx="2" fill="#a34c1f"/>
  <rect x="8" y="142" width="304" height="10" rx="2" fill="#2a323c"/>
  <line x1="150" y1="90" x2="150" y2="30" stroke="#636b75" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="150" y="22" font-family="JetBrains Mono, monospace" font-size="9" fill="#636b75" text-anchor="middle">CARRIAGE / 滑座</text>
  <line x1="30" y1="129" x2="30" y2="170" stroke="#636b75" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="30" y="182" font-family="JetBrains Mono, monospace" font-size="9" fill="#636b75" text-anchor="middle">SCREW / 螺桿</text>
  <line x1="290" y1="129" x2="290" y2="170" stroke="#636b75" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="290" y="182" font-family="JetBrains Mono, monospace" font-size="9" fill="#636b75" text-anchor="middle">RAIL / 導軌</text>
</svg>`;

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let html = await readFile(TEMPLATE_PATH, 'utf-8');
  html = html.replace('{{COVER_DIAGRAM}}', COVER_DIAGRAM);
  html = html.replace('{{STRUCTURE_DIAGRAM}}', STRUCTURE_DIAGRAM);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }

  console.log(`Datasheet written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
