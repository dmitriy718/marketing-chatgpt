"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function CompetitiveIntelligencePage() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim() || !email.trim()) {
      setError("Please enter both URL and email");
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
          email: email.trim(),
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Report generation failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="title text-4xl font-bold">Competitive Intelligence Report</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Get a comprehensive analysis of any website's marketing strategy, SEO, and competitive positioning.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <div className="grid gap-6">
              <div>
                <label htmlFor="url" className="mb-2 block text-sm font-semibold">
                  Website URL to Analyze *
                </label>
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="competitor.com or https://competitor.com"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Your Email * (Report will be sent here)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-[var(--muted)]">
                  We'll send you a detailed intelligence report via email
                </p>
              </div>

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
                {loading ? "Generating Report..." : "Generate Intelligence Report"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold">Report Generated!</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                A detailed report has been sent to {email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
                <h3 className="mb-2 font-semibold">SEO Score</h3>
                <p className="text-3xl font-bold">{result.seo_score}/100</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
                <h3 className="mb-2 font-semibold">Social Presence</h3>
                <p>{result.social_presence.social_links_found} social links found</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Platforms: {result.social_presence.platforms.join(", ") || "None detected"}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
                <h3 className="mb-2 font-semibold">Key Recommendations</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
              <p className="mb-4 font-semibold">Want a comprehensive competitive analysis?</p>
              <a
                href="/contact"
                className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
              >
                Book Free Consultation
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
