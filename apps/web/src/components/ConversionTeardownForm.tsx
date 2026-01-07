"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";

type FormState = "idle" | "submitting" | "success" | "error";

export function ConversionTeardownForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);

    const formData = new FormData(form);
    const details = [
      `Primary conversion goal: ${String(formData.get("goal") ?? "")}`,
      `Monthly traffic: ${String(formData.get("traffic") ?? "")}`,
      `Current conversion rate: ${String(formData.get("rate") ?? "")}`,
      `Top funnel page: ${String(formData.get("page") ?? "")}`,
      `Biggest friction: ${String(formData.get("friction") ?? "")}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details,
      source: "conversion-teardown",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.error ?? "Submission failed.");
      }

      setStatus("success");
      setMessage("Thanks! We will deliver your teardown and fixes within 48 hours.");
      trackEvent({ name: "teardown_submit", params: { source: "conversion-teardown" } });
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      {[
        { label: "Full name", type: "text", name: "name", required: true },
        { label: "Email", type: "email", name: "email", required: true },
        { label: "Company", type: "text", name: "company", required: true },
        { label: "Website", type: "url", name: "page" },
        { label: "Monthly traffic (approx.)", type: "text", name: "traffic" },
        { label: "Current conversion rate", type: "text", name: "rate" },
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
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Primary conversion goal</span>
        <textarea
          name="goal"
          rows={3}
          required
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Biggest conversion friction</span>
        <textarea
          name="friction"
          rows={3}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
        />
      </label>
      <button
        type="submit"
        className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Request the teardown"}
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
  );
}
