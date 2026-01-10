import Link from "next/link";

import { CtaButtons } from "@/components/CtaButtons";
import { LeadMagnetForm } from "@/components/LeadMagnetForm";
import {
  getLeadMagnets,
  getPortfolioItems,
  getReviews,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "@/lib/content";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  getDefaultSeoSettings,
} from "@/lib/seo";

export default function Home() {
  const services = getServices();
  const portfolioItems = getPortfolioItems();
  const testimonials = getTestimonials();
  const reviews = getReviews();
  const leadMagnets = getLeadMagnets();
  const leadMagnet = leadMagnets[0];
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const organizationSchema = buildOrganizationSchema(seo);
  const websiteSchema = buildWebSiteSchema(seo);

  return (
    <div className="text-[15px]">
      <section className="relative overflow-hidden px-6 pb-16 pt-16">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="fade-in flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--muted)]">
              Local growth studio
            </p>
            <h1 className="title text-4xl font-semibold leading-[1.05] md:text-6xl">
              The marketing engine that makes local brands feel global.
            </h1>
            <p className="text-lg text-[var(--muted)]">
              We blend performance media, SEO, and conversion design to build predictable growth
              systems for local businesses ready to scale.
            </p>
            <CtaButtons
              primaryLabel="Schedule a Strategy Call"
              primaryHref="/contact?utm_source=site&utm_medium=cta&utm_campaign=hero"
              secondaryLabel="View Portfolio"
              secondaryHref="/portfolio"
            />
            <div className="flex flex-wrap gap-6 text-sm text-[var(--muted)]">
              <span>+42% avg. pipeline lift</span>
              <span>12+ retained industries</span>
              <span>24/7 analytics signal stack</span>
            </div>
          </div>
          <div className="glass drift relative flex flex-col justify-between gap-8 rounded-3xl p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Live growth signals
              </p>
              <h2 className="title mt-3 text-2xl font-semibold">
                Your market, instrumented in real time.
              </h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                We connect CRM, ad platforms, and on-site behavior into a single conversion cockpit.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Conversion rate", value: "7.8%" },
                { label: "Lead velocity", value: "+64%" },
                { label: "CAC", value: "-22%" },
                { label: "Pipeline value", value: "$1.4M" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Services
              </p>
              <h2 className="title mt-3 text-3xl font-semibold">Built for every stage of growth.</h2>
            </div>
            <Link
              href="/services?utm_source=site&utm_medium=link&utm_campaign=home-services"
              className="btn-secondary rounded-full px-5 py-2 text-sm font-semibold"
            >
              Explore services
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}?utm_source=site&utm_medium=link&utm_campaign=home-service-card`}
                className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  {service.kicker}
                </p>
                <h3 className="title mt-3 text-xl font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">{service.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  Learn more
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Growth model
            </p>
            <h2 className="title mt-3 text-2xl font-semibold">
              Research. Position. Accelerate.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              We start with market intelligence, craft differentiated messaging, then build multichannel
              demand engines that stay profitable.
            </p>
            <div className="mt-6 grid gap-4 text-sm text-[var(--muted)]">
              <div className="flex items-center justify-between">
                <span>Strategy + Research</span>
                <span className="text-[var(--foreground)]">02 weeks</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Activation + Launch</span>
                <span className="text-[var(--foreground)]">04 weeks</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Optimization + Scale</span>
                <span className="text-[var(--foreground)]">Ongoing</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              CRM ready
            </p>
            <h2 className="title mt-3 text-2xl font-semibold">Your pipeline, visible and protected.</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Our custom CRM layer combines lead scoring, conversation history, and revenue forecasting
              so your team can act with confidence.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Unified customer timeline",
                "Smart lead routing",
                "Revenue forecasting",
                "Automated review responses",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] p-4 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Portfolio
              </p>
              <h2 className="title mt-3 text-3xl font-semibold">Proof of momentum.</h2>
            </div>
            <Link href="/portfolio?utm_source=site&utm_medium=link&utm_campaign=home-portfolio" className="text-sm font-semibold text-[var(--primary)]">
              View all case studies →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {portfolioItems.map((item) => (
              <div key={item.title} className="glass rounded-3xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  {item.focus}
                </p>
                <h3 className="title mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm text-[var(--muted)]">{item.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Client notes
              </p>
              <h2 className="title mt-3 text-3xl font-semibold">What partners say after launch.</h2>
            </div>
            <span className="text-sm text-[var(--muted)]">4.9 average satisfaction</span>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.author} className="glass rounded-3xl p-6 text-sm">
                <p className="text-[var(--muted)]">“{item.quote}”</p>
                <p className="mt-4 font-semibold">
                  {item.author}
                  {item.company ? `, ${item.company}` : ""}
                </p>
                {item.role ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                    {item.role}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {reviews.length ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <div
                  key={`${review.source}-${review.quote}`}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                    {review.source} • {review.rating.toFixed(1)}
                  </p>
                  <p className="mt-3 text-[var(--muted)]">“{review.quote}”</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-10 text-[var(--background)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Ready to scale
              </p>
              <h2 className="title mt-3 text-3xl font-semibold">
                Turn your next quarter into your best.
              </h2>
            </div>
            <Link
              href="/contact?utm_source=site&utm_medium=cta&utm_campaign=footer"
              className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[#0b0e12]"
            >
              Get a growth plan
            </Link>
          </div>
        </div>
      </section>

      {leadMagnet ? (
        <section className="px-6 pb-20">
          <div className="mx-auto w-full max-w-6xl">
            <LeadMagnetForm
              title={leadMagnet.title}
              description={leadMagnet.description}
              downloadUrl={leadMagnet.downloadUrl}
            />
          </div>
        </section>
      ) : null}

      <script type="application/ld+json">
        {JSON.stringify([organizationSchema, websiteSchema])}
      </script>
    </div>
  );
}
