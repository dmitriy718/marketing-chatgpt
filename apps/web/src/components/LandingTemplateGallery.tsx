"use client";

import { useMemo, useState } from "react";

import type { LandingTemplate } from "@/lib/content";

type LandingTemplateGalleryProps = {
  templates: LandingTemplate[];
};

type FilterState = {
  industry: string;
  focus: string;
};

const defaultFilters: FilterState = {
  industry: "All",
  focus: "All",
};

function uniqueValues(items: string[]) {
  return ["All", ...Array.from(new Set(items))];
}

export function LandingTemplateGallery({ templates }: LandingTemplateGalleryProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const industries = useMemo(
    () => uniqueValues(templates.map((template) => template.industry)),
    [templates]
  );
  const focuses = useMemo(
    () => uniqueValues(templates.map((template) => template.focus)),
    [templates]
  );

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      const matchesIndustry =
        filters.industry === "All" || template.industry === filters.industry;
      const matchesFocus = filters.focus === "All" || template.focus === filters.focus;
      return matchesIndustry && matchesFocus;
    });
  }, [filters, templates]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="grid gap-2 text-sm">
          <span className="text-[var(--muted)]">Industry</span>
          <select
            value={filters.industry}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, industry: event.target.value }))
            }
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2"
          >
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-[var(--muted)]">Primary focus</span>
          <select
            value={filters.focus}
            onChange={(event) => setFilters((prev) => ({ ...prev, focus: event.target.value }))}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2"
          >
            {focuses.map((focus) => (
              <option key={focus} value={focus}>
                {focus}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end text-sm text-[var(--muted)]">
          Showing {filtered.length} template{filtered.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <div
            key={template.title}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              {template.industry} · {template.focus}
            </p>
            <h3 className="title mt-3 text-xl font-semibold">{template.title}</h3>
            <p className="mt-3 text-sm text-[var(--muted)]">{template.summary}</p>
            {template.sections?.length ? (
              <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                {template.sections.map((section) => (
                  <li key={section} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    {section}
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
            >
              Preview template <span aria-hidden>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
