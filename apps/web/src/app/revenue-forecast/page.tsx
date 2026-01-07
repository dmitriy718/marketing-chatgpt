import Link from "next/link";

import { RevenueForecastCalculator } from "@/components/RevenueForecastCalculator";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Revenue Forecast Snapshot",
    description:
      "Calculate pipeline coverage, monthly revenue targets, and a forecast snapshot for your team.",
    path: "/revenue-forecast",
  });
}

const highlights = [
  "Forecast monthly revenue based on leads and close rate",
  "Calculate ideal pipeline coverage for your sales cycle",
  "Get a dashboard-ready snapshot to share internally",
];

export default function RevenueForecastPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Revenue forecast
            </p>
            <h1 className="title text-4xl font-semibold">
              A revenue snapshot your leadership team can trust.
            </h1>
            <p className="text-base text-[var(--muted)]">
              Use real funnel inputs to forecast monthly revenue and pipeline coverage. We’ll send
              a report you can drop into your next forecast meeting.
            </p>
            <div className="grid gap-3 text-sm text-[var(--muted)]">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] p-4">
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
              Want help building a live dashboard?{" "}
              <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=revenue-forecast">
                Book a forecasting consult →
              </Link>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="title text-2xl font-semibold">Forecast checklist</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {[
                "Lead volume + source mix",
                "Sales cycle and coverage ratio",
                "Stage conversion rates",
                "Pipeline velocity insights",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <RevenueForecastCalculator />
      </div>
    </section>
  );
}
