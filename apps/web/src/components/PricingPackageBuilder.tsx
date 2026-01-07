"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type PackageState = {
  tier: string;
  locations: string;
  urgency: string;
  support: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

const defaultState: PackageState = {
  tier: "growth",
  locations: "single",
  urgency: "standard",
  support: "standard",
};

const tierPricing = {
  starter: { label: "Starter", base: 6500 },
  growth: { label: "Growth", base: 11000 },
  scale: { label: "Scale", base: 18000 },
};

const locationMultiplier: Record<string, number> = {
  single: 1,
  multi: 1.35,
  enterprise: 1.7,
};

const urgencyMultiplier: Record<string, number> = {
  standard: 1,
  fast: 1.15,
  rush: 1.3,
};

const supportMultiplier: Record<string, number> = {
  standard: 1,
  premium: 1.2,
  enterprise: 1.35,
};

export function PricingPackageBuilder() {
  const [state, setState] = useState<PackageState>(defaultState);
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const estimate = useMemo(() => {
    const tier = tierPricing[state.tier as keyof typeof tierPricing] ?? tierPricing.growth;
    const multiplier =
      (locationMultiplier[state.locations] ?? 1) *
      (urgencyMultiplier[state.urgency] ?? 1) *
      (supportMultiplier[state.support] ?? 1);
    const monthly = Math.round(tier.base * multiplier);
    return {
      tierLabel: tier.label,
      monthly,
      min: Math.round(monthly * 0.9),
      max: Math.round(monthly * 1.1),
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
      details: `Pricing builder: tier=${state.tier}, locations=${state.locations}, urgency=${state.urgency}, support=${state.support}, estimate=${estimate.monthly}`,
      source: "pricing-builder",
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
      setMessage("Thanks! We will send a package recommendation within 48 hours.");
      trackEvent({
        name: "pricing_submit",
        params: { source: "pricing-builder", tier: state.tier },
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
          <p className="text-sm font-semibold">Choose your package</p>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(tierPricing).map(([key, tier]) => {
              const active = state.tier === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, tier: key }))}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--surface-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {tier.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-semibold">Locations</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { key: "single", label: "Single location" },
              { key: "multi", label: "Multi-location" },
              { key: "enterprise", label: "Multi-brand" },
            ].map((option) => {
              const active = state.locations === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, locations: option.key }))}
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
              { key: "standard", label: "Standard" },
              { key: "fast", label: "Fast" },
              { key: "rush", label: "Rush" },
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
          <p className="text-sm font-semibold">Support level</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { key: "standard", label: "Standard" },
              { key: "premium", label: "Premium" },
              { key: "enterprise", label: "Enterprise" },
            ].map((option) => {
              const active = state.support === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, support: option.key }))}
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
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Estimated monthly range
          </p>
          <p className="mt-2 text-2xl font-semibold">
            ${estimate.min.toLocaleString()} - ${estimate.max.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Package: {estimate.tierLabel}
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
      >
        <h3 className="title text-2xl font-semibold">Request a package recommendation</h3>
        <p className="text-sm text-[var(--muted)]">
          Share your details and we’ll recommend the best-fit package and next steps.
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
          {status === "submitting" ? "Sending..." : "Send my package"}
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
