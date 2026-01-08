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
    });
  }, [apiKey]);

  return <>{children}</>;
}
