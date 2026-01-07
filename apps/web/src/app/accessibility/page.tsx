import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Accessibility",
    description: "Accessibility statement for Carolina Growth.",
    path: "/accessibility",
  });
}

export default function AccessibilityPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Accessibility
        </p>
        <h1 className="title mt-3 text-4xl font-semibold">Our accessibility commitment.</h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          We are committed to providing a website that is accessible to the widest possible
          audience, regardless of technology or ability. We aim to conform to WCAG 2.2 AA
          guidelines and continuously improve the experience.
        </p>
        <div className="mt-8 grid gap-4 text-sm text-[var(--muted)]">
          <p>
            If you experience difficulty accessing any part of the site, please contact us at
            hello@carolinagrowth.co and we will assist you promptly.
          </p>
          <p>Last reviewed: January 2026.</p>
        </div>
      </div>
    </section>
  );
}
