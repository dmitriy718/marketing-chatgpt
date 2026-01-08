import posthog from "posthog-js";

type AnalyticsEvent = {
  name: string;
  params?: Record<string, string | number | boolean | null | undefined>;
};

export function trackEvent({ name, params }: AnalyticsEvent) {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", name, params ?? {});
  }

  if (posthog?.capture) {
    posthog.capture(name, params ?? {});
  }
}
