import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Terms of Service",
    description: "Carolina Growth terms of service.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="title text-4xl font-semibold">Terms of Service</h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          These terms outline engagement expectations, deliverables, and legal protections for both
          parties.
        </p>
        <div className="mt-8 grid gap-6 text-sm text-[var(--muted)]">
          <div>
            <p className="font-semibold text-[var(--foreground)]">Engagement</p>
            <p>Scopes, timelines, and payment terms are detailed in each statement of work.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Confidentiality</p>
            <p>We protect client data and require the same for shared materials.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Liability</p>
            <p>Our responsibility is limited to the scope of services agreed upon.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
