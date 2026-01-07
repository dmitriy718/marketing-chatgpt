import Link from "next/link";

import { RetentionReferralForm } from "@/components/RetentionReferralForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Retention & Referral Engine",
    description:
      "Increase retention and referrals with lifecycle plays, advocacy loops, and win-back flows.",
    path: "/retention-referral",
  });
}

const engineBlocks = [
  {
    title: "Lifecycle moments",
    description: "Map the key moments that keep customers engaged and loyal.",
  },
  {
    title: "Advocacy engine",
    description: "Incentivize referrals with clear rewards and easy sharing paths.",
  },
  {
    title: "Win-back loops",
    description: "Re-engage inactive customers before churn turns permanent.",
  },
];

const deliverables = [
  "Retention risk map + triggers",
  "Referral offer + landing flow",
  "Win-back sequence copy",
  "LTV dashboard outline",
];

export default function RetentionReferralPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Retention + referral engine
          </p>
          <h1 className="title text-4xl font-semibold">
            Turn retention into your most predictable growth channel.
          </h1>
          <p className="text-base text-[var(--muted)]">
            We build a retention and referral engine that keeps customers engaged, activates
            advocates, and reclaims at-risk revenue. Expect a playbook you can launch in 30 days.
          </p>
          <div className="grid gap-4">
            {engineBlocks.map((item) => (
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
            Want a full retention program launch?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=retention-referral">
              Book a retention strategy call →
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
          <h2 className="title text-2xl font-semibold">Request the engine plan</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Share your retention goals. We will send the playbook within 48 hours.
          </p>
          <div className="mt-6">
            <RetentionReferralForm />
          </div>
        </div>
      </div>
    </section>
  );
}
