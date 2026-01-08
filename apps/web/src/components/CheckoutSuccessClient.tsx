"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get("payment_intent_client_secret");
  const [status, setStatus] = useState<string>("processing");

  useEffect(() => {
    if (!clientSecret) {
      setStatus("processing");
      return;
    }
    stripePromise?.then((stripe) => {
      if (!stripe) {
        return;
      }
      stripe.retrievePaymentIntent(clientSecret).then((result) => {
        setStatus(result.paymentIntent?.status ?? "processing");
      });
    });
  }, [clientSecret]);

  const message =
    status === "succeeded"
      ? "Payment successful. We will follow up shortly."
      : status === "processing"
      ? "Payment processing. You will receive a confirmation email soon."
      : status === "requires_payment_method"
      ? "Payment failed. Please try again."
      : "We have received your request.";

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Checkout
        </p>
        <h1 className="title mt-3 text-3xl font-semibold">Thank you</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>
      </div>
    </section>
  );
}
