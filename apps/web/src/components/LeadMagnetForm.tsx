"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type LeadMagnetFormProps = {
  title: string;
  description?: string | null;
  downloadUrl: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function LeadMagnetForm({ title, description, downloadUrl }: LeadMagnetFormProps) {
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    try {
      if (turnstileEnabled && !turnstileToken) {
        throw new Error("Please complete the bot check.");
      }

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN
            ? { "x-rate-limit-token": process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN }
            : null),
        },
        body: JSON.stringify({ email, leadMagnet: title, turnstileToken }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.error ?? "Submission failed.");
      }

      setStatus("success");
      setMessage("Check your inbox for the download link.");
      trackEvent({ name: "lead_magnet_submit", params: { title } });
      form.reset();
      window.open(downloadUrl, "_blank");
      setTurnstileToken(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-8 text-[var(--background)]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
        Free resource
      </p>
      <h2 className="title mt-3 text-3xl font-semibold">{title}</h2>
      {description ? <p className="mt-3 text-sm text-[var(--muted)]">{description}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className="min-w-[220px] flex-1 rounded-full border border-transparent bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
        />
        <button
          type="submit"
          className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[#0b0e12]"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending..." : "Get the guide"}
        </button>
      </div>
      <div className="mt-4">
        <TurnstileWidget
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
      </div>
      {message ? (
        <p
          className={`mt-3 text-sm ${status === "success" ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
