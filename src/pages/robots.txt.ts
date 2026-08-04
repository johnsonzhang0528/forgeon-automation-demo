import type { APIRoute } from 'astro';
import { siteConfig, allowIndexing } from '../config/site';

/**
 * Demo Mode gate (spec P0.4): this is a fictional portfolio concept site and
 * must not be crawlable as if it were a real company. `Disallow: /` is the
 * actual enforcement mechanism — noindex meta tags help, but robots.txt is
 * what stops crawlers before they even fetch a page. The sitemap URL is
 * still emitted either way: it is a harmless technical artifact for anyone
 * who already has the site's link, not an invitation to crawl (see
 * docs/REMEDIATION_PLAN.md P0.4 and sitemap.xml.ts's own comment).
 */
export const GET: APIRoute = () => {
  const body = allowIndexing
    ? `User-agent: *
Allow: /

Sitemap: ${siteConfig.siteUrl.replace(/\/$/, '')}/sitemap.xml
`
    : `User-agent: *
Disallow: /

# This is a fictional portfolio concept site (Demo Mode), not a real
# business. See /zh-tw/ or /en/ footer for the Concept Project disclosure.
Sitemap: ${siteConfig.siteUrl.replace(/\/$/, '')}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
