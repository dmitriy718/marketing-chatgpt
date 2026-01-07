import Link from "next/link";

import { GrowthAuditForm } from "@/components/GrowthAuditForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Growth Audit",
    description:
      "Get a 48-hour growth audit covering conversion leaks, paid media gaps, and high-impact wins.",
    path: "/growth-audit",
  });
}

export default function GrowthAuditPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Growth audit
          </p>
          <h1 className="title text-4xl font-semibold">
            A 48-hour roadmap for your next revenue win.
          </h1>
          <p className="text-base text-[var(--muted)]">
            We audit your acquisition stack, landing experience, and CRM handoff to surface the top
            opportunities you can execute this month.
          </p>
          <div className="grid gap-4">
            {[
              "Conversion leak review across top pages",
              "Paid media gaps and quick wins",
              "Pipeline and CRM follow-up risks",
              "Prioritized sprint plan with owners",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--border)] p-4 text-sm">
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
            Prefer a live walkthrough?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=growth-audit">
              Book a strategy call →
            </Link>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="title text-2xl font-semibold">Request your audit</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Share a few details and we’ll deliver findings within 48 hours.
          </p>
          <div className="mt-6">
            <GrowthAuditForm />
          </div>
        </div>
      </div>
    </section>
  );
}
