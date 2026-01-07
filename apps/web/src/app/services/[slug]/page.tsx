import Link from "next/link";
import { notFound } from "next/navigation";

import { getServiceBySlug, getServices, getSiteSettings } from "@/lib/content";
import { buildServiceSchema, getBaseUrl, getDefaultSeoSettings } from "@/lib/seo";

type ServiceParams = { slug: string };

export function generateStaticParams() {
  return getServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<ServiceParams> }) {
  const resolvedParams = await params;
  const service = getServiceBySlug(resolvedParams.slug);
  if (!service) {
    return {
      title: "Service",
    };
  }
  const baseUrl = getBaseUrl();
  return {
    title: service.metaTitle ?? service.title,
    description: service.metaDescription ?? service.summary,
    alternates: {
      canonical: `${baseUrl}/services/${service.slug}`,
    },
    openGraph: {
      title: service.metaTitle ?? service.title,
      description: service.metaDescription ?? service.summary,
      url: `${baseUrl}/services/${service.slug}`,
    },
    twitter: {
      title: service.metaTitle ?? service.title,
      description: service.metaDescription ?? service.summary,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<ServiceParams> }) {
  const resolvedParams = await params;
  const service = getServiceBySlug(resolvedParams.slug);
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);

  if (!service) {
    notFound();
  }

  const serviceSchema = buildServiceSchema(service, seo);

  return (
    <>
      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            href="/services"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]"
          >
            Back to services
          </Link>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                {service.kicker}
              </p>
              <h1 className="title mt-3 text-4xl font-semibold">{service.title}</h1>
              <p className="mt-4 text-base text-[var(--muted)]">
                {service.description ?? service.summary}
              </p>
              <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  Outcomes
                </p>
                <ul className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
                  {(service.deliverables ?? []).map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="glass flex flex-col gap-6 rounded-3xl p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  Included
                </p>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Strategic workshops, execution sprints, and weekly performance reviews tailored
                  to your market.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
                Timeline: 6-12 weeks initial build, then optimization cycles.
              </div>
              <Link
                href="/contact?utm_source=site&utm_medium=cta&utm_campaign=service"
                className="btn-primary rounded-full px-5 py-3 text-sm font-semibold text-center"
              >
                Start with this service
              </Link>
            </div>
          </div>
        </div>
      </section>
      <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
    </>
  );
}
