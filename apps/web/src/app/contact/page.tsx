import Link from "next/link";

import { ContactForm } from "@/components/ContactForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Contact",
    description: "Book a strategy call with Carolina Growth.",
    path: "/contact",
  });
}

export default function ContactPage() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Contact
        </p>
        <h1 className="title mt-3 text-4xl font-semibold">Let’s build your growth plan.</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--muted)]">
          Tell us about your goals, current marketing stack, and timeline. We’ll respond within one
          business day.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ContactForm />
          <div className="glass flex flex-col gap-6 rounded-3xl p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Next steps
              </p>
              <p className="mt-3 text-sm text-[var(--muted)]">
                We’ll schedule a discovery call, audit your current marketing, then propose a growth
                roadmap.
              </p>
            </div>
            {bookingUrl ? (
              <Link
                href={bookingUrl}
                className="btn-secondary rounded-full px-5 py-2 text-sm font-semibold text-center"
              >
                Book a call
              </Link>
            ) : null}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
              Email: hello@carolinagrowth.co
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
              Phone: (000) 000-0000
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
