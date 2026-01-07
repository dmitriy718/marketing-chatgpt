import Link from "next/link";

import { getServices, getSiteSettings } from "@/lib/content";
import { buildServiceListSchema, getBaseUrl, getDefaultSeoSettings } from "@/lib/seo";

export function generateMetadata() {
  const baseUrl = getBaseUrl();
  const title = "Services";
  const description = "Explore the Carolina Growth services built for local business growth.";

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/services` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/services`,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function ServicesPage() {
  const services = getServices();
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const serviceListSchema = buildServiceListSchema(services, seo);

  return (
    <>
      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Services
          </p>
          <h1 className="title mt-3 text-4xl font-semibold">Growth systems, built to fit.</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
            Every engagement is customized to your market and revenue targets. Explore our core
            service lines and see how they connect into one conversion engine.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="glass group rounded-3xl p-6 transition hover:-translate-y-1"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  {service.kicker}
                </p>
                <h2 className="title mt-3 text-xl font-semibold">{service.title}</h2>
                <p className="mt-3 text-sm text-[var(--muted)]">{service.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  Service details <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json">{JSON.stringify(serviceListSchema)}</script>
    </>
  );
}
