import type { APIRoute } from 'astro';
import { locales } from '../config/site';
import { getSortedSolutions, getSortedProducts, getSortedIndustries, getSortedInsights } from '../utils/content';
import { absoluteUrl } from '../utils/seo';

/**
 * Demo Mode note (spec P0.4): this sitemap keeps generating in every mode.
 * The actual crawl gate is robots.txt's `Disallow: /` in Demo Mode (see
 * robots.txt.ts) plus per-page `noindex,nofollow` meta (see SEOHead.astro).
 * A sitemap.xml existing on disk is not itself a submission — no code path
 * in this project pings Google/Bing's sitemap ping endpoints or a Search
 * Console API, so nothing here "actively submits" the sitemap. It stays
 * available as a technical artifact/portfolio deliverable so a reviewer (or
 * a future Production Mode deployment) can see the full URL structure.
 */

export const GET: APIRoute = async () => {
  const solutions = await getSortedSolutions();
  const products = await getSortedProducts();
  const industries = await getSortedIndustries();

  const staticSegments = ['', 'solutions/', 'products/', 'industries/', 'about/', 'insights/', 'contact/'];

  const urls: string[] = [];

  for (const locale of locales) {
    for (const seg of staticSegments) {
      urls.push(absoluteUrl(`/${locale}/${seg}`));
    }
    for (const s of solutions) urls.push(absoluteUrl(`/${locale}/solutions/${s.data.entrySlug}/`));
    for (const p of products) urls.push(absoluteUrl(`/${locale}/products/${p.data.entrySlug}/`));
    for (const i of industries) urls.push(absoluteUrl(`/${locale}/industries/${i.data.entrySlug}/`));
    const insights = await getSortedInsights(locale);
    for (const post of insights) urls.push(absoluteUrl(`/${locale}/insights/${post.data.entrySlug}/`));
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
