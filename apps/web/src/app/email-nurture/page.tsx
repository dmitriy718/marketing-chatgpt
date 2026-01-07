import Link from "next/link";

import { EmailNurtureForm } from "@/components/EmailNurtureForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Email Nurture System",
    description: "Build lifecycle sequences that warm leads and accelerate revenue.",
    path: "/email-nurture",
  });
}

const sequences = [
  {
    title: "Lead warm-up sequence",
    description: "Introduce value, authority, and proof in the first 7 days.",
  },
  {
    title: "Opportunity accelerator",
    description: "Remove friction, deepen trust, and drive the next step.",
  },
  {
    title: "Reactivation loop",
    description: "Win back dormant leads with timely offers and proof.",
  },
];

const deliverables = [
  "Segmentation + triggers map",
  "Email sequence copy + subject lines",
  "Automation flow diagram",
  "Performance dashboard outline",
];

export default function EmailNurturePage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Email nurture system
          </p>
          <h1 className="title text-4xl font-semibold">
            Turn inbound leads into booked calls with lifecycle nurture.
          </h1>
          <p className="text-base text-[var(--muted)]">
            We build a conversion-focused nurture system that moves new leads to opportunity with
            clear sequencing, personalized messaging, and automated follow-up.
          </p>
          <div className="grid gap-4">
            {sequences.map((item) => (
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
            Need help running the sequences?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=email-nurture">
              Book a lifecycle consult →
            </Link>
          </div>
          <div className="grid gap-4">
            <h2 className="title text-2xl font-semibold">What you receive</h2>
            <ul className="grid gap-2 text-sm text-[var(--muted)]">
              {deliverables.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="title text-2xl font-semibold">Request the nurture plan</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Share your audience and goals. We will send the nurture plan within 48 hours.
          </p>
          <div className="mt-6">
            <EmailNurtureForm />
          </div>
        </div>
      </div>
    </section>
  );
}
