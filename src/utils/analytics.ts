/**
 * Account-agnostic conversion event layer (spec §22).
 * Pushes to window.dataLayer when present; no-ops (never throws) otherwise.
 * No real GA4/GTM IDs are wired into this build — see README "Analytics".
 */

export type AnalyticsEvent =
  | 'cta_click'
  | 'rfq_start'
  | 'rfq_submit'
  | 'product_view'
  | 'solution_view'
  | 'spec_download'
  | 'language_switch'
  | 'contact_click';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(event: AnalyticsEvent, payload: Record<string, unknown> = {}): void {
  try {
    if (typeof window === 'undefined') return;
    if (!Array.isArray(window.dataLayer)) return;
    window.dataLayer.push({ event, ...payload });
  } catch {
    // Analytics must never break the page.
  }
}
