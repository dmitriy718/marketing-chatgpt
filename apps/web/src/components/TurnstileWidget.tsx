"use client";

import { useEffect, useRef } from "react";

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const scriptId = "turnstile-script";
const scriptSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const resetWidget = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (e) {
        // If reset fails, remove and re-render
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          widgetIdRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    const internalToken = (window as Window & { __internalApiToken?: string }).__internalApiToken;
    if (internalToken) {
      onVerify(internalToken);
      return;
    }

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) {
        return;
      }
      // Reset if widget already exists
      if (widgetIdRef.current) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          return;
        } catch {
          // If reset fails, clear and re-render
          containerRef.current.innerHTML = "";
          widgetIdRef.current = null;
        }
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "error-callback": () => {
          resetWidget();
          onError?.();
        },
        "expired-callback": () => {
          resetWidget();
          onExpire?.();
        },
        theme: "auto",
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", renderWidget);
      return () => existingScript.removeEventListener("load", renderWidget);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget);
    document.head.appendChild(script);

    return () => script.removeEventListener("load", renderWidget);
  }, [onExpire, onError, onVerify]);

  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} />;
}
