"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { verifyTurnstileToken } from "@/lib/turnstile";

type ContentType = "blog_post" | "social_media" | "email_campaign";
type Tone = "professional" | "casual" | "friendly";
type Length = "short" | "medium" | "long";

type GenerateResult = {
  content: string;
  content_type: string;
  topic: string;
  usage_count?: number;
  limit?: number;
};

export default function ContentGeneratorPage() {
  const [contentType, setContentType] = useState<ContentType>("blog_post");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          topic: topic.trim(),
          tone,
          length,
          email: email.trim() || null,
          turnstileToken: turnstileToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Content generation failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Content copied to clipboard!");
    } catch {
      alert("Failed to copy. Please select and copy manually.");
    }
  };

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="title text-4xl font-bold">AI Content Generator</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Generate professional marketing content in seconds. Blog posts, social media, and email campaigns.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="grid gap-6">
            <div>
              <label htmlFor="content_type" className="mb-2 block text-sm font-semibold">
                Content Type
              </label>
              <select
                id="content_type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                disabled={loading}
              >
                <option value="blog_post">Blog Post</option>
                <option value="social_media">Social Media Posts</option>
                <option value="email_campaign">Email Campaign</option>
              </select>
            </div>

            <div>
              <label htmlFor="topic" className="mb-2 block text-sm font-semibold">
                Topic *
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Local SEO strategies for restaurants'"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="tone" className="mb-2 block text-sm font-semibold">
                  Tone
                </label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label htmlFor="length" className="mb-2 block text-sm font-semibold">
                  Length
                </label>
                <select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value as Length)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  disabled={loading}
                >
                  <option value="short">Short (~200 words)</option>
                  <option value="medium">Medium (~500 words)</option>
                  <option value="long">Long (~1000 words)</option>
                </select>
              </div>
            </div>

            <div>
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
                disabled={loading}
              />
              <p className="mt-2 text-xs text-[var(--muted)]">
                Free tier: 3 generations/month. Premium: Unlimited.
              </p>
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
              {loading ? "Generating..." : "Generate Content"}
            </button>
          </div>
        </form>

        {result && (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Generated Content</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {result.content_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} • {result.topic}
                </p>
                {result.usage_count !== undefined && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Usage: {result.usage_count}/{result.limit || 3} this month
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.content)}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:bg-[var(--surface-soft)]"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadAsText(
                      result.content,
                      `${result.content_type}-${Date.now()}.txt`
                    )
                  }
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:bg-[var(--surface-soft)]"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {result.content}
              </pre>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
              <p className="mb-4 font-semibold">Need help with your content strategy?</p>
              <a
                href="/contact"
                className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
              >
                Get Expert Help
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
