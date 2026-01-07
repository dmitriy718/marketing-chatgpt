import Link from "next/link";

import { PricingPackageBuilder } from "@/components/PricingPackageBuilder";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Pricing",
    description: "Simple pricing tiers with an option to build your own package.",
    path: "/pricing",
  });
}

const tiers = [
  {
    name: "Launch",
    price: "$750/mo",
    summary: "Best for local brands getting serious about acquisition.",
    bullets: [
      "Foundational tracking + analytics",
      "Local SEO + review engine",
      "Monthly growth roadmap",
      "One primary channel",
    ],
  },
  {
    name: "Momentum",
    price: "$1,500/mo",
    summary: "Multi-channel growth with conversion lift baked in.",
    bullets: [
      "SEO + paid search",
      "CRO teardown + fixes",
      "Lifecycle email flows",
      "Bi-weekly reporting",
    ],
  },
  {
    name: "Scale",
    price: "$3,000/mo",
    summary: "Aggressive growth systems for teams ready to scale fast.",
    bullets: [
      "Full funnel acquisition",
      "Creative refresh + paid media",
      "Revenue forecasting",
      "Executive dashboards",
    ],
  },
];

export default function PricingPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-12">
        <div className="grid gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Pricing
          </p>
          <h1 className="title text-4xl font-semibold">
            Clear price points and a custom build option.
          </h1>
          <p className="text-base text-[var(--muted)]">
            Choose one of the three core packages below. No enterprise tier is listed here
            because those are scoped only through a live consultation.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className="glass rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {tier.name}
              </p>
              <p className="mt-3 text-3xl font-semibold">{tier.price}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{tier.summary}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                {tier.bullets.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact?utm_source=site&utm_medium=cta&utm_campaign=pricing-tiers"
                className="btn-primary mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold"
              >
                Book a call
              </Link>
            </div>
          ))}
        </div>
        <div className="grid gap-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  Option 4
                </p>
                <h2 className="title mt-2 text-2xl font-semibold">Build your own package</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Use the builder below to outline scope and priorities. If you choose this route,
                  we take a $250 deposit to schedule a live consultation and finalize pricing.
                </p>
              </div>
              <Link
                href="/contact?utm_source=site&utm_medium=cta&utm_campaign=pricing-builder"
                className="btn-secondary mt-4 inline-flex justify-center rounded-full px-4 py-2 text-sm font-semibold md:mt-0"
              >
                Request a custom build
              </Link>
            </div>
          </div>
          <PricingPackageBuilder />
        </div>
      </div>
    </section>
  );
}
