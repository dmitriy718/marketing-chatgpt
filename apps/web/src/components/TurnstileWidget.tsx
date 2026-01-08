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
    };
  }
}

const scriptId = "turnstile-script";
const scriptSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpire,
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
