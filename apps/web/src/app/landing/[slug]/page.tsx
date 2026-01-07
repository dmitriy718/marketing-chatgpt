import { notFound } from "next/navigation";

import { CtaButtons } from "@/components/CtaButtons";
import { getLandingPageBySlug, getLandingPages } from "@/lib/content";
import { getBaseUrl } from "@/lib/seo";

type LandingParams = { slug: string };

export function generateStaticParams() {
  return getLandingPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<LandingParams> }) {
  const resolvedParams = await params;
  const page = getLandingPageBySlug(resolvedParams.slug);
  if (!page) {
    return { title: "Landing" };
  }
  const baseUrl = getBaseUrl();
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.hero?.subheadline,
    alternates: {
      canonical: `${baseUrl}/landing/${page.slug}`,
    },
    openGraph: {
      title: page.metaTitle ?? page.title,
      description: page.metaDescription ?? page.hero?.subheadline,
      url: `${baseUrl}/landing/${page.slug}`,
    },
    twitter: {
      title: page.metaTitle ?? page.title,
      description: page.metaDescription ?? page.hero?.subheadline,
    },
  };
}

export default async function LandingPage({ params }: { params: Promise<LandingParams> }) {
  const resolvedParams = await params;
  const page = getLandingPageBySlug(resolvedParams.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="text-[15px]">
      <section className="relative overflow-hidden px-6 pb-16 pt-16">
        <div className="mx-auto grid w-full max-w-5xl gap-10">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
              Landing page
            </p>
            <h1 className="title text-4xl font-semibold leading-[1.05] md:text-5xl">
              {page.hero?.headline ?? page.title}
            </h1>
            {page.hero?.subheadline ? (
              <p className="text-lg text-[var(--muted)]">{page.hero.subheadline}</p>
            ) : null}
            <CtaButtons
              primaryLabel={page.hero?.primaryCtaLabel}
              primaryHref={page.hero?.primaryCtaHref}
              secondaryLabel={page.hero?.secondaryCtaLabel}
              secondaryHref={page.hero?.secondaryCtaHref}
            />
          </div>
        </div>
      </section>

      {page.sections?.length ? (
        <section className="px-6 py-16">
          <div className="mx-auto grid w-full max-w-5xl gap-8">
            {page.sections.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <h2 className="title text-2xl font-semibold">{section.title}</h2>
                {section.body ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">{section.body}</p>
                ) : null}
                {section.bullets?.length ? (
                  <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
