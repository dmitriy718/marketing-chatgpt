"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

type PostHogProviderProps = {
  children: React.ReactNode;
};

export function PostHogProvider({ children }: PostHogProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";

  useEffect(() => {
    if (!apiKey || posthog.__loaded) {
      return;
    }

    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ph";
    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: true,
      autocapture: true,
      // Performance monitoring
      capture_performance: true,
      // Session recording (optional, can be enabled later)
      disable_session_recording: false,
      // Error tracking
      loaded: (ph) => {
        // Set up global error handler
        if (typeof window !== "undefined") {
          window.addEventListener("error", (event) => {
            ph.capture("$exception", {
              $exception_message: event.message,
              $exception_type: event.error?.name || "Error",
              $exception_stack: event.error?.stack,
              $exception_source: event.filename,
              $exception_line: event.lineno,
              $exception_column: event.colno,
            });
          });

          // Handle unhandled promise rejections
          window.addEventListener("unhandledrejection", (event) => {
            ph.capture("$exception", {
              $exception_message: event.reason?.message || String(event.reason),
              $exception_type: event.reason?.name || "UnhandledRejection",
              $exception_stack: event.reason?.stack,
            });
          });
        }
      },
    });
  }, [apiKey]);

  return <>{children}</>;
}
