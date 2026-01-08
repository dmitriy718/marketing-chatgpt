"use client";

import { useEffect } from "react";

const STORAGE_KEY = "cg_utm";
const COOKIE_NAME = "cg_utm";
const REF_COOKIE = "cg_ref";

type UtmPayload = Record<string, string>;

function setCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function UtmTracker() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ];

    const payload: UtmPayload = {};
    keys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        payload[key] = value;
      }
    });

    const hasUtm = Object.keys(payload).length > 0;
    if (hasUtm) {
      const encoded = encodeURIComponent(JSON.stringify(payload));
      localStorage.setItem(STORAGE_KEY, encoded);
      setCookie(COOKIE_NAME, encoded);
    } else {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        setCookie(COOKIE_NAME, existing);
      }
    }

    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      setCookie(REF_COOKIE, encodeURIComponent(document.referrer));
    }
  }, []);

  return null;
}
