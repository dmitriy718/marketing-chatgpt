"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type FormState = "idle" | "submitting" | "success" | "error";

function toNumber(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function RevenueForecastCalculator() {
  const [monthlyLeads, setMonthlyLeads] = useState("300");
  const [closeRate, setCloseRate] = useState("22");
  const [avgDeal, setAvgDeal] = useState("7500");
  const [salesCycle, setSalesCycle] = useState("45");
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const forecast = useMemo(() => {
    const leads = toNumber(monthlyLeads);
    const rate = toNumber(closeRate) / 100;
    const deal = toNumber(avgDeal);
    const cycle = Math.max(1, toNumber(salesCycle));
    const monthlyRevenue = leads * rate * deal;
    const pipelineCoverage = Math.max(1.5, Math.min(4, 90 / cycle));
    const requiredPipeline = monthlyRevenue * pipelineCoverage;
    return { monthlyRevenue, pipelineCoverage, requiredPipeline };
  }, [monthlyLeads, closeRate, avgDeal, salesCycle]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details: `Forecast inputs: leads=${monthlyLeads}, closeRate=${closeRate}%, avgDeal=${avgDeal}, salesCycle=${salesCycle}d`,
      source: "revenue-forecast",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.error ?? "Submission failed.");
      }

      setStatus("success");
      setMessage("Thanks! We will send your revenue forecast snapshot shortly.");
      trackEvent({ name: "forecast_submit", params: { source: "revenue-forecast" } });
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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
            label: "Average deal size ($)",
            value: avgDeal,
            onChange: setAvgDeal,
          },
          {
            label: "Average sales cycle (days)",
            value: salesCycle,
            onChange: setSalesCycle,
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
            Monthly revenue forecast
          </p>
          <p className="mt-2 text-2xl font-semibold">
            ${Math.round(forecast.monthlyRevenue).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Target pipeline coverage: {forecast.pipelineCoverage.toFixed(1)}x
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Pipeline needed: ${Math.round(forecast.requiredPipeline).toLocaleString()}
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
      >
        <h3 className="title text-2xl font-semibold">Get the full forecast report</h3>
        {[
          { label: "Full name", type: "text", name: "name", required: true },
          { label: "Email", type: "email", name: "email", required: true },
          { label: "Company", type: "text", name: "company", required: true },
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
        <button
          type="submit"
          className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending..." : "Email my forecast"}
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
