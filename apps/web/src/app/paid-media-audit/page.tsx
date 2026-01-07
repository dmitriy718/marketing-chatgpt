import Link from "next/link";

import { PaidMediaAuditForm } from "@/components/PaidMediaAuditForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Paid Media Audit",
    description:
      "Audit your paid media performance, creative, and landing flows with a refresh plan.",
    path: "/paid-media-audit",
  });
}

const auditAreas = [
  "Account structure + bidding strategy",
  "Creative fatigue + testing velocity",
  "Landing page relevance and conversion flow",
  "Audience targeting + budget allocation",
  "Tracking integrity + attribution gaps",
];

const deliverables = [
  {
    title: "Audit scorecard",
    description: "Performance insights across channel, creative, and conversion.",
  },
  {
    title: "Creative refresh plan",
    description: "Ad angles, hooks, and concepts mapped to your pipeline goals.",
  },
  {
    title: "Scaling roadmap",
    description: "Budget reallocation and testing plan for the next 30 days.",
  },
];

export default function PaidMediaAuditPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Paid media audit
          </p>
          <h1 className="title text-4xl font-semibold">
            Fix paid media waste and refresh creative fast.
          </h1>
          <p className="text-base text-[var(--muted)]">
            We audit your paid accounts, identify wasted spend, and deliver a creative refresh plan
            built for pipeline lift. Expect a performance scorecard plus a 30-day test roadmap.
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
            Want us to rebuild the campaigns too?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=paid-media-audit">
              Book a paid media deep dive →
            </Link>
          </div>
          <div className="grid gap-4">
            <h2 className="title text-2xl font-semibold">Audit focus areas</h2>
            <ul className="grid gap-2 text-sm text-[var(--muted)]">
              {auditAreas.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="title text-2xl font-semibold">Request the audit</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Share your spend and goals. We will deliver findings within 48 hours.
          </p>
          <div className="mt-6">
            <PaidMediaAuditForm />
          </div>
        </div>
      </div>
    </section>
  );
}
