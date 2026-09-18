/**
 * Client-side GA4 helpers. Relies on the existing GoogleAnalytics script
 * (gtag) — does not load a second tag.
 */

export type SignUpMethod = "email" | "google" | "apple";

type GtagParamValue = string | number | boolean | null | undefined;
type GtagParams = Record<string, GtagParamValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function canTrack(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/** Fire a GA4 event. No-op on the server or if gtag is not ready. */
export function trackEvent(eventName: string, params?: GtagParams): void {
  if (!canTrack() || !eventName) return;
  try {
    window.gtag!("event", eventName, params || {});
  } catch {
    // Never block UX on analytics failures
  }
}

/**
 * Standard GA4 `sign_up` conversion event.
 * Call only after the API confirms account creation succeeded.
 * Do not pass PII (email, user id, tokens, etc.).
 */
export function trackSignUp(method: SignUpMethod = "email"): void {
  trackEvent("sign_up", { method });
}
