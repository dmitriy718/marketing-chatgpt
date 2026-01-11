import { Suspense } from "react";
import { Metadata } from "next";

import { CheckoutSuccessClient } from "@/components/CheckoutSuccessClient";
import { buildPageMetadata, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Payment Successful | Welcome to Carolina Growth",
    description: "Your payment was successful! Welcome to Carolina Growth. Your subscription is now active and our team will be in touch shortly to get started.",
    path: "/checkout/success",
    keywords: ["payment success", "subscription activated", "welcome"],
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Checkout
            </p>
            <h1 className="title mt-3 text-3xl font-semibold">Processing</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              We are confirming your payment.
            </p>
          </div>
        </section>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
