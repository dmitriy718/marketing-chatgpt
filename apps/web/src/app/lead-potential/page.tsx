"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type CalculationResult = {
  current: {
    conversion_rate: number;
    leads_per_month: number;
    revenue_per_month: number;
  };
  potential: {
    conversion_rate: number;
    leads_per_month: number;
    revenue_per_month: number;
  };
  improvement: {
    lead_increase: number;
    revenue_increase: number;
    improvement_percentage: number;
  };
  benchmark: {
    industry_average: number;
    your_current: number;
  };
};

export default function LeadPotentialPage() {
  const [industry, setIndustry] = useState("other");
  const [visitors, setVisitors] = useState("");
  const [conversionRate, setConversionRate] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!visitors || !conversionRate || !dealValue) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/lead-potential/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          monthly_website_visitors: parseInt(visitors),
          current_conversion_rate: parseFloat(conversionRate),
          average_deal_value: parseFloat(dealValue),
          email: email || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Calculation failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate potential");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="title text-4xl font-bold">Lead Generation Potential Calculator</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Discover how many more leads and revenue you could generate with optimized marketing.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <div className="grid gap-6">
              <div>
                <label htmlFor="industry" className="mb-2 block text-sm font-semibold">
                  Industry
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                >
                  <option value="ecommerce">E-commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="services">Professional Services</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="legal">Legal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="visitors" className="mb-2 block text-sm font-semibold">
                  Monthly Website Visitors *
                </label>
                <input
                  id="visitors"
                  type="number"
                  value={visitors}
                  onChange={(e) => setVisitors(e.target.value)}
                  placeholder="1000"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  min="0"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="conversion_rate" className="mb-2 block text-sm font-semibold">
                  Current Conversion Rate (%) *
                </label>
                <input
                  id="conversion_rate"
                  type="number"
                  step="0.1"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  placeholder="2.0"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  min="0"
                  max="100"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="deal_value" className="mb-2 block text-sm font-semibold">
                  Average Deal Value ($) *
                </label>
                <input
                  id="deal_value"
                  type="number"
                  step="0.01"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="1000"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  min="0"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email (optional, for full report)
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
                {loading ? "Calculating..." : "Calculate Potential"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <h2 className="mb-6 text-2xl font-semibold">Your Potential</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
                  <p className="text-sm text-[var(--muted)]">Current Monthly Revenue</p>
                  <p className="mt-2 text-3xl font-bold">
                    ${result.current.revenue_per_month.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
                  <p className="text-sm text-[var(--muted)]">Potential Monthly Revenue</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    ${result.potential.revenue_per_month.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border-2 border-green-300 bg-green-50 p-6 text-center">
                <p className="text-sm text-[var(--muted)]">Additional Monthly Revenue Potential</p>
                <p className="mt-2 text-4xl font-bold text-green-600">
                  +${result.improvement.revenue_increase.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {result.improvement.lead_increase} more leads per month
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <h2 className="mb-4 text-2xl font-semibold">Comparison</h2>
              <div className="space-y-4">
                <div className="flex justify-between rounded-xl border border-[var(--border)] p-4">
                  <span className="text-[var(--muted)]">Your Current Rate</span>
                  <span className="font-semibold">{result.current.conversion_rate}%</span>
                </div>
                <div className="flex justify-between rounded-xl border border-[var(--border)] p-4">
                  <span className="text-[var(--muted)]">Industry Average</span>
                  <span className="font-semibold">{result.benchmark.industry_average}%</span>
                </div>
                <div className="flex justify-between rounded-xl border border-green-300 bg-green-50 p-4">
                  <span className="font-semibold">Optimized Potential</span>
                  <span className="font-bold text-green-600">{result.potential.conversion_rate}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center">
              <p className="mb-4 text-lg font-semibold">
                Ready to unlock ${result.improvement.revenue_increase.toLocaleString()}/month in additional revenue?
              </p>
              <a
                href="/contact"
                className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
              >
                Get Free Strategy Session
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
