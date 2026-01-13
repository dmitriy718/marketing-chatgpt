"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type Keyword = {
  keyword: string;
  search_volume?: number;
  difficulty?: number;
  cpc?: number;
  competition?: string;
  intent?: string;
};

type ResearchResult = {
  seed_keyword: string;
  total_keywords: number;
  keywords: Keyword[];
  ok?: boolean;
  error?: string;
};

export function KeywordResearchPageClient() {
  const [seedKeyword, setSeedKeyword] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"volume" | "difficulty" | "cpc">("volume");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!seedKeyword.trim() || seedKeyword.trim().length < 2) {
      setError("Please enter a keyword (at least 2 characters)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/keyword-research/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedKeyword: seedKeyword.trim(),
          email: email || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Research failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to research keywords");
    } finally {
      setLoading(false);
    }
  };

  const sortedKeywords = result?.keywords
    ? [...result.keywords].sort((a, b) => {
        if (sortBy === "volume") {
          return (b.search_volume || 0) - (a.search_volume || 0);
        } else if (sortBy === "difficulty") {
          return (a.difficulty || 0) - (b.difficulty || 0);
        } else {
          return (b.cpc || 0) - (a.cpc || 0);
        }
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="title text-4xl font-bold mb-4">Keyword Research Tool</h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
          Discover high-value keywords for your SEO strategy. Get keyword suggestions, search volume estimates, and competition analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-2xl p-8 shadow-lg mb-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium mb-2">
              Seed Keyword
            </label>
            <input
              id="keyword"
              type="text"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              placeholder="e.g., digital marketing"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>

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
            {loading ? "Researching..." : "Research Keywords"}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Research Results</h2>
              <p className="text-[var(--muted)]">
                Found {result.total_keywords} keywords for &quot;{result.seed_keyword}&quot;
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--muted)]">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "volume" | "difficulty" | "cpc")}
                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="volume">Search Volume</option>
                <option value="difficulty">Difficulty</option>
                <option value="cpc">CPC</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 font-semibold">Keyword</th>
                  <th className="text-right py-3 px-4 font-semibold">Volume</th>
                  <th className="text-right py-3 px-4 font-semibold">Difficulty</th>
                  <th className="text-right py-3 px-4 font-semibold">CPC</th>
                  <th className="text-center py-3 px-4 font-semibold">Competition</th>
                  <th className="text-center py-3 px-4 font-semibold">Intent</th>
                </tr>
              </thead>
              <tbody>
                {sortedKeywords.map((keyword, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--background)]">
                    <td className="py-3 px-4 font-medium">{keyword.keyword}</td>
                    <td className="py-3 px-4 text-right">{keyword.search_volume?.toLocaleString() || "N/A"}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        (keyword.difficulty || 0) < 30 ? "bg-green-500/20 text-green-500" :
                        (keyword.difficulty || 0) < 70 ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-red-500/20 text-red-500"
                      }`}>
                        {keyword.difficulty || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">${keyword.cpc?.toFixed(2) || "N/A"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        keyword.competition === "low" ? "bg-green-500/20 text-green-500" :
                        keyword.competition === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-red-500/20 text-red-500"
                      }`}>
                        {keyword.competition || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-[var(--muted)]">
                      {keyword.intent || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
