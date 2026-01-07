import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Privacy Policy",
    description: "Carolina Growth privacy practices and data usage.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="title text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          We respect your privacy. This policy explains what data we collect, how we use it, and how
          we keep it secure.
        </p>
        <div className="mt-8 grid gap-6 text-sm text-[var(--muted)]">
          <div>
            <p className="font-semibold text-[var(--foreground)]">Data collected</p>
            <p>Contact information, usage analytics, and service engagement details.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Usage</p>
            <p>We use data to deliver services, improve outcomes, and report performance.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Retention</p>
            <p>Data is retained only as long as required for business and legal purposes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
