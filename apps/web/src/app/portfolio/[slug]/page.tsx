import Link from "next/link";
import { notFound } from "next/navigation";

import { getPortfolioItems } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getPortfolioItems().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getPortfolioItems().find((entry) => entry.slug === slug);
  if (!item) {
    return buildPageMetadata({
      title: "Case Study",
      description: "Case study details for Carolina Growth.",
      path: `/portfolio/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${item.title} Case Study`,
    description: item.summary ?? item.result,
    path: `/portfolio/${item.slug}`,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getPortfolioItems().find((entry) => entry.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-10">
        <div className="grid gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            {item.focus}
          </p>
          <h1 className="title text-4xl font-semibold">{item.title}</h1>
          <p className="text-base text-[var(--muted)]">{item.summary ?? item.result}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
            <span className="rounded-full border border-[var(--border)] px-4 py-1">
              Result: {item.result}
            </span>
            {item.timeframe ? (
              <span className="rounded-full border border-[var(--border)] px-4 py-1">
                Timeline: {item.timeframe}
              </span>
            ) : null}
            {item.siteUrl ? (
              <a
                href={item.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--border)] px-4 py-1 text-[var(--primary)]"
              >
                Visit site
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Challenge
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">{item.challenge ?? ""}</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Solution
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">{item.solution ?? ""}</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Outcomes
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
              {(item.outcomes ?? []).map((outcome) => (
                <li key={outcome} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
          <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr] md:items-center">
            <div>
              <h2 className="title text-2xl font-semibold">Want similar results?</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                We can map a plan for your business and show you exactly what to fix first.
              </p>
            </div>
            <Link
              href="/contact?utm_source=site&utm_medium=cta&utm_campaign=case-study"
              className="btn-primary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
            >
              Book a consult
            </Link>
          </div>
        </div>

        <Link href="/portfolio" className="text-sm font-semibold text-[var(--primary)]">
          Back to portfolio
        </Link>
      </div>
    </section>
  );
}
