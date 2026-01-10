"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { getInternalLeadHeaders } from "@/lib/internalHeaders";

type FormState = "idle" | "submitting" | "success" | "error";

type QuizChoice = {
  id: string;
  label: string;
  value: string;
};

type Question = {
  id: string;
  label: string;
  options: QuizChoice[];
};

const questions: Question[] = [
  {
    id: "stage",
    label: "What best describes your growth stage?",
    options: [
      { id: "stage-1", label: "Just launched", value: "launch" },
      { id: "stage-2", label: "Growth plateau", value: "plateau" },
      { id: "stage-3", label: "Scaling fast", value: "scale" },
      { id: "stage-4", label: "Multi-location expansion", value: "expansion" },
    ],
  },
  {
    id: "priority",
    label: "What is your top priority right now?",
    options: [
      { id: "priority-1", label: "More qualified leads", value: "leads" },
      { id: "priority-2", label: "Higher conversion rate", value: "conversion" },
      { id: "priority-3", label: "Lower acquisition costs", value: "efficiency" },
      { id: "priority-4", label: "Retention + referrals", value: "retention" },
    ],
  },
  {
    id: "channel",
    label: "Which channel needs the most attention?",
    options: [
      { id: "channel-1", label: "Paid media", value: "paid" },
      { id: "channel-2", label: "Local SEO", value: "local-seo" },
      { id: "channel-3", label: "Email nurture", value: "email" },
      { id: "channel-4", label: "Sales pipeline", value: "pipeline" },
    ],
  },
];

type ResultCard = {
  title: string;
  description: string;
  href: string;
};

const resultMap: Record<string, ResultCard> = {
  "priority:leads": {
    title: "Lead Routing Playbook",
    description: "Fix response time and routing gaps to protect every lead.",
    href: "/lead-routing",
  },
  "priority:conversion": {
    title: "Conversion Teardown",
    description: "Find friction points and get a 30-day CRO roadmap.",
    href: "/conversion-teardown",
  },
  "priority:efficiency": {
    title: "Paid Media Audit",
    description: "Reduce wasted spend and refresh your creative pipeline.",
    href: "/paid-media-audit",
  },
  "priority:retention": {
    title: "Retention + Referral Engine",
    description: "Build retention loops and referral incentives that compound.",
    href: "/retention-referral",
  },
  "channel:paid": {
    title: "Paid Media Audit",
    description: "Get channel-level insights, creative refresh, and scaling plan.",
    href: "/paid-media-audit",
  },
  "channel:local-seo": {
    title: "Local SEO Authority Stack",
    description: "Win the map pack with GBP, reviews, and citations.",
    href: "/local-seo",
  },
  "channel:email": {
    title: "Email Nurture System",
    description: "Lifecycle sequences that move leads to booked calls.",
    href: "/email-nurture",
  },
  "channel:pipeline": {
    title: "Revenue Forecast Snapshot",
    description: "Build a leadership-ready revenue forecast.",
    href: "/revenue-forecast",
  },
};

function buildRecommendation(answers: Record<string, string>) {
  if (answers.priority) {
    return resultMap[`priority:${answers.priority}`] ?? null;
  }
  if (answers.channel) {
    return resultMap[`channel:${answers.channel}`] ?? null;
  }
  return null;
}

export function BestFitQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const recommendation = useMemo(() => buildRecommendation(answers), [answers]);
  const completed = questions.every((question) => Boolean(answers[question.id]));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details: `Quiz answers: ${questions
        .map((question) => `${question.id}=${answers[question.id] ?? ""}`)
        .join(", ")}`,
      source: "best-fit-quiz",
      turnstileToken,
    };

    try {
      const hasInternalToken = Boolean(getInternalLeadHeaders());
      if (turnstileEnabled && !turnstileToken && !hasInternalToken) {
        throw new Error("Please complete the bot check.");
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN
            ? { "x-rate-limit-token": process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN }
            : null),
          ...(getInternalLeadHeaders() ?? null),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.error ?? "Submission failed.");
      }

      setStatus("success");
      setMessage("Thanks! We will send the best-fit plan shortly.");
      trackEvent({
        name: "quiz_submit",
        params: { source: "best-fit-quiz", recommendation: recommendation?.title ?? "custom" },
      });
      form.reset();
      setTurnstileToken(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {questions.map((question) => (
          <div key={question.id} className="grid gap-3">
            <p className="text-sm font-semibold">{question.label}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {question.options.map((option) => {
                const active = answers[question.id] === option.value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: option.value,
                      }))
                    }
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-[var(--primary)] bg-[var(--surface-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Recommendation</p>
          <p className="mt-2 text-lg font-semibold">
            {recommendation?.title ?? "Complete the quiz to see your best-fit plan."}
          </p>
          {recommendation ? (
            <p className="mt-2 text-xs text-[var(--muted)]">{recommendation.description}</p>
          ) : null}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
      >
        <h3 className="title text-2xl font-semibold">Get your plan</h3>
        <p className="text-sm text-[var(--muted)]">
          Share your info and we’ll send a tailored action plan based on your quiz answers.
        </p>
        {[
          { label: "Full name", type: "text", name: "name", required: true },
          { label: "Email", type: "email", name: "email", required: true },
          { label: "Company", type: "text", name: "company", required: true },
          { label: "Monthly growth budget", type: "text", name: "budget" },
        ].map((field) => (
          <label key={field.name} className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">{field.label}</span>
            <input
              type={field.type}
              name={field.name}
              required={field.required}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />
          </label>
        ))}
        <TurnstileWidget
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
        <button
          type="submit"
          className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          disabled={!completed || status === "submitting"}
        >
          {status === "submitting" ? "Sending..." : "Email my best-fit plan"}
        </button>
        {message ? (
          <p
            className={`text-sm ${status === "success" ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
