import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "About",
    description: "Meet the team and philosophy behind Carolina Growth.",
    path: "/about",
  });
}

export default function AboutPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          About us
        </p>
        <h1 className="title mt-3 text-4xl font-semibold">
          A performance studio obsessed with local momentum.
        </h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          Carolina Growth blends brand strategy, growth marketing, and CRM intelligence to give local
          businesses a competitive edge. Our teams stay embedded with clients, translating market
          signals into weekly actions.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Strategy First",
              copy: "Every engagement begins with research and positioning before activation.",
            },
            {
              title: "Performance Always",
              copy: "We track the numbers that matter and adjust fast.",
            },
            {
              title: "Human-Centered",
              copy: "Real people, real businesses, and transparent collaboration.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="title text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--muted)]">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
