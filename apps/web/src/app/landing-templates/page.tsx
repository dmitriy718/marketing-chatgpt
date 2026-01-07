import Link from "next/link";

import { LandingTemplateGallery } from "@/components/LandingTemplateGallery";
import { getLandingTemplates } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Landing Template Gallery",
    description: "Browse landing page templates built for conversion and local growth.",
    path: "/landing-templates",
  });
}

export default function LandingTemplatesPage() {
  const templates = getLandingTemplates();

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Landing templates
            </p>
            <h1 className="title text-4xl font-semibold">
              Pick a landing page template built to convert.
            </h1>
            <p className="text-base text-[var(--muted)]">
              Explore our gallery of landing page templates designed for local growth, pipeline
              capture, and conversion clarity. Filter by industry or focus to find the best fit.
            </p>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
              Want a custom template?{" "}
              <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=landing-templates">
                Book a landing page consult →
              </Link>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="title text-2xl font-semibold">Template pack includes</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {[
                "Conversion-focused layout",
                "Copy blocks and CTA guidance",
                "Industry proof + trust sections",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <LandingTemplateGallery templates={templates} />
      </div>
    </section>
  );
}
