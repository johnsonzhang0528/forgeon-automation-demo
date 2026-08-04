This directory holds downloadable documents referenced by product detail
pages.

forgeon-axm-400-datasheet.pdf is a real, 6-page, text-selectable PDF
generated from scripts/datasheet-template.html via Playwright's
page.pdf() (see scripts/build-datasheet.mjs). It follows the site's actual
design tokens and contains only demo/fictional data, clearly labeled with
a dedicated Concept/Fictional Data disclaimer page (page 6). It is not a
placeholder — it is real, syntactically valid PDF output — but the
technical figures inside it are fictional demonstration data, consistent
with the rest of this portfolio concept site.

To regenerate it after editing scripts/datasheet-template.html or
scripts/build-datasheet.mjs, run:

  node scripts/build-datasheet.mjs

Before deploying this site for a real product, replace both the template
content and the datasheetPath in src/content/products/axm-400.md with a
real product's real, engineering-verified specifications.

See docs/ASSET_LICENSES.md for the full asset status of every downloadable
and visual asset referenced across the site.
