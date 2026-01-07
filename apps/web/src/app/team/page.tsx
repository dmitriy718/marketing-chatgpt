import { getTeamMembers } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Meet the Team",
    description: "Meet the multidisciplinary team behind Carolina Growth.",
    path: "/team",
  });
}

export default function TeamPage() {
  const team = getTeamMembers();
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Meet the team
        </p>
        <h1 className="title mt-3 text-4xl font-semibold">Operators, strategists, and builders.</h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          Our pods mix strategy, creative, and technical specialists so every deliverable launches
          with purpose.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {team.map((member) => (
            <div key={member.name} className="glass rounded-3xl p-6">
              <h3 className="title text-xl font-semibold">{member.name}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{member.role}</p>
              <p className="mt-4 text-sm">Focus: {member.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
