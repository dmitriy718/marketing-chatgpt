import Link from "next/link";

import { GrowthSprintForm } from "@/components/GrowthSprintForm";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "4-Week Growth Sprint",
    description:
      "Launch a focused 4-week growth sprint with strategy, execution, and conversion optimization built in.",
    path: "/growth-sprint",
  });
}

const timeline = [
  {
    week: "Week 1",
    title: "Discovery and sprint plan",
    bullets: [
      "Baseline funnel and analytics audit",
      "Channel and offer teardown",
      "Sprint KPIs, targets, and experiment list",
    ],
  },
  {
    week: "Week 2",
    title: "Build and launch",
    bullets: [
      "Landing page and conversion path updates",
      "Campaign buildout and tracking",
      "Automation handoff for leads",
    ],
  },
  {
    week: "Week 3",
    title: "Optimize and scale",
    bullets: [
      "Performance tuning across channels",
      "Creative and copy iteration",
      "Pipeline follow-up playbook",
    ],
  },
  {
    week: "Week 4",
    title: "Handoff and growth map",
    bullets: [
      "Winner recap and growth insights",
      "90-day rollout roadmap",
      "Team enablement and dashboards",
    ],
  },
];

export default function GrowthSprintPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            4-week growth sprint
          </p>
          <h1 className="title text-4xl font-semibold">Momentum in 30 days, not 90.</h1>
          <p className="text-base text-[var(--muted)]">
            We run a focused four-week sprint that unblocks your biggest growth constraint, launches
            the next conversion path, and delivers a prioritized 90-day rollout plan.
          </p>
          <div className="grid gap-4">
            {[
              "Strategy, execution, and optimization in one program",
              "Daily standups with your team and weekly leadership briefings",
              "Analytics, dashboards, and performance tracking included",
              "Clear owners, timeline, and ROI guardrails",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--border)] p-4 text-sm">
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
            Need a custom timeline?{" "}
            <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=growth-sprint">
              Book a sprint kickoff →
            </Link>
          </div>
          <div className="grid gap-4">
            <h2 className="title text-2xl font-semibold">Sprint timeline</h2>
            {timeline.map((step) => (
              <div
                key={step.week}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                    {step.week}
                  </p>
                  <p className="text-sm font-semibold">{step.title}</p>
                </div>
                <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="title text-2xl font-semibold">Request the sprint plan</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Tell us where you want to land in 30 days and we’ll map the sprint milestones.
          </p>
          <div className="mt-6">
            <GrowthSprintForm />
          </div>
        </div>
      </div>
    </section>
  );
}
