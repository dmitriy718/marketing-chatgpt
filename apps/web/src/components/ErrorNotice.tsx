"use client";

import { useState } from "react";

import { TurnstileWidget } from "@/components/TurnstileWidget";

type ErrorWithDigest = Error & { digest?: string };

type ErrorNoticeProps = {
  error: ErrorWithDigest;
  context?: string;
};

type ReportState = "idle" | "sending" | "sent" | "failed";

export function ErrorNotice({ error, context }: ErrorNoticeProps) {
  const [status, setStatus] = useState<ReportState>("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const sendReport = async () => {
    if (status === "sending" || status === "sent") {
      return;
    }

    setStatus("sending");

    const payload = {
      message: error?.message ?? "Unexpected error",
      stack: error?.stack ?? null,
      digest: error?.digest ?? null,
      url: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      context: context ?? null,
    };

    try {
      if (turnstileEnabled && !turnstileToken) {
        setStatus("failed");
        return;
      }

      const response = await fetch("/api/bug-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN
            ? { "x-rate-limit-token": process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN }
            : null),
        },
        body: JSON.stringify({ ...payload, turnstileToken }),
      });

      setStatus(response.ok ? "sent" : "failed");
      if (response.ok) {
        setTurnstileToken(null);
      }
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Something went wrong
        </p>
        <h1 className="title mt-3 text-3xl font-semibold">
          Sorry about that. We hit an unexpected error.
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We want to fix this quickly. You can help by sending the error details to our team.
        </p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs text-[var(--muted)]">
        <div>Message: {error?.message ?? "Unknown error"}</div>
        {error?.digest ? <div>Digest: {error.digest}</div> : null}
      </div>
      <TurnstileWidget
        onVerify={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken(null)}
        onError={() => setTurnstileToken(null)}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={sendReport}
          disabled={status === "sending" || status === "sent"}
          className="btn-primary inline-flex justify-center rounded-full px-4 py-2 text-sm font-semibold"
        >
          {status === "sent" ? "Report sent" : status === "sending" ? "Sending..." : "Report this issue"}
        </button>
        <p className="text-xs text-[var(--muted)]" aria-live="polite">
          {status === "failed" ? "We could not send the report. Please try again." : null}
        </p>
      </div>
    </div>
  );
}
