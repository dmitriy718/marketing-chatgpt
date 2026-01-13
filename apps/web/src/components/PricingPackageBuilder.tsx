"use client";

import { useEffect, useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { getInternalLeadHeaders } from "@/lib/internalHeaders";

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
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  useEffect(() => {
    setHydrated(true);
  }, []);

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

  const depositAmount = useMemo(() => {
    return Math.round(estimate.monthly * 0.2);
  }, [estimate.monthly]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);
    setInvoiceUrl(null);

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details: `Pricing builder: tier=${state.tier}, locations=${state.locations}, urgency=${state.urgency}, support=${state.support}, estimate=${estimate.monthly}`,
      source: "pricing-builder",
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

      const invoiceResponse = await fetch("/api/stripe/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: state.tier,
          locations: state.locations,
          urgency: state.urgency,
          support: state.support,
          name: payload.name,
          email: payload.email,
          daysUntilDue: 3,
          requestId: crypto.randomUUID(),
        }),
      });

      const invoicePayload = await invoiceResponse.json().catch(() => ({}));
      if (invoiceResponse.ok) {
        setInvoiceUrl(invoicePayload?.hosted_invoice_url ?? null);
        setMessage(
          "Thanks! Your deposit invoice is on the way. We will follow up within 48 hours."
        );
      } else {
        setMessage(
          "Thanks! We received your request and will send the deposit invoice within 48 hours."
        );
      }
      setStatus("success");
      trackEvent({
        name: "pricing_submit",
        params: { source: "pricing-builder", tier: state.tier },
      });
      form.reset();
      setTurnstileToken(null);
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
          <p className="mt-2 text-xs text-[var(--muted)]">
            Estimated deposit: ${depositAmount.toLocaleString()} (20% of the estimate)
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        data-testid="pricing-builder-form"
        data-status={status}
        data-hydrated={hydrated ? "true" : "false"}
        className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
      >
        <h3 className="title text-2xl font-semibold">Request a package recommendation</h3>
        <p className="text-sm text-[var(--muted)]">
          Share your details and we’ll recommend the best-fit package and next steps. A 20%
          deposit invoice is issued to reserve a consultation.
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
        <TurnstileWidget
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
        <button
          type="submit"
          className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          disabled={status === "submitting" || !hydrated}
        >
          {status === "submitting" ? "Sending..." : "Send my package + invoice"}
        </button>
        {invoiceUrl ? (
          <a
            className="text-sm font-semibold text-[var(--primary)]"
            href={invoiceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Pay the deposit invoice →
          </a>
        ) : null}
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
