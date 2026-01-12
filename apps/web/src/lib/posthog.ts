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

/**
 * Identify user in PostHog
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.identify(userId, properties);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.setPersonProperties(properties);
}

/**
 * Track conversion events (leads, signups, purchases)
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.capture("conversion", {
    conversion_type: conversionType,
    value: value || null,
    ...metadata,
  });
}

/**
 * Track form submissions
 */
export function trackFormSubmission(
  formName: string,
  success: boolean,
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.capture("form_submitted", {
    form_name: formName,
    success,
    ...metadata,
  });
}

/**
 * Track page engagement (time on page, scroll depth, etc.)
 */
export function trackPageEngagement(
  page: string,
  timeOnPage: number,
  scrollDepth?: number,
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !posthog?.__loaded) {
    return;
  }

  posthog.capture("page_engagement", {
    page,
    time_on_page: timeOnPage,
    scroll_depth: scrollDepth || null,
    ...metadata,
  });
}
