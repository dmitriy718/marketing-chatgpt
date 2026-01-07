"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";

type FormState = "idle" | "submitting" | "success" | "error";

export function LocalSeoAuthorityForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage(null);

    const formData = new FormData(form);
    const details = [
      `Locations: ${String(formData.get("locations") ?? "")}`,
      `Service area: ${String(formData.get("serviceArea") ?? "")}`,
      `GBP status: ${String(formData.get("gbp") ?? "")}`,
      `Review volume: ${String(formData.get("reviews") ?? "")}`,
      `Top keywords: ${String(formData.get("keywords") ?? "")}`,
      `Priority market: ${String(formData.get("market") ?? "")}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      details,
      source: "local-seo-authority",
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
      setMessage("Thanks! We will send the local SEO authority plan within 48 hours.");
      trackEvent({ name: "local_seo_submit", params: { source: "local-seo-authority" } });
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
        { label: "Number of locations", type: "text", name: "locations" },
        { label: "Primary service area", type: "text", name: "serviceArea" },
        { label: "Google Business Profile status", type: "text", name: "gbp" },
        { label: "Monthly review volume", type: "text", name: "reviews" },
        { label: "Priority market", type: "text", name: "market" },
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
        <span className="text-[var(--muted)]">Top local keywords</span>
        <textarea
          name="keywords"
          rows={3}
          required
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
        />
      </label>
      <button
        type="submit"
        className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Request the authority plan"}
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
