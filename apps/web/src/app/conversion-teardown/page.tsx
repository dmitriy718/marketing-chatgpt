import Link from "next/link";

import { ConversionTeardownForm } from "@/components/ConversionTeardownForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Conversion Rate Teardown",
    description:
      "Get a conversion teardown with prioritized fixes, CRO wins, and a 30-day execution plan.",
    path: "/conversion-teardown",
  });
}

const checkpoints = [
  "Hero and offer clarity score",
  "Form friction and trust gaps",
  "CTA hierarchy and next-step flow",
  "Mobile conversion speed",
  "Analytics and attribution QA",
];

const deliverables = [
  {
    title: "Scorecard + diagnostics",
    description: "We audit your key funnel pages and quantify conversion leaks.",
  },
  {
    title: "Prioritized fixes",
    description: "A ranked list of CRO experiments with impact and effort estimates.",
  },
  {
    title: "30-day execution plan",
    description: "Owners, milestones, and quick wins you can ship immediately.",
  },
];

export default function ConversionTeardownPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Conversion teardown
          </p>
          <h1 className="title text-4xl font-semibold">
            A teardown that finds the conversion leaks your team can fix this month.
          </h1>
          <p className="text-base text-[var(--muted)]">
            We review your highest-traffic pages, map the friction points, and hand you a clear
            fix list ranked by impact. Expect a scorecard, CRO roadmap, and test-ready briefs.
          </p>
          <div className="grid gap-4">
            {deliverables.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
            Prefer a walkthrough?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=conversion-teardown">
              Book a CRO strategy call →
            </Link>
          </div>
          <div className="grid gap-4">
            <h2 className="title text-2xl font-semibold">Teardown checkpoints</h2>
            <ul className="grid gap-2 text-sm text-[var(--muted)]">
              {checkpoints.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="title text-2xl font-semibold">Request the teardown</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Share your top funnel page and goals. We will deliver findings within 48 hours.
          </p>
          <div className="mt-6">
            <ConversionTeardownForm />
          </div>
        </div>
      </div>
    </section>
  );
}
