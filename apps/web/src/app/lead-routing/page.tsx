import Link from "next/link";

import { LeadRoutingForm } from "@/components/LeadRoutingForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Lead Capture Playbook",
    description:
      "Fix speed-to-lead and routing gaps with a lead capture playbook and automation map.",
    path: "/lead-routing",
  });
}

const outcomes = [
  {
    title: "Speed-to-lead SLA",
    description: "Define response time targets and escalation paths by segment.",
  },
  {
    title: "Routing rules map",
    description: "Own every source with clear rules for inbound, outbound, and partners.",
  },
  {
    title: "Automation + alerts",
    description: "Notification stack, CRM ownership, and fail-safe coverage.",
  },
];

const checklist = [
  "Lead source audit and gap analysis",
  "CRM field + stage normalization",
  "Routing matrix with owners and SLAs",
  "Follow-up sequences and escalation rules",
  "Performance dashboard + weekly QA",
];

export default function LeadRoutingPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Lead capture playbook
          </p>
          <h1 className="title text-4xl font-semibold">
            Stop losing leads and fix routing in days, not quarters.
          </h1>
          <p className="text-base text-[var(--muted)]">
            We build a routing system that protects every lead, cuts response time, and gives your
            team clarity on who owns what. Expect a documented playbook plus automation map.
          </p>
          <div className="grid gap-4">
            {outcomes.map((item) => (
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
            Want us to implement the automation too?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=lead-routing">
              Book a routing consult →
            </Link>
          </div>
          <div className="grid gap-4">
            <h2 className="title text-2xl font-semibold">What we deliver</h2>
            <ul className="grid gap-2 text-sm text-[var(--muted)]">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="title text-2xl font-semibold">Request the playbook</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Share your lead volume and response time. We will send the routing map within 48 hours.
          </p>
          <div className="mt-6">
            <LeadRoutingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
