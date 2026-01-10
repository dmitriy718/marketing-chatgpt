"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function FreeConsultationPage() {
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
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 rounded-3xl border border-green-300 bg-green-50 p-8">
            <h1 className="mb-4 text-3xl font-bold text-green-700">Request Received!</h1>
            <p className="text-lg text-green-700">
              Thank you, {name}! We've received your consultation request.
            </p>
            <p className="mt-4 text-sm text-green-600">
              We'll contact you within 24 hours to schedule your free strategy session.
            </p>
          </div>
          <a
            href="/"
            className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
          >
            Return to Home
          </a>
        </div>
      </section>
    );
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="title text-4xl font-bold">Book Your Free Consultation</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Get a personalized strategy session to grow your business. No obligation, just expert advice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-semibold">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="preferred_date" className="mb-2 block text-sm font-semibold">
                  Preferred Date
                </label>
                <input
                  id="preferred_date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={minDate}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="preferred_time" className="mb-2 block text-sm font-semibold">
                  Preferred Time
                </label>
                <select
                  id="preferred_time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                >
                  <option value="">Any time</option>
                  <option value="morning">Morning (9am-12pm)</option>
                  <option value="afternoon">Afternoon (12pm-5pm)</option>
                  <option value="evening">Evening (5pm-7pm)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-semibold">
                What would you like to discuss?
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                placeholder="Tell us about your business goals, challenges, or questions..."
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
              {loading ? "Submitting..." : "Book Free Consultation"}
            </button>

            <p className="text-center text-xs text-[var(--muted)]">
              We'll contact you within 24 hours to confirm your consultation time.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
