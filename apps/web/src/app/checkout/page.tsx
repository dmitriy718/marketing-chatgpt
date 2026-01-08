import { Suspense } from "react";

import { CheckoutClient } from "@/components/CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Checkout
            </p>
            <h1 className="title mt-3 text-3xl font-semibold">Loading checkout</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">Preparing your payment flow.</p>
          </div>
        </section>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
