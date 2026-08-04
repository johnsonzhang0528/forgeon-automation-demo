/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_RFQ_ENDPOINT: string;
  readonly PUBLIC_GA4_ID: string;
  readonly PUBLIC_GTM_ID: string;
  /** 'false' opts out of Demo Mode. Any other value (including unset) keeps
   * Demo Mode on — see src/config/site.ts `isDemoMode`. */
  readonly PUBLIC_DEMO_MODE: string;
  /** 'true' opts in to search-engine indexing. Only takes effect when
   * PUBLIC_DEMO_MODE is 'false' — see src/config/site.ts `allowIndexing`. */
  readonly PUBLIC_ALLOW_INDEXING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
