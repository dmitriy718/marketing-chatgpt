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

export default function SeoAuditPage() {
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="title text-4xl font-bold">Free SEO Website Auditor</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Get an instant SEO analysis of any website. Discover issues and opportunities to improve your search rankings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="grid gap-6">
            <div>
              <label htmlFor="url" className="mb-2 block text-sm font-semibold">
                Website URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com or https://example.com"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                required
                disabled={loading}
              />
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
                  Get a detailed PDF report delivered to your inbox
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
              {loading ? "Analyzing..." : "Audit Website"}
            </button>
          </div>
        </form>

        {result && (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <div className="mb-8 text-center">
              <div className="mb-4">
                <span className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </span>
                <span className="ml-2 text-2xl text-[var(--muted)]">/ 100</span>
              </div>
              <h2 className="text-2xl font-semibold">SEO Score</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {result.cached ? "Cached result" : "Analysis complete"}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Findings</h3>
              <div className="grid gap-3">
                {result.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 ${
                      finding.type === "error"
                        ? "border-red-300 bg-red-50"
                        : finding.type === "warning"
                        ? "border-yellow-300 bg-yellow-50"
                        : finding.type === "info"
                        ? "border-blue-300 bg-blue-50"
                        : "border-green-300 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getFindingIcon(finding.type)}</span>
                      <div className="flex-1">
                        <p className="font-semibold capitalize">{finding.category}</p>
                        <p className="mt-1 text-sm">{finding.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.summary && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
                <h3 className="mb-4 text-lg font-semibold">Summary</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Total Images:</span>
                    <span className="font-semibold">{result.summary.total_images}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Images Missing Alt Text:</span>
                    <span className="font-semibold">{result.summary.images_without_alt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Total Links:</span>
                    <span className="font-semibold">{result.summary.total_links}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Internal Links:</span>
                    <span className="font-semibold">{result.summary.internal_links}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Structured Data:</span>
                    <span className="font-semibold">
                      {result.summary.has_structured_data ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {result.score < 70 && (
              <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
                <p className="mb-4 font-semibold">Need help improving your SEO score?</p>
                <a
                  href="/contact"
                  className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
                >
                  Get Expert Help
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
