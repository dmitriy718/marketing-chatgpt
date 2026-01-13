"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type UtmState = {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

const defaultState: UtmState = {
  baseUrl: "",
  source: "newsletter",
  medium: "email",
  campaign: "",
  content: "",
  term: "",
};

function buildUtmUrl(state: UtmState) {
  const rawUrl = state.baseUrl.trim();
  if (!rawUrl) {
    return "";
  }
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    try {
      url = new URL(`https://${rawUrl}`);
    } catch {
      return "";
    }
  }
  const params: Record<string, string> = {
    utm_source: state.source,
    utm_medium: state.medium,
    utm_campaign: state.campaign,
  };
  if (state.content) {
    params.utm_content = state.content;
  }
  if (state.term) {
    params.utm_term = state.term;
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function buildQrUrl(value: string) {
  if (!value) {
    return "";
  }
  const encoded = encodeURIComponent(value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`;
}

export function UtmQrBuilder() {
  const [state, setState] = useState<UtmState>(defaultState);

  const utmUrl = useMemo(() => buildUtmUrl(state), [state]);
  const qrUrl = useMemo(() => buildQrUrl(utmUrl), [utmUrl]);

  function updateField<K extends keyof UtmState>(key: K, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCopy() {
    if (!utmUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(utmUrl);
      trackEvent({ name: "utm_copy", params: { source: "utm-qr-builder" } });
    } catch {
      // Clipboard access can be blocked by browser permissions.
    }
  }

  async function handleDownload() {
    if (!qrUrl) {
      return;
    }
    trackEvent({ name: "utm_qr_download", params: { source: "utm-qr-builder" } });
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "utm-qr.png";
    link.click();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {[
          { label: "Destination URL", key: "baseUrl", placeholder: "https://example.com" },
          { label: "UTM source", key: "source", placeholder: "newsletter" },
          { label: "UTM medium", key: "medium", placeholder: "email" },
          { label: "UTM campaign", key: "campaign", placeholder: "spring-launch" },
          { label: "UTM content", key: "content", placeholder: "cta-hero" },
          { label: "UTM term", key: "term", placeholder: "local-seo" },
        ].map((field) => (
          <label key={field.key} className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">{field.label}</span>
            <input
              value={state[field.key as keyof UtmState]}
              onChange={(event) => updateField(field.key as keyof UtmState, event.target.value)}
              placeholder={field.placeholder}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </label>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          disabled={!utmUrl}
        >
          Copy UTM link
        </button>
      </div>
      <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">UTM preview</p>
          <p className="mt-2 break-all text-sm" data-testid="utm-preview">
            {utmUrl || "Add a destination URL to begin."}
          </p>
        </div>
        <div className="grid place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
          {qrUrl ? (
            <Image src={qrUrl} alt="UTM QR code" width={192} height={192} unoptimized />
          ) : (
            <p className="text-sm text-[var(--muted)]">QR code appears after you add a URL.</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="btn-secondary rounded-full px-6 py-3 text-sm font-semibold"
          disabled={!qrUrl}
        >
          Download QR code
        </button>
      </div>
    </div>
  );
}
