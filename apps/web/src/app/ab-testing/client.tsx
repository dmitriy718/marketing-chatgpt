"use client";

import { useState, useEffect } from "react";

type Test = {
  test_id: string;
  name: string;
  description: string | null;
  target_url: string;
  status: string;
  conversion_event: string;
  variant_count: number;
  total_visitors: number;
  created_at: string | null;
};

type TestResult = {
  variant_key: string;
  name: string;
  visitors: number;
  conversions: number;
  conversion_rate: number;
};

type TestResults = {
  test_id: string;
  test_name: string;
  test_description: string | null;
  test_status: string;
  conversion_event: string;
  results: TestResult[];
};

export function ABTestingPageClient() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ab-testing/tests");
      const data = await response.json();
      if (response.ok) {
        setTests(data.tests || []);
      } else {
        setError(data.error || "Failed to load tests");
      }
    } catch (err) {
      setError("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (testId: string) => {
    setLoadingResults(true);
    setError(null);
    try {
      const response = await fetch(`/api/ab-testing/results?testId=${testId}`);
      const data = await response.json();
      if (response.ok) {
        setResults(data);
        setSelectedTest(testId);
      } else {
        setError(data.error || "Failed to load results");
      }
    } catch (err) {
      setError("Failed to load results");
    } finally {
      setLoadingResults(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500";
      case "draft":
        return "bg-yellow-500/20 text-yellow-500";
      case "completed":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/20 text-gray-500";
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your A/B Tests</h2>
          <button
            onClick={loadTests}
            disabled={loading}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--muted)]">Loading tests...</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--muted)] mb-4">No A/B tests found.</p>
            <p className="text-sm text-[var(--muted)]">
              To create a new test, please contact our team or use the CRM dashboard if you have access.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.test_id}
                className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{test.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}
                      >
                        {test.status}
                      </span>
                    </div>
                    {test.description && (
                      <p className="text-[var(--muted)] mb-3">{test.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--muted)]">Target URL:</span>
                        <div className="font-medium truncate">{test.target_url}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">Conversion Event:</span>
                        <div className="font-medium">{test.conversion_event}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">Variants:</span>
                        <div className="font-medium">{test.variant_count}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">Total Visitors:</span>
                        <div className="font-medium">{test.total_visitors}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => loadResults(test.test_id)}
                    disabled={loadingResults || selectedTest === test.test_id}
                    className="ml-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingResults && selectedTest === test.test_id
                      ? "Loading..."
                      : selectedTest === test.test_id
                      ? "Viewing"
                      : "View Results"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {results && (
        <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{results.test_name}</h2>
            {results.test_description && (
              <p className="text-[var(--muted)] mb-2">{results.test_description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[var(--muted)]">Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(results.test_status)}`}
              >
                {results.test_status}
              </span>
              <span className="text-[var(--muted)]">Conversion Event:</span>
              <span className="font-medium">{results.conversion_event}</span>
            </div>
          </div>

          {results.results.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)]">
              No results available yet. Start driving traffic to see results.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.results.map((result, idx) => (
                <div key={idx} className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
                  <h3 className="text-xl font-semibold mb-4">{result.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Visitors:</span>
                      <span className="font-semibold">{result.visitors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Conversions:</span>
                      <span className="font-semibold">{result.conversions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                      <span className="text-[var(--muted)]">Conversion Rate:</span>
                      <span className="font-semibold text-lg text-[var(--accent)]">
                        {result.conversion_rate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
