import { defineConfig } from 'astro/config';

// Base URL is a placeholder for this portfolio demo. Replace via SITE env var
// before real deployment (see README.md "待替換項目").
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://forgeon-demo.yegou.studio';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  compressHTML: true,
});
