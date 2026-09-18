/**
 * Client-side GA4 helpers for the existing installation (G-EKNR66122Z).
 * Does not load a second gtag.js / Measurement ID.
 *
 * Note: In this environment gtag('event', ...) is queued on dataLayer but the
 * Google tag often does not emit a /g/collect hit for manual events (only
 * automatic page_view / enhanced measurement). trackSignUp therefore also
 * sends a same-tid collect beacon so sign_up is actually delivered.
 */

export type SignUpMethod = "email" | "google" | "apple";

type GtagParamValue = string | number | boolean | null | undefined | (() => void);
type GtagParams = Record<string, GtagParamValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-EKNR66122Z";

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

function ensureGtagStub(): boolean {
  if (typeof window === "undefined") return false;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") return true;
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  return true;
}

/** Read GA4 client id from the `_ga` cookie when present. */
function readGaClientId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!match) return null;
  const parts = decodeURIComponent(match[1]).split(".");
  if (parts.length < 4) return null;
  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
}

function clientId(): string {
  return (
    readGaClientId() ||
    `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`
  );
}

/**
 * Send a GA4 event hit to the existing Measurement ID collect endpoint.
 * Same tid as GoogleAnalytics — not a second installation.
 */
function sendCollectBeacon(
  eventName: string,
  params?: Record<string, string>,
): boolean {
  if (typeof window === "undefined" || !eventName) return false;

  const qs = new URLSearchParams({
    v: "2",
    tid: GA_MEASUREMENT_ID,
    cid: clientId(),
    en: eventName,
    dl: window.location.href,
    dt: document.title || "",
    sid: String(Math.floor(Date.now() / 1000)),
    _s: "1",
  });

  for (const [key, value] of Object.entries(params || {})) {
    if (value != null && value !== "") qs.set(`ep.${key}`, value);
  }

  if (isDev) {
    qs.set("debug_mode", "1");
    qs.set("_dbg", "1");
  }

  const url = `https://www.google-analytics.com/g/collect?${qs.toString()}`;

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      return navigator.sendBeacon(url);
    }
  } catch {
    /* fall through */
  }

  try {
    void fetch(url, { mode: "no-cors", keepalive: true, credentials: "omit" });
    return true;
  } catch {
    return false;
  }
}

/** Fire via gtag (dataLayer) when available — never throws. */
export function trackEvent(eventName: string, params?: GtagParams): void {
  if (typeof window === "undefined" || !eventName) return;
  ensureGtagStub();

  const payload: GtagParams = { ...(params || {}) };
  if (isDev) payload.debug_mode = true;

  if (isDev) {
    // eslint-disable-next-line no-console
    console.log("[GA4] gtag event", eventName, payload);
  }

  try {
    window.gtag!("event", eventName, payload);
  } catch {
    /* ignore */
  }
}

/**
 * Standard GA4 `sign_up` conversion event.
 * Call only after `/api/auth/signup` succeeds. No PII.
 *
 * Resolves after the collect beacon is queued (and gtag callback/timeout).
 */
export function trackSignUp(method: SignUpMethod = "email"): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (isDev) {
      // eslint-disable-next-line no-console
      console.log("[GA4] trackSignUp → gtag + collect beacon", {
        method,
        gtag: typeof window.gtag,
        tid: GA_MEASUREMENT_ID,
      });
    }

    ensureGtagStub();

    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timeout = window.setTimeout(done, 1500);

    // 1) Existing gtag installation (may queue without a collect hit).
    try {
      window.gtag!("event", "sign_up", {
        method,
        send_to: GA_MEASUREMENT_ID,
        ...(isDev ? { debug_mode: true } : {}),
        event_callback: () => {
          window.clearTimeout(timeout);
          done();
        },
        event_timeout: 1500,
      });
    } catch {
      /* continue to beacon */
    }

    // 2) Same Measurement ID — guaranteed /g/collect with en=sign_up & ep.method=
    const queued = sendCollectBeacon("sign_up", { method });
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log("[GA4] collect beacon queued:", queued);
    }

    // Don't wait solely on gtag callback — beacon is already sent.
    window.setTimeout(() => {
      window.clearTimeout(timeout);
      done();
    }, 300);
  });
}
