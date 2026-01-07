"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type FormState = "idle" | "submitting" | "success" | "error";

type WizardState = {
  service: string;
  urgency: string;
  budget: string;
  scope: string;
  primaryKpi: string;
};

const defaultState: WizardState = {
  service: "growth",
  urgency: "30",
  budget: "15000",
  scope: "single-location",
  primaryKpi: "pipeline",
};

const serviceMap = {
  growth: {
    label: "Growth system build",
    base: 12000,
  },
  cro: {
    label: "Conversion optimization",
    base: 9000,
  },
  paid: {
    label: "Paid media performance",
    base: 11000,
  },
  local: {
    label: "Local SEO authority",
    base: 8000,
  },
};

const scopeMultiplier: Record<string, number> = {
  "single-location": 1,
  "multi-location": 1.4,
  "multi-brand": 1.8,
};

const urgencyMultiplier: Record<string, number> = {
  "30": 1,
  "14": 1.2,
  "7": 1.35,
};

export function ProposalWizard() {
  const [state, setState] = useState<WizardState>(defaultState);
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const estimate = useMemo(() => {
    const service = serviceMap[state.service as keyof typeof serviceMap] ?? serviceMap.growth;
    const scope = scopeMultiplier[state.scope] ?? 1;
    const urgency = urgencyMultiplier[state.urgency] ?? 1;
    const monthly = Math.round(service.base * scope * urgency);
    return {
      serviceLabel: service.label,
      monthly,
      rangeMin: Math.round(monthly * 0.9),
      rangeMax: Math.round(monthly * 1.1),
    };
  }, [state]);

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
      details: `Proposal wizard: service=${state.service}, scope=${state.scope}, urgency=${state.urgency}, kpi=${state.primaryKpi}, estimate=${estimate.monthly}`,
      source: "proposal-wizard",
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
      setMessage("Thanks! We will send a tailored proposal within 48 hours.");
      trackEvent({
        name: "proposal_submit",
        params: { source: "proposal-wizard", service: state.service },
      });
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="grid gap-3">
          <p className="text-sm font-semibold">Select your primary service</p>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(serviceMap).map(([key, service]) => {
              const active = state.service === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, service: key }))}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--surface-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {service.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-semibold">Scope</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { key: "single-location", label: "Single location" },
              { key: "multi-location", label: "Multi-location" },
              { key: "multi-brand", label: "Multi-brand" },
            ].map((option) => {
              const active = state.scope === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, scope: option.key }))}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--surface-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-semibold">Timeline</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { key: "30", label: "30 days" },
              { key: "14", label: "14 days" },
              { key: "7", label: "7 days" },
            ].map((option) => {
              const active = state.urgency === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, urgency: option.key }))}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--surface-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">Primary KPI</span>
            <input
              value={state.primaryKpi}
              onChange={(event) =>
                setState((prev) => ({ ...prev, primaryKpi: event.target.value }))
              }
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">Target monthly budget</span>
            <input
              value={state.budget}
              onChange={(event) => setState((prev) => ({ ...prev, budget: event.target.value }))}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </label>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Estimated monthly range
          </p>
          <p className="mt-2 text-2xl font-semibold">
            ${estimate.rangeMin.toLocaleString()} - ${estimate.rangeMax.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Service focus: {estimate.serviceLabel}
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
      >
        <h3 className="title text-2xl font-semibold">Request a proposal</h3>
        <p className="text-sm text-[var(--muted)]">
          We will send a full scope and timeline based on your inputs.
        </p>
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
          {status === "submitting" ? "Sending..." : "Send my proposal"}
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
