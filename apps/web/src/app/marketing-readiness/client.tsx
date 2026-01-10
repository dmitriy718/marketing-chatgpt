"use client";

import { useState, useEffect } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type Question = {
  id: string;
  question: string;
  options: Record<string, string>;
};

type AssessmentResult = {
  score: number;
  level: string;
  message: string;
  recommendations: Array<{
    area: string;
    question: string;
    current_score: number;
    recommendation: string;
  }>;
  breakdown: Record<string, number>;
};

export function MarketingReadinessPageClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("/api/readiness/questions");
        const data = await response.json();
        if (response.ok && data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        setError("Failed to load questions");
      }
    }
    fetchQuestions();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (questions.length === 0) {
      setError("Questions not loaded yet");
      return;
    }

    const allAnswered = questions.every((q) => answers[q.id] !== undefined);
    if (!allAnswered) {
      setError("Please answer all questions");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/readiness/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          email: email || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Assessment failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assess readiness");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced":
        return "text-green-600";
      case "intermediate":
        return "text-yellow-600";
      case "beginner":
        return "text-red-600";
      default:
        return "text-[var(--muted)]";
    }
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="title text-4xl font-semibold">Marketing Readiness Assessment</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Answer 10 questions to discover your marketing maturity level and get personalized recommendations to accelerate your growth.
          </p>
        </div>

        {questions.length > 0 && !result && (
          <form onSubmit={handleSubmit} className="mb-8 grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            {questions.map((question) => (
              <div key={question.id} className="grid gap-3">
                <p className="font-semibold">{question.question}</p>
                <div className="grid gap-2">
                  {Object.entries(question.options).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 cursor-pointer hover:bg-[var(--surface)]"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={value}
                        checked={answers[question.id] === Number(value)}
                        onChange={() => setAnswers({ ...answers, [question.id]: Number(value) })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

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
              {loading ? "Assessing..." : "Get My Readiness Score"}
            </button>
          </form>
        )}

        {result && (
          <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Your Marketing Readiness
              </p>
              <p className={`mt-2 text-5xl font-bold ${getLevelColor(result.level)}`}>
                {result.score}/100
              </p>
              <p className="mt-2 text-xl font-semibold">{result.level}</p>
              <p className="mt-4 text-sm text-[var(--muted)]">{result.message}</p>
            </div>

            {result.recommendations.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Personalized Recommendations</h3>
                <div className="grid gap-3">
                  {result.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                    >
                      <p className="font-semibold">{rec.area}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{rec.recommendation}</p>
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
