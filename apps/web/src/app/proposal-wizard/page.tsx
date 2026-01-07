import Link from "next/link";

import { ProposalWizard } from "@/components/ProposalWizard";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Proposal Wizard",
    description: "Build a proposal range and scope in minutes with a guided wizard.",
    path: "/proposal-wizard",
  });
}

const highlights = [
  "Estimate service range in minutes",
  "Align scope with urgency and goals",
  "Receive a tailored proposal within 48 hours",
];

export default function ProposalWizardPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Proposal wizard
            </p>
            <h1 className="title text-4xl font-semibold">
              Build a tailored proposal range in minutes.
            </h1>
            <p className="text-base text-[var(--muted)]">
              Share your scope, timeline, and goals to receive a proposal range and next steps
              tailored to your growth plan.
            </p>
            <div className="grid gap-3 text-sm text-[var(--muted)]">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] p-4">
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
              Need a custom scope?{" "}
              <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=proposal-wizard">
                Book a proposal consult →
              </Link>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="title text-2xl font-semibold">What you’ll receive</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {[
                "Recommended scope and timeline",
                "Projected budget range",
                "Immediate next steps",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ProposalWizard />
      </div>
    </section>
  );
}
