"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type IntelligenceResult = {
  url: string;
  report: {
    overview: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
  };
  cached?: boolean;
};

export function CompetitiveIntelligencePageClient() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);

    try {
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = await fetch("/api/intelligence/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          email: email || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Report generation failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate intelligence report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="title text-4xl font-semibold">Competitive Intelligence Report</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Get a comprehensive competitive intelligence report for any website. Analyze market positioning, content strategy, SEO performance, and identify opportunities to outperform competitors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold">
              Website URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
              Email (for full PDF report)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </div>

          <TurnstileWidget
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />

          {error && (
            <div className="rounded-2xl border border-red-500 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Generating Report..." : "Generate Intelligence Report"}
          </button>
        </form>

        {result && (
          <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Intelligence Report
              </p>
              <p className="mt-2 text-lg font-semibold">{result.url}</p>
              {result.cached && <p className="mt-1 text-xs text-[var(--muted)]">(Cached result)</p>}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <p className="font-semibold">Overview</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{result.report.overview}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Strengths</h3>
                <ul className="grid gap-2">
                  {result.report.strengths.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                      <span className="text-green-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold">Weaknesses</h3>
                <ul className="grid gap-2">
                  {result.report.weaknesses.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                      <span className="text-red-600">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Opportunities</h3>
                <ul className="grid gap-2">
                  {result.report.opportunities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                      <span className="text-blue-600">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold">Threats</h3>
                <ul className="grid gap-2">
                  {result.report.threats.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                      <span className="text-orange-600">⚠</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result.report.recommendations.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">Recommendations</h3>
                <ul className="grid gap-2">
                  {result.report.recommendations.map((item, index) => (
                    <li key={index} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
