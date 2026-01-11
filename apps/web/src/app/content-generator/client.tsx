"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

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

export function ContentGeneratorPageClient() {
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
          email: email || null,
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

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="title text-4xl font-semibold">AI Content Generator</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Generate high-quality marketing content in seconds. Create blog posts, social media content, or email campaigns tailored to your brand voice and goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div>
            <label htmlFor="contentType" className="block text-sm font-semibold">
              Content Type
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            >
              <option value="blog_post">Blog Post</option>
              <option value="social_media">Social Media Post</option>
              <option value="email_campaign">Email Campaign</option>
            </select>
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-semibold">
              Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your content topic..."
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="tone" className="block text-sm font-semibold">
                Tone
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <div>
              <label htmlFor="length" className="block text-sm font-semibold">
                Length
              </label>
              <select
                id="length"
                value={length}
                onChange={(e) => setLength(e.target.value as Length)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
              Email (optional, for saving content)
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
            {loading ? "Generating..." : "Generate Content"}
          </button>
        </form>

        {result && (
          <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Generated {result.content_type.replace("_", " ")}
              </p>
              <p className="mt-2 text-lg font-semibold">Topic: {result.topic}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <div className="whitespace-pre-wrap text-sm text-[var(--muted)]">{result.content}</div>
            </div>
            {result.usage_count !== undefined && result.limit !== undefined && (
              <p className="text-xs text-[var(--muted)]">
                Usage: {result.usage_count} / {result.limit} generations
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
