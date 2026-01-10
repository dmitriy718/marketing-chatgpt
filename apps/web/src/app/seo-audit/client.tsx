"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { verifyTurnstileToken } from "@/lib/turnstile";

type Finding = {
  type: "error" | "warning" | "info" | "success";
  category: string;
  message: string;
};

type AuditResult = {
  url: string;
  score: number;
  findings: Finding[];
  summary?: {
    total_images: number;
    images_without_alt: number;
    total_links: number;
    internal_links: number;
    has_structured_data: boolean;
  };
  cached?: boolean;
};

export function SeoAuditPageClient() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = await fetch("/api/seo/audit", {
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
        throw new Error(data.error || data.detail || "Audit failed");
      }

      setResult(data);
      if (data.score < 70 && !email) {
        setShowEmail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to audit website");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getFindingIcon = (type: string) => {
    switch (type) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      default:
        return "•";
    }
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="title text-4xl font-semibold">Free SEO Website Auditor</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Get an instant SEO score (0-100) for any website with actionable recommendations to improve search engine rankings.
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

          {showEmail && (
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
          )}

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
            {loading ? "Analyzing..." : "Analyze Website"}
          </button>
        </form>

        {result && (
          <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  SEO Score
                </p>
                <p className={`mt-2 text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}/100
                </p>
              </div>
              <div className="text-right text-sm text-[var(--muted)]">
                <p>Analyzed: {result.url}</p>
                {result.cached && <p className="mt-1">(Cached result)</p>}
              </div>
            </div>

            {result.summary && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Images</p>
                  <p className="mt-2 text-xl font-semibold">
                    {result.summary.images_without_alt} / {result.summary.total_images} missing alt text
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Links</p>
                  <p className="mt-2 text-xl font-semibold">
                    {result.summary.internal_links} internal links
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Structured Data
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {result.summary.has_structured_data ? "✅ Present" : "❌ Missing"}
                  </p>
                </div>
              </div>
            )}

            {result.findings.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Findings</h3>
                <div className="grid gap-3">
                  {result.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                    >
                      <span className="text-xl">{getFindingIcon(finding.type)}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{finding.category}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{finding.message}</p>
                      </div>
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
