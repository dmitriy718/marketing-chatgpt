"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export function FreeConsultationPageClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Please fill in name and email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/consultation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          company: company.trim() || null,
          preferred_date: preferredDate || null,
          preferred_time: preferredTime || null,
          message: message.trim() || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Booking failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book consultation");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h1 className="title text-3xl font-semibold">Consultation Requested!</h1>
            <p className="mt-4 text-lg text-[var(--muted)]">
              We&apos;ve received your request and will contact you within 24 hours to confirm your consultation time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="title text-4xl font-semibold">Book Your Free Consultation</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Schedule a free 30-minute strategy call to discuss your marketing goals and discover how we can help accelerate your growth.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-semibold">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-semibold">
                Preferred Date
              </label>
              <input
                id="preferredDate"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="preferredTime" className="block text-sm font-semibold">
                Preferred Time
              </label>
              <input
                id="preferredTime"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold">
              Message (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
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
            {loading ? "Booking..." : "Book Free Consultation"}
          </button>
        </form>
      </div>
    </section>
  );
}
