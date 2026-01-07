"use client";

import { useState } from "react";

import type { PortfolioItem } from "@/lib/content";

type CaseStudySliderProps = {
  items: PortfolioItem[];
};

function formatMetric(value: number, prefix?: string | null, suffix?: string | null) {
  const formatter = Number.isInteger(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
  return `${prefix ?? ""}${formatter.format(value)}${suffix ?? ""}`;
}

export function CaseStudySlider({ items }: CaseStudySliderProps) {
  const [progress, setProgress] = useState<Record<string, number>>({});

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const metrics = item.metrics;
        if (!metrics) {
          return null;
        }
        const current = progress[item.title] ?? 70;
        const value = metrics.before + (metrics.after - metrics.before) * (current / 100);

        return (
          <div
            key={item.title}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              {item.focus}
            </p>
            <h3 className="title mt-3 text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.result}</p>
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {metrics.label}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatMetric(value, metrics.prefix, metrics.suffix)}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Before: {formatMetric(metrics.before, metrics.prefix, metrics.suffix)}</span>
                <span>After: {formatMetric(metrics.after, metrics.prefix, metrics.suffix)}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <label className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Progress slider
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={current}
                onChange={(event) =>
                  setProgress((prev) => ({
                    ...prev,
                    [item.title]: Number(event.target.value),
                  }))
                }
              />
              {item.timeframe ? (
                <p className="text-xs text-[var(--muted)]">Timeline: {item.timeframe}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
