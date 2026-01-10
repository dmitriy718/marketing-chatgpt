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

export default function MarketingReadinessPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    fetch("/api/readiness/questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions || []))
      .catch(() => setError("Failed to load questions"));
  }, []);

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers({ ...answers, [questionId]: score });
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions");
      return;
    }

    setLoading(true);
    setError(null);

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
      setError(err instanceof Error ? err.message : "Failed to complete assessment");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getLevelColor = (level: string) => {
    if (level === "Advanced") return "bg-green-100 text-green-700";
    if (level === "Intermediate") return "bg-yellow-100 text-yellow-700";
    if (level === "Beginner") return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  if (result) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="title text-4xl font-bold">Your Marketing Readiness</h1>
          </div>

          <div className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <div className="mb-4">
              <span className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </span>
            </div>
            <div className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getLevelColor(result.level)}`}>
              {result.level}
            </div>
            <p className="mt-4 text-lg">{result.message}</p>
          </div>

          {result.recommendations.length > 0 && (
            <div className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <h2 className="mb-4 text-2xl font-semibold">Areas to Improve</h2>
              <div className="space-y-4">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                  >
                    <p className="font-semibold">{rec.recommendation}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{rec.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center">
            <p className="mb-4 font-semibold">Ready to improve your marketing readiness?</p>
            <a
              href="/contact"
              className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
            >
              Get Free Strategy Session
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p>Loading assessment...</p>
        </div>
      </section>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="title text-4xl font-bold">Marketing Readiness Assessment</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Discover how ready your business is for growth. Answer 8 quick questions.
          </p>
        </div>

        <div className="mb-6">
          <div className="h-2 w-full rounded-full bg-[var(--surface-soft)]">
            <div
              className="h-2 rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-[var(--muted)]">
            Question {currentStep + 1} of {questions.length}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="mb-6">
            <h2 className="mb-6 text-2xl font-semibold">{currentQuestion.question}</h2>
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([score, option]) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleAnswer(currentQuestion.id, parseInt(score))}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    answers[currentQuestion.id] === parseInt(score)
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {currentStep === questions.length - 1 && (
            <>
              <div className="mb-6">
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
                />
              </div>

              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => setError("Bot verification failed")}
              />

              {error && (
                <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="btn-primary w-full rounded-full px-8 py-4 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "Calculating..." : "Get My Results"}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
