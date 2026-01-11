"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type ComparisonResult = {
  user: {
    url: string;
    score: number;
    summary: Record<string, unknown>;
  };
  competitors: Array<{
    url: string;
    score: number | null;
    error?: string;
  }>;
  comparison: {
    your_score: number;
    avg_competitor_score: number;
    max_competitor_score: number;
    rank: string;
    gaps: Array<{
      metric: string;
      urgency: string;
      [key: string]: unknown;
    }>;
    recommendation: string;
  };
};

export function CompetitorComparisonPageClient() {
  const [url, setUrl] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter your website URL");
      return;
    }

    const validCompetitors = competitors.filter((c) => c.trim());
    if (validCompetitors.length === 0) {
      setError("Please enter at least one competitor URL");
      return;
    }

    setLoading(true);

    try {
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const normalizedCompetitors = validCompetitors.map((c) =>
        c.startsWith("http") ? c : `https://${c}`
      );

      const response = await fetch("/api/competitor/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_url: normalizedUrl,
          competitor_urls: normalizedCompetitors,
          email: email || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Comparison failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compare websites");
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, ""]);
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="title text-4xl font-semibold">Competitor Comparison Tool</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Compare your website&apos;s SEO performance against up to 5 competitors. Get actionable insights on where you&apos;re winning and where you need to improve.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold">
              Your Website URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Competitor URLs (up to 5)</label>
            <div className="mt-2 grid gap-2">
              {competitors.map((competitor, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={competitor}
                    onChange={(e) => updateCompetitor(index, e.target.value)}
                    placeholder={`https://competitor${index + 1}.com`}
                    className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                    required={index === 0}
                  />
                  {competitors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCompetitor(index)}
                      className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            {competitors.length < 5 && (
              <button
                type="button"
                onClick={addCompetitor}
                className="mt-2 text-sm font-semibold text-[var(--primary)]"
              >
                + Add competitor
              </button>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
              Email (for full report)
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
            {loading ? "Comparing..." : "Compare Websites"}
          </button>
        </form>

        {result && (
          <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  Your Score
                </p>
                <p className="mt-2 text-5xl font-bold">{result.comparison.your_score}/100</p>
              </div>
              <div className="text-right text-sm text-[var(--muted)]">
                <p>Average Competitor: {result.comparison.avg_competitor_score}/100</p>
                <p className="mt-1">Your Rank: {result.comparison.rank}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <p className="font-semibold">Recommendation</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{result.comparison.recommendation}</p>
            </div>

            {result.comparison.gaps.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Key Gaps</h3>
                <div className="grid gap-3">
                  {result.comparison.gaps.map((gap, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                    >
                      <p className="font-semibold">{gap.metric}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">Urgency: {gap.urgency}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
