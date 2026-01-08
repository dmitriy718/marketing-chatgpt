import Link from "next/link";

import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Web Design",
    description:
      "Premium web design with flexible rentals or one-time builds for local businesses.",
    path: "/web-design",
  });
}

const rentalPlans = [
  {
    name: "Starter Rental",
    price: "$149/mo",
    prepay: "$1,488/yr",
    monthlyPlanKey: "web_design_starter_rental_monthly",
    annualPlanKey: "web_design_starter_rental_annual",
    summary: "Perfect for small shops that need a polished local presence fast.",
    bullets: [
      "Up to 3 core pages",
      "Hosting, updates, and security",
      "Local SEO foundation",
      "5 catalog updates/mo",
    ],
  },
  {
    name: "Growth Rental",
    price: "$299/mo",
    prepay: "$2,990/yr",
    monthlyPlanKey: "web_design_growth_rental_monthly",
    annualPlanKey: "web_design_growth_rental_annual",
    summary: "For teams who want conversion-ready pages and consistent updates.",
    bullets: [
      "Up to 8 pages",
      "Conversion-focused sections",
      "Review + map optimization",
      "10 catalog updates/mo",
    ],
  },
  {
    name: "Storefront Rental",
    price: "$499/mo",
    prepay: "$4,990/yr",
    monthlyPlanKey: "web_design_storefront_rental_monthly",
    annualPlanKey: "web_design_storefront_rental_annual",
    summary: "A premium rental for bigger catalogs and higher traffic goals.",
    bullets: [
      "Up to 15 pages",
      "Catalog up to 50 items",
      "Priority updates",
      "20 catalog updates/mo",
    ],
  },
];

const purchasePlans = [
  {
    name: "Premium Build",
    price: "$1,800",
    planKey: "web_design_premium_build",
    summary: "Own your site outright with a fast, modern build.",
    bullets: [
      "Up to 8 pages",
      "Launch-ready SEO",
      "Analytics + forms",
      "30 days support",
    ],
  },
  {
    name: "Flagship Build",
    price: "$3,500",
    planKey: "web_design_flagship_build",
    summary: "Full custom build with deeper content and polish.",
    bullets: [
      "Up to 15 pages",
      "Content migration",
      "Conversion copy polish",
      "60 days support",
    ],
  },
];

export default function WebDesignPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-12">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Web design + rentals
            </p>
            <h1 className="title text-4xl font-semibold">
              Premium web design for local South Carolina businesses.
            </h1>
            <p className="text-base text-[var(--muted)]">
              Choose a flexible rental plan or buy your site outright. Rentals include hosting,
              maintenance, and catalog updates so you never have to worry about upkeep.
            </p>
            <div className="grid gap-3 text-sm text-[var(--muted)]">
              {[
                "Modern design tailored to your niche",
                "Fast performance and mobile-first layouts",
                "Clear calls to action that drive leads",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] p-4">
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
              Want help choosing?{" "}
              <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=web-design-hero">
                Book a quick consult →
              </Link>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="title text-2xl font-semibold">Rental vs. purchase</h2>
            <ul className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Rentals include hosting, updates, and catalog management.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Purchase gives full ownership; ongoing edits are on your team.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Pay monthly or prepay the rental for the year to save.
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="title text-2xl font-semibold">Website rental plans</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              monthly or annual prepay
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {rentalPlans.map((plan) => (
              <div key={plan.name} className="glass rounded-3xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {plan.name}
                </p>
                <p className="mt-3 text-3xl font-semibold">{plan.price}</p>
                <p className="text-xs text-[var(--muted)]">Or {plan.prepay} prepaid</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{plan.summary}</p>
                <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                  {plan.bullets.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?utm_source=site&utm_medium=cta&utm_campaign=web-design-rentals"
                  className="btn-primary mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Start rental
                </Link>
                <div className="mt-3 grid gap-2">
                  <Link
                    href={`/checkout?plan=${plan.monthlyPlanKey}`}
                    className="btn-secondary inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    Pay monthly
                  </Link>
                  <Link
                    href={`/checkout?plan=${plan.annualPlanKey}`}
                    className="btn-secondary inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    Pay annually
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="title text-2xl font-semibold">Purchase plans</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              one-time build
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {purchasePlans.map((plan) => (
              <div key={plan.name} className="glass rounded-3xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {plan.name}
                </p>
                <p className="mt-3 text-3xl font-semibold">{plan.price}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{plan.summary}</p>
                <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                  {plan.bullets.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?utm_source=site&utm_medium=cta&utm_campaign=web-design-purchase"
                  className="btn-secondary mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Buy outright
                </Link>
                <Link
                  href={`/checkout?plan=${plan.planKey}`}
                  className="btn-primary mt-3 inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Pay now
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <h2 className="title text-2xl font-semibold">Need premium branding + web design?</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                We can combine web design, brand identity, and local SEO into one launch plan. Tell
                us what you sell and we will tailor the right mix for your budget.
              </p>
            </div>
            <Link
              href="/contact?utm_source=site&utm_medium=cta&utm_campaign=web-design-footer"
              className="btn-primary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
            >
              Talk to the team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
