"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type FormState = "idle" | "submitting" | "success" | "error";

function toNumber(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function RoiCalculator() {
  const [monthlyLeads, setMonthlyLeads] = useState("250");
  const [closeRate, setCloseRate] = useState("18");
  const [avgDeal, setAvgDeal] = useState("5000");
  const [liftPercent, setLiftPercent] = useState("25");
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const result = useMemo(() => {
    const leads = toNumber(monthlyLeads);
    const rate = toNumber(closeRate) / 100;
    const deal = toNumber(avgDeal);
    const lift = toNumber(liftPercent) / 100;
    const baseline = leads * rate * deal;
    const liftValue = baseline * lift;
    const annualLift = liftValue * 12;
    return { baseline, liftValue, annualLift };
  }, [monthlyLeads, closeRate, avgDeal, liftPercent]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details: `ROI Calculator: leads=${monthlyLeads}, closeRate=${closeRate}%, avgDeal=${avgDeal}, lift=${liftPercent}%`,
      source: "roi-calculator",
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
        const resultBody = await response.json().catch(() => ({}));
        throw new Error(resultBody?.error ?? "Submission failed.");
      }

      setStatus("success");
      setMessage("Thanks! We will send your ROI snapshot shortly.");
      trackEvent({ name: "roi_submit", params: { source: "roi-calculator" } });
      form.reset();
      setTurnstileToken(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {[
          {
            label: "Monthly qualified leads",
            value: monthlyLeads,
            onChange: setMonthlyLeads,
          },
          {
            label: "Close rate (%)",
            value: closeRate,
            onChange: setCloseRate,
          },
          {
            label: "Average deal value ($)",
            value: avgDeal,
            onChange: setAvgDeal,
          },
          {
            label: "Expected conversion lift (%)",
            value: liftPercent,
            onChange: setLiftPercent,
          },
        ].map((field) => (
          <label key={field.label} className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">{field.label}</span>
            <input
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </label>
        ))}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Estimated lift
          </p>
          <p className="mt-2 text-2xl font-semibold">
            ${Math.round(result.liftValue).toLocaleString()} / month
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            ≈ ${Math.round(result.annualLift).toLocaleString()} annual upside
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
      >
        <h3 className="title text-2xl font-semibold">Get the full ROI snapshot</h3>
        {[
          { label: "Full name", type: "text", name: "name", required: true },
          { label: "Email", type: "email", name: "email", required: true },
          { label: "Company", type: "text", name: "company", required: true },
          { label: "Monthly budget", type: "text", name: "budget" },
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
          {status === "submitting" ? "Sending..." : "Email my snapshot"}
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
    </div>
  );
}
