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
      // Session recording enabled
      disable_session_recording: false,
      // Enhanced session recording
      session_recording: {
        recordCrossOriginIframes: false,
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
      // Advanced features
      advanced_disable_decide: false,
      // Capture UTM parameters
      capture_pageleave: true,
      // Person profiles
      persistence: "localStorage+cookie",
      // Enhanced error tracking
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

          // Track page engagement (time on page, scroll depth)
          const pageStartTime = Date.now();
          let maxScrollDepth = 0;

          const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollDepth = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
            maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
          };

          window.addEventListener("scroll", trackScrollDepth, { passive: true });

          // Track page leave
          window.addEventListener("beforeunload", () => {
            const timeOnPage = Date.now() - pageStartTime;
            ph.capture("page_engagement", {
              page: window.location.pathname,
              time_on_page: Math.round(timeOnPage / 1000), // seconds
              scroll_depth: maxScrollDepth,
            });
          });
        }
      },
    });
  }, [apiKey]);

  return <>{children}</>;
}
