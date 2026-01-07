import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Cookie Settings",
    description: "Manage cookie preferences for Carolina Growth.",
    path: "/cookies",
  });
}

export default function CookiesPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="title text-4xl font-semibold">Cookie Settings</h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          We use cookies to personalize experiences and measure performance. Adjust preferences at
          any time.
        </p>
        <div className="mt-8 grid gap-6 text-sm">
          {[
            { title: "Essential", copy: "Required for basic site functionality." },
            { title: "Analytics", copy: "Helps us understand engagement and optimize." },
            { title: "Marketing", copy: "Supports remarketing and campaign attribution." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-2 text-[var(--muted)]">{item.copy}</p>
              <button className="mt-4 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
