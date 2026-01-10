"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type ComparisonResult = {
  user: {
    url: string;
    score: number;
    summary: any;
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
      [key: string]: any;
    }>;
    recommendation: string;
  };
};

export default function CompetitorComparisonPage() {
  const [userUrl, setUserUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState(["", "", ""]);
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!userUrl.trim()) {
      setError("Please enter your website URL");
      return;
    }

    const validCompetitors = competitorUrls.filter((url) => url.trim());
    if (validCompetitors.length === 0) {
      setError("Please enter at least one competitor URL");
      return;
    }

    setLoading(true);

    try {
      const normalizedUserUrl = userUrl.startsWith("http") ? userUrl : `https://${userUrl}`;
      const normalizedCompetitors = validCompetitors.map((url) =>
        url.startsWith("http") ? url : `https://${url}`
      );

      const response = await fetch("/api/competitor/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_url: normalizedUserUrl,
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
      if (data.comparison.your_score < data.comparison.avg_competitor_score && !email) {
        setShowEmail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compare websites");
    } finally {
      setLoading(false);
    }
  };

  const addCompetitorField = () => {
    if (competitorUrls.length < 3) {
      setCompetitorUrls([...competitorUrls, ""]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "high") return "border-red-300 bg-red-50";
    if (urgency === "medium") return "border-yellow-300 bg-yellow-50";
    return "border-blue-300 bg-blue-50";
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="title text-4xl font-bold">Competitor Comparison Tool</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            See how your website stacks up against your competitors. Discover gaps and opportunities to get ahead.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="grid gap-6">
            <div>
              <label htmlFor="user_url" className="mb-2 block text-sm font-semibold">
                Your Website URL *
              </label>
              <input
                id="user_url"
                type="text"
                value={userUrl}
                onChange={(e) => setUserUrl(e.target.value)}
                placeholder="yourwebsite.com or https://yourwebsite.com"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Competitor URLs (up to 3) *
              </label>
              {competitorUrls.map((url, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...competitorUrls];
                    newUrls[idx] = e.target.value;
                    setCompetitorUrls(newUrls);
                  }}
                  placeholder={`Competitor ${idx + 1} URL`}
                  className="mb-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                />
              ))}
              {competitorUrls.length < 3 && (
                <button
                  type="button"
                  onClick={addCompetitorField}
                  className="mt-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  + Add another competitor
                </button>
              )}
            </div>

            {showEmail && (
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email (for full report)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Get a detailed comparison report delivered to your inbox
                </p>
              </div>
            )}

            <TurnstileWidget
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => setError("Bot verification failed")}
            />

            {error && (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="btn-primary rounded-full px-8 py-4 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Comparing..." : "Compare Websites"}
            </button>
          </div>
        </form>

        {result && (
          <div className="space-y-6">
            {/* Score Comparison */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <h2 className="mb-6 text-2xl font-semibold">Score Comparison</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
                  <p className="text-sm text-[var(--muted)]">Your Website</p>
                  <p className={`mt-2 text-5xl font-bold ${getScoreColor(result.user.score)}`}>
                    {result.user.score}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">/ 100</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
                  <p className="text-sm text-[var(--muted)]">Average Competitor</p>
                  <p
                    className={`mt-2 text-5xl font-bold ${getScoreColor(result.comparison.avg_competitor_score)}`}
                  >
                    {result.comparison.avg_competitor_score}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">/ 100</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center">
                <p className="text-lg font-semibold">
                  You're {result.comparison.rank} Your Competitors
                </p>
                {result.comparison.your_score < result.comparison.avg_competitor_score && (
                  <p className="mt-2 text-sm text-red-600">
                    You're {Math.round(result.comparison.avg_competitor_score - result.comparison.your_score)} points
                    behind the average
                  </p>
                )}
              </div>
            </div>

            {/* Gaps */}
            {result.comparison.gaps.length > 0 && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
                <h2 className="mb-6 text-2xl font-semibold">Where You're Falling Behind</h2>
                <div className="grid gap-4">
                  {result.comparison.gaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4 ${getUrgencyColor(gap.urgency)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{gap.metric}</p>
                          <p className="mt-1 text-sm">
                            {gap.urgency === "high" && "🚨 "}
                            {gap.urgency === "medium" && "⚠️ "}
                            {gap.gap && `Gap: ${gap.gap} points`}
                            {gap.your_score !== undefined &&
                              `Your score: ${gap.your_score}% vs Competitor: ${gap.competitor_score}%`}
                            {gap.your_count !== undefined &&
                              `You have ${gap.your_count} vs Competitor has ${gap.competitor_count}`}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            gap.urgency === "high"
                              ? "bg-red-100 text-red-700"
                              : gap.urgency === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {gap.urgency.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <h2 className="mb-4 text-2xl font-semibold">Recommendation</h2>
              <p className="text-lg">{result.comparison.recommendation}</p>
              {result.comparison.your_score < result.comparison.avg_competitor_score && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
                  <p className="mb-4 font-semibold">Ready to close the gap and beat your competitors?</p>
                  <a
                    href="/contact"
                    className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
                  >
                    Get Free Strategy Session
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
