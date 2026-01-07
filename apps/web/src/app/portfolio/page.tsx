import Link from "next/link";

import { CaseStudySlider } from "@/components/CaseStudySlider";
import { getPortfolioItems } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Portfolio",
    description: "Case studies and outcomes delivered by Carolina Growth.",
    path: "/portfolio",
  });
}

export default function PortfolioPage() {
  const portfolioItems = getPortfolioItems();
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Portfolio
        </p>
        <h1 className="title mt-3 text-4xl font-semibold">Evidence that moves the needle.</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--muted)]">
          We focus on profitable growth metrics. Each engagement is tailored, but every result is
          measurable.
        </p>
        <div className="mt-10 grid gap-6">
          <div>
            <h2 className="title text-2xl font-semibold">Interactive case study slider</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Drag the slider to see how each engagement moved the core metric.
            </p>
          </div>
          <CaseStudySlider items={portfolioItems} />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {portfolioItems.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                {item.focus}
              </p>
              <h2 className="title mt-3 text-xl font-semibold">{item.title}</h2>
              <p className="mt-4 text-sm text-[var(--muted)]">{item.result}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
                >
                  View case study <span aria-hidden>→</span>
                </Link>
                {item.siteUrl ? (
                  <a
                    href={item.siteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Visit site ↗
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
