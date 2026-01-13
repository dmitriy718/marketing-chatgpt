"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type Backlink = {
  source_url: string;
  target_url: string;
  anchor_text?: string;
  link_type?: string;
  domain_authority?: number;
};

type AnalysisResult = {
  url: string;
  quality_score: number;
  total_backlinks: number;
  referring_domains: number;
  backlinks: Backlink[];
  top_domains: string[];
  ok?: boolean;
  error?: string;
};

export function BacklinkAnalyzerPageClient() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
      const response = await fetch("/api/backlink/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          email: email || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      if (data.quality_score < 50 && !email) {
        setShowEmail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze backlinks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="title text-4xl font-bold mb-4">Backlink Analyzer</h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
          Analyze your website&apos;s backlink profile, identify linking opportunities, and get actionable insights for link building campaigns.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-2xl p-8 shadow-lg mb-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>

          {showEmail && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email (optional - for full report)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          )}

          <TurnstileWidget
            onVerify={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken(null)}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="w-full bg-[var(--accent)] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Analyze Backlinks"}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
            <p className="text-[var(--muted)]">For {result.url}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--background)] p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-[var(--accent)] mb-2">
                {result.quality_score}
              </div>
              <div className="text-sm text-[var(--muted)]">Quality Score</div>
            </div>
            <div className="bg-[var(--background)] p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-[var(--accent)] mb-2">
                {result.total_backlinks}
              </div>
              <div className="text-sm text-[var(--muted)]">Total Backlinks</div>
            </div>
            <div className="bg-[var(--background)] p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-[var(--accent)] mb-2">
                {result.referring_domains}
              </div>
              <div className="text-sm text-[var(--muted)]">Referring Domains</div>
            </div>
          </div>

          {result.top_domains && result.top_domains.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Top Referring Domains</h3>
              <ul className="space-y-2">
                {result.top_domains.map((domain, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <span>{domain}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.backlinks && result.backlinks.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Sample Backlinks</h3>
              <div className="space-y-4">
                {result.backlinks.slice(0, 10).map((backlink, idx) => (
                  <div key={idx} className="bg-[var(--background)] p-4 rounded-lg">
                    <div className="text-sm text-[var(--muted)] mb-1">
                      {backlink.source_url}
                    </div>
                    {backlink.anchor_text && (
                      <div className="font-medium">Anchor: {backlink.anchor_text}</div>
                    )}
                    {backlink.link_type && (
                      <div className="text-xs text-[var(--muted)] mt-1">
                        Type: {backlink.link_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
