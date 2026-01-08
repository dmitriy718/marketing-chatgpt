"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type FormState = "idle" | "submitting" | "success" | "error";

export function RetentionReferralForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);

    const formData = new FormData(form);
    const details = [
      `Customer type: ${String(formData.get("customerType") ?? "")}`,
      `Current retention rate: ${String(formData.get("retention") ?? "")}`,
      `Referral program: ${String(formData.get("referral") ?? "")}`,
      `LTV target: ${String(formData.get("ltv") ?? "")}`,
      `Primary risk: ${String(formData.get("risk") ?? "")}`,
      `Primary goal: ${String(formData.get("goal") ?? "")}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details,
      source: "retention-referral",
      turnstileToken,
    };

    try {
      if (turnstileEnabled && !turnstileToken) {
        throw new Error("Please complete the bot check.");
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN
            ? { "x-rate-limit-token": process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN }
            : null),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.error ?? "Submission failed.");
      }

      setStatus("success");
      setMessage("Thanks! We will send your retention + referral plan within 48 hours.");
      trackEvent({ name: "retention_submit", params: { source: "retention-referral" } });
      form.reset();
      setTurnstileToken(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      {[
        { label: "Full name", type: "text", name: "name", required: true },
        { label: "Email", type: "email", name: "email", required: true },
        { label: "Company", type: "text", name: "company", required: true },
        { label: "Customer type", type: "text", name: "customerType" },
        { label: "Current retention rate", type: "text", name: "retention" },
        { label: "Referral program status", type: "text", name: "referral" },
        { label: "Target LTV", type: "text", name: "ltv" },
        { label: "Monthly growth budget", type: "text", name: "budget" },
      ].map((field) => (
        <label key={field.name} className="grid gap-2 text-sm">
          <span className="text-[var(--muted)]">{field.label}</span>
          <input
            type={field.type}
            name={field.name}
            required={field.required}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
          />
        </label>
      ))}
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Primary retention risk</span>
        <textarea
          name="risk"
          rows={3}
          required
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Primary outcome you want</span>
        <textarea
          name="goal"
          rows={3}
          required
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
        />
      </label>
      <TurnstileWidget
        onVerify={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken(null)}
        onError={() => setTurnstileToken(null)}
      />
      <button
        type="submit"
        className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Request the retention plan"}
      </button>
      {message ? (
        <p
          className={`text-sm ${status === "success" ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
