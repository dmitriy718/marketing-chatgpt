import posthog from "posthog-js";

/**
 * Track errors to PostHog
 */
export function trackError(
  error: Error,
  context?: {
    component?: string;
    page?: string;
    action?: string;
    [key: string]: unknown;
  }
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.capture("$exception", {
    $exception_message: error.message,
    $exception_type: error.name,
    $exception_stack: error.stack,
    ...context,
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.capture("$performance", {
    $performance_name: name,
    $performance_duration: duration,
    ...metadata,
  });
}

/**
 * Track API call performance
 */
export function trackApiCall(
  endpoint: string,
  duration: number,
  status: number,
  error?: string
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.capture("api_call", {
    endpoint,
    duration,
    status,
    error: error || null,
    success: status >= 200 && status < 300,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.capture("feature_used", {
    feature,
    ...metadata,
  });
}
