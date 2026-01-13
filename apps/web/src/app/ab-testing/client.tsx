"use client";

import { useState } from "react";

type TestResult = {
  variant_key: string;
  name: string;
  visitors: number;
  conversions: number;
  conversion_rate: number;
};

type TestResults = {
  test_id: string;
  results: TestResult[];
};

export function ABTestingPageClient() {
  const [testId, setTestId] = useState("");
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetResults = async () => {
    if (!testId.trim()) {
      setError("Please enter a test ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ab-testing/results?testId=${testId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get results");
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="title text-4xl font-bold mb-4">A/B Testing Platform</h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
          Test variations of landing pages, email campaigns, and CTAs. Get statistical significance calculations and determine winners.
        </p>
      </div>

      <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-6">View Test Results</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="testId" className="block text-sm font-medium mb-2">
              Test ID
            </label>
            <div className="flex gap-2">
              <input
                id="testId"
                type="text"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="Enter test ID"
                className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <button
                onClick={handleGetResults}
                disabled={loading}
                className="bg-[var(--accent)] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Loading..." : "Get Results"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg space-y-6">
          <h2 className="text-2xl font-bold">Test Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.results.map((result, idx) => (
              <div key={idx} className="bg-[var(--background)] p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">{result.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Visitors:</span>
                    <span className="font-semibold">{result.visitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Conversions:</span>
                    <span className="font-semibold">{result.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Conversion Rate:</span>
                    <span className="font-semibold text-[var(--accent)]">
                      {result.conversion_rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg mt-8">
        <h2 className="text-2xl font-bold mb-4">About A/B Testing</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            Our A/B testing platform allows you to test different variations of your landing pages, 
            email campaigns, and CTAs to determine which performs better.
          </p>
          <p>
            To create and manage tests, please contact our team or use the CRM dashboard if you have access.
          </p>
        </div>
      </div>
    </div>
  );
}
