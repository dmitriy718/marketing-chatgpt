"use client";

import { useState } from "react";

type ChatStatus = "idle" | "sending" | "sent" | "error";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggle = () => setOpen((prev) => !prev);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !name.trim()) {
      setError("Please add your name and message.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          message: message.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to send message.");
      }
      setStatus("sent");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to send message.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[320px] rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Live Chat
              </p>
              <h3 className="title text-lg font-semibold">Talk to Carolina Growth</h3>
            </div>
            <button
              type="button"
              className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
              onClick={toggle}
            >
              Close
            </button>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Share your goal and we will respond quickly.
          </p>
          <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
            <input
              className="rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <input
              className="rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm"
              placeholder="Email (optional)"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <textarea
              className="min-h-[90px] rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm"
              placeholder="How can we help?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            />
            {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
            {status === "sent" ? (
              <p className="text-xs text-[var(--muted)]">
                Message sent. We will reply ASAP.
              </p>
            ) : null}
            <button
              className="btn-primary rounded-full px-4 py-2 text-sm font-semibold"
              type="submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold shadow-lg"
          onClick={toggle}
        >
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          Live chat
        </button>
      )}
    </div>
  );
}
