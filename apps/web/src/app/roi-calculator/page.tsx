import Link from "next/link";

import { RoiCalculator } from "@/components/RoiCalculator";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "ROI Calculator",
    description:
      "Estimate revenue lift from higher conversion rates and better lead routing in under two minutes.",
    path: "/roi-calculator",
  });
}

export default function RoiCalculatorPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              ROI calculator
            </p>
            <h1 className="title mt-3 text-4xl font-semibold">
              See what a 25% lift looks like in dollars.
            </h1>
            <p className="mt-4 text-base text-[var(--muted)]">
              Plug in your current lead volume and deal size to estimate how much upside you can
              unlock by tightening conversion and follow‑up.
            </p>
          </div>
          <Link
            href="/growth-audit?utm_source=site&utm_medium=cta&utm_campaign=roi"
            className="btn-secondary rounded-full px-5 py-2 text-sm font-semibold"
          >
            Request a growth audit
          </Link>
        </div>
        <div className="mt-10">
          <RoiCalculator />
        </div>
      </div>
    </section>
  );
}
