import type { APIRoute } from 'astro';
import { locales } from '../config/site';
import { getSortedSolutions, getSortedProducts, getSortedIndustries, getSortedInsights } from '../utils/content';
import { absoluteUrl } from '../utils/seo';

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
