import posthog from "posthog-js";

type AnalyticsEvent = {
  name: string;
  params?: Record<string, string | number | boolean | null | undefined>;
};

const CONVERSION_EVENTS = new Set([
  "lead_submit",
  "paid_audit_submit",
  "roi_submit",
  "pricing_submit",
  "lead_magnet_submit",
  "quiz_submit",
  "teardown_submit",
  "local_seo_submit",
  "retention_submit",
  "routing_submit",
  "forecast_submit",
  "proposal_submit",
  "sprint_submit",
  "audit_submit",
  "nurture_submit",
]);

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getUtmParams() {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem("cg_utm");
  let utm: Record<string, string> = {};
  if (raw) {
    try {
      utm = JSON.parse(decodeURIComponent(raw));
    } catch {
      utm = {};
    }
  }

  const referrer = readCookie("cg_ref");
  if (referrer) {
    utm.referrer = referrer;
  }

  return utm;
}

export function trackEvent({ name, params }: AnalyticsEvent) {
  if (typeof window === "undefined") {
    return;
  }

  const utmParams = getUtmParams();
  const mergedParams = { ...utmParams, ...(params ?? {}) };
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", name, mergedParams);
    if (CONVERSION_EVENTS.has(name)) {
      gtag("event", "generate_lead", {
        ...mergedParams,
        event_label: name,
      });
    }
  }

  if (posthog?.capture) {
    posthog.capture(name, mergedParams);
  }
}
