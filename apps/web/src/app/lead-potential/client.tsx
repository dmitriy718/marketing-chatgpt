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

export function LeadPotentialPageClient() {
  const [industry, setIndustry] = useState("services");
  const [monthlyTraffic, setMonthlyTraffic] = useState("");
  const [currentConversionRate, setCurrentConversionRate] = useState("");
  const [averageDealValue, setAverageDealValue] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!monthlyTraffic || !currentConversionRate || !averageDealValue) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/lead-potential/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          monthly_website_visitors: Number(monthlyTraffic),
          current_conversion_rate: Number(currentConversionRate),
          average_deal_value: Number(averageDealValue),
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
      setError(err instanceof Error ? err.message : "Failed to calculate lead potential");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="title text-4xl font-semibold">Lead Generation Potential Calculator</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Calculate your untapped lead generation potential. See how improving your conversion rate could increase leads and revenue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div>
            <label htmlFor="traffic" className="block text-sm font-semibold">
              Monthly Traffic
            </label>
            <input
              id="traffic"
              type="number"
              value={monthlyTraffic}
              onChange={(e) => setMonthlyTraffic(e.target.value)}
              placeholder="10000"
              min="1"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-semibold">
              Industry
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            >
              <option value="services">Services</option>
              <option value="ecommerce">E-commerce</option>
              <option value="saas">SaaS</option>
              <option value="healthcare">Healthcare</option>
              <option value="real_estate">Real estate</option>
              <option value="legal">Legal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="conversion" className="block text-sm font-semibold">
              Current Conversion Rate (%)
            </label>
            <input
              id="conversion"
              type="number"
              value={currentConversionRate}
              onChange={(e) => setCurrentConversionRate(e.target.value)}
              placeholder="2.5"
              min="0"
              max="100"
              step="0.1"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="dealValue" className="block text-sm font-semibold">
              Average Deal Value ($)
            </label>
            <input
              id="dealValue"
              type="number"
              value={averageDealValue}
              onChange={(e) => setAverageDealValue(e.target.value)}
              placeholder="5000"
              min="1"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
              Email (for detailed report)
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
            {loading ? "Calculating..." : "Calculate Potential"}
          </button>
        </form>

        {result && (
          <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Potential Improvement
              </p>
              <p className="mt-2 text-5xl font-bold text-[var(--primary)]">
                +{result.improvement.improvement_percentage.toFixed(1)}%
              </p>
              <p className="mt-2 text-lg font-semibold">Conversion Rate Lift</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Additional Leads/Month
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  +{result.improvement.lead_increase.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Additional Revenue/Month
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  ${result.improvement.revenue_increase.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <p className="text-sm font-semibold">Current Performance</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {result.current.leads_per_month.toLocaleString()} leads/month
                </p>
                <p className="text-sm text-[var(--muted)]">
                  ${result.current.revenue_per_month.toLocaleString()}/month
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Current conversion: {result.benchmark.your_current}%
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <p className="text-sm font-semibold">Potential Performance</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {result.potential.leads_per_month.toLocaleString()} leads/month
                </p>
                <p className="text-sm text-[var(--muted)]">
                  ${result.potential.revenue_per_month.toLocaleString()}/month
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Industry benchmark: {result.benchmark.industry_average}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
