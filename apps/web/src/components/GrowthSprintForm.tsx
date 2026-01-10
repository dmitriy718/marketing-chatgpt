"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { getInternalLeadHeaders } from "@/lib/internalHeaders";

type FormState = "idle" | "submitting" | "success" | "error";

export function GrowthSprintForm() {
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
    const goal = String(formData.get("goal") ?? "").trim();
    const constraint = String(formData.get("constraint") ?? "").trim();
    const channel = String(formData.get("channel") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const startDate = String(formData.get("startDate") ?? "").trim();
    const teamSize = String(formData.get("teamSize") ?? "").trim();

    const details = [
      goal ? `Goal: ${goal}` : "",
      constraint ? `Constraint: ${constraint}` : "",
      channel ? `Channel focus: ${channel}` : "",
      website ? `Website: ${website}` : "",
      startDate ? `Target start: ${startDate}` : "",
      teamSize ? `Team size: ${teamSize}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details,
      source: "growth-sprint",
      turnstileToken,
    };

    try {
      const hasInternalToken = Boolean(getInternalLeadHeaders());
      if (turnstileEnabled && !turnstileToken && !hasInternalToken) {
        throw new Error("Please complete the bot check.");
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN
            ? { "x-rate-limit-token": process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN }
            : null),
          ...(getInternalLeadHeaders() ?? null),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.error ?? "Submission failed.");
      }

      setStatus("success");
      setMessage("Thanks! We will send the sprint plan and timeline within 1 business day.");
      trackEvent({ name: "sprint_submit", params: { source: "growth-sprint" } });
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
      data-status={status}
      data-testid="growth-sprint-form"
      className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      {[
        { label: "Full name", type: "text", name: "name", required: true },
        { label: "Email", type: "email", name: "email", required: true },
        { label: "Company", type: "text", name: "company", required: true },
        { label: "Website", type: "url", name: "website" },
        { label: "Target start date", type: "text", name: "startDate" },
        { label: "Team size", type: "text", name: "teamSize" },
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
        <span className="text-[var(--muted)]">Primary outcome for the sprint</span>
        <textarea
          name="goal"
          rows={3}
          required
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Biggest growth constraint right now</span>
        <textarea
          name="constraint"
          rows={3}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Channel focus (SEO, paid, email, etc.)</span>
        <input
          type="text"
          name="channel"
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
        {status === "submitting" ? "Submitting..." : "Request the sprint plan"}
      </button>
      {message ? (
        <p
          data-testid="growth-sprint-message"
          className={`text-sm ${status === "success" ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
