"use client";

import { useState, useEffect, useRef } from "react";

import { TurnstileWidget } from "@/components/TurnstileWidget";

type ChatStatus = "idle" | "sending" | "sent" | "error" | "ai-responding";
type Message = {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: Date;
};

export function ChatWidgetEnhanced() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggle = () => setOpen((prev) => !prev);

  const handleAiMessage = async (text: string) => {
    if (!text.trim()) return;

    // Check for Turnstile token if enabled - but allow retry if missing
    if (turnstileEnabled && !turnstileToken) {
      setError("Please complete the bot verification check below.");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isAi: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setStatus("ai-responding");
    setError(null);

    try {
      const response = await fetch("/api/chat/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: sessionId,
          name: name.trim() || null,
          email: email.trim() || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        // If bot verification failed, reset the token so user can try again
        if (data.error?.includes("verification") || data.error?.includes("bot")) {
          setTurnstileToken(null);
        }
        throw new Error(data.error || data.detail || "AI response failed");
      }

      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isAi: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.needs_escalation) {
        setMode("human");
      }
      setStatus("idle");
      // Reset Turnstile token after successful message so it verifies again for next message
      setTurnstileToken(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to get AI response");
      // Don't reset status to idle on error, let user see the error and retry
    }
  };

  const handleHumanMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !name.trim()) {
      setError("Please add your name and message.");
      return;
    }
    if (turnstileEnabled && !turnstileToken) {
      setError("Please complete the bot check.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN
            ? { "x-rate-limit-token": process.env.NEXT_PUBLIC_RATE_LIMIT_TOKEN }
            : null),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          message: message.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          turnstileToken,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to send message.");
      }
      setStatus("sent");
      setMessage("");
      setTurnstileToken(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to send message.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "ai") {
      await handleAiMessage(message);
    } else {
      await handleHumanMessage(event);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[380px] rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl flex flex-col max-h-[600px]">
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {mode === "ai" ? "AI Assistant" : "Message Us"}
                </p>
                <h3 className="title text-lg font-semibold">Carolina Growth</h3>
              </div>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
                onClick={toggle}
              >
                Close
              </button>
            </div>
            {mode === "ai" && (
              <button
                type="button"
                onClick={() => setMode("human")}
                className="mt-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Switch to human support →
              </button>
            )}
          </div>

          {mode === "ai" && messages.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAi ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.isAi
                        ? "bg-[var(--surface-soft)] text-[var(--foreground)]"
                        : "bg-[var(--accent)] text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {status === "ai-responding" && (
                <div className="flex justify-start">
                  <div className="bg-[var(--surface-soft)] rounded-2xl px-4 py-2 text-sm">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <form
            className={`p-5 border-t border-[var(--border)] ${mode === "ai" && messages.length === 0 ? "" : ""}`}
            onSubmit={handleSubmit}
          >
            {mode === "ai" && messages.length === 0 && (
              <div className="mb-4 text-sm text-[var(--muted)]">
                <p className="mb-2">Hi! I&apos;m the Carolina Growth AI assistant. How can I help you today?</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setMessage("What services do you offer?")}
                    className="block w-full text-left rounded-xl border border-[var(--border)] px-3 py-2 text-xs hover:bg-[var(--surface-soft)]"
                  >
                    What services do you offer?
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage("How much does it cost?")}
                    className="block w-full text-left rounded-xl border border-[var(--border)] px-3 py-2 text-xs hover:bg-[var(--surface-soft)]"
                  >
                    How much does it cost?
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage("I'd like to book a call")}
                    className="block w-full text-left rounded-xl border border-[var(--border)] px-3 py-2 text-xs hover:bg-[var(--surface-soft)]"
                  >
                    I&apos;d like to book a call
                  </button>
                </div>
              </div>
            )}

            {mode === "human" && (
              <>
                <input
                  className="mb-3 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm"
                  placeholder="Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
                <input
                  className="mb-3 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm"
                  placeholder="Email (optional)"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </>
            )}

            <div className="flex gap-2">
              <textarea
                className="flex-1 min-h-[60px] rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm resize-none"
                placeholder={mode === "ai" ? "Type your message..." : "How can we help?"}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && mode === "ai") {
                    e.preventDefault();
                    handleAiMessage(message);
                  }
                }}
              />
            </div>

            {turnstileEnabled && (
              <div className="mt-3">
                <TurnstileWidget
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
              </div>
            )}

            {error && (
              <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>
            )}

            {status === "sent" && mode === "human" && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Message sent. We will reply ASAP.
              </p>
            )}

            <button
              className="mt-3 w-full btn-primary rounded-full px-4 py-2 text-sm font-semibold"
              type="submit"
              disabled={status === "sending" || status === "ai-responding"}
            >
              {status === "sending"
                ? "Sending..."
                : status === "ai-responding"
                ? "AI is thinking..."
                : mode === "ai"
                ? "Send"
                : "Send message"}
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
          Chat with us
        </button>
      )}
    </div>
  );
}
