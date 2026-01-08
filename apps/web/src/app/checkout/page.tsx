"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { getStripePlan } from "@/lib/stripePlans";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type CheckoutState = "idle" | "loading" | "ready" | "error";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

function CheckoutForm({
  planKey,
  planLabel,
  mode,
}: {
  planKey: string;
  planLabel: string;
  mode: "subscription" | "one_time";
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?plan=${planKey}`,
      },
    });
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed.");
      setSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <PaymentElement />
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button
        className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
        type="submit"
        disabled={!stripe || submitting}
      >
        {submitting
          ? "Processing..."
          : mode === "subscription"
          ? "Start subscription"
          : "Pay now"}
      </button>
      <p className="text-xs text-[var(--muted)]">
        You are paying for {planLabel}. Payments are processed securely by Stripe.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan");
  const plan = getStripePlan(planKey);
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amountLabel = useMemo(() => {
    if (!plan) {
      return "";
    }
    const label = formatCurrency(plan.amount);
    if (plan.interval === "month") {
      return `${label} / month`;
    }
    if (plan.interval === "year") {
      return `${label} / year`;
    }
    return label;
  }, [plan]);

  const handleStart = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plan) {
      return;
    }
    setStatus("loading");
    setError(null);

    try {
      if (plan.mode === "subscription") {
        if (!plan.priceId) {
          throw new Error("Pricing is not configured yet.");
        }
        const response = await fetch("/api/stripe/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: plan.priceId,
            name,
            email,
            planLabel: plan.label,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error ?? "Subscription failed.");
        }
        setClientSecret(payload.client_secret);
      } else {
        const response = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: plan.amount,
            name,
            email,
            description: plan.label,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error ?? "Payment failed.");
        }
        setClientSecret(payload.client_secret);
      }

      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
    }
  };

  if (!plan) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h1 className="title text-3xl font-semibold">Plan not found</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            The payment link is missing or invalid. Please return to pricing and try again.
          </p>
        </div>
      </section>
    );
  }

  if (!publishableKey || !stripePromise) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h1 className="title text-3xl font-semibold">Stripe is not configured</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Please check the Stripe publishable key and try again.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Checkout
          </p>
          <h1 className="title mt-3 text-3xl font-semibold">{plan.label}</h1>
          <p className="mt-3 text-lg font-semibold">{amountLabel}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            You are paying securely via Stripe. Subscriptions can be managed anytime.
          </p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          {status === "ready" && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: "stripe" },
              }}
            >
              <CheckoutForm
                planKey={plan.key}
                planLabel={plan.label}
                mode={plan.mode}
              />
            </Elements>
          ) : (
            <form className="grid gap-4" onSubmit={handleStart}>
              <h2 className="title text-2xl font-semibold">Your details</h2>
              <input
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <input
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
              <button
                className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Preparing..." : "Continue to payment"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
