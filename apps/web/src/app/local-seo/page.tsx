import Link from "next/link";

import { LocalSeoAuthorityForm } from "@/components/LocalSeoAuthorityForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Local SEO Authority Stack",
    description:
      "Boost local visibility with a Google Business Profile plan, reviews strategy, and citations.",
    path: "/local-seo",
  });
}

const authoritySteps = [
  {
    title: "Google Business Profile refresh",
    description: "Optimized categories, service areas, and conversion-ready content.",
  },
  {
    title: "Review velocity engine",
    description: "Automated review requests with response playbooks.",
  },
  {
    title: "Citation + local link cleanup",
    description: "Fix NAP inconsistencies and build trusted local signals.",
  },
];

const checkpoints = [
  "Map pack ranking audit",
  "Local keyword gap analysis",
  "Listing accuracy and duplicate cleanup",
  "Review sentiment + response velocity",
  "Location page conversion fixes",
];

export default function LocalSeoPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Local SEO authority
          </p>
          <h1 className="title text-4xl font-semibold">
            Own the map pack with a local authority stack.
          </h1>
          <p className="text-base text-[var(--muted)]">
            We build local visibility with an authority stack that ties your GBP, reviews, and
            citations to your conversion flow. Expect a 30-day roadmap plus execution-ready fixes.
          </p>
          <div className="grid gap-4">
            {authoritySteps.map((item) => (
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
            Need multi-location support?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=local-seo">
              Book a local SEO consult →
            </Link>
          </div>
          <div className="grid gap-4">
            <h2 className="title text-2xl font-semibold">Authority checkpoints</h2>
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
          <h2 className="title text-2xl font-semibold">Request the authority plan</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Tell us your locations and target market. We’ll send the local SEO plan within 48 hours.
          </p>
          <div className="mt-6">
            <LocalSeoAuthorityForm />
          </div>
        </div>
      </div>
    </section>
  );
}
