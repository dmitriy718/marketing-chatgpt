import Link from "next/link";
import { notFound } from "next/navigation";

import { getBlogPostBySlug, getBlogPosts, getSiteSettings } from "@/lib/content";
import { buildArticleSchema, getBaseUrl, getDefaultSeoSettings } from "@/lib/seo";

type BlogParams = { slug: string };

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<BlogParams> }) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);
  if (!post) {
    return { title: "Insight" };
  }
  const baseUrl = getBaseUrl();
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
    },
    twitter: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<BlogParams> }) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);

  if (!post) {
    notFound();
  }

  const articleSchema = buildArticleSchema(post, seo);

  return (
    <>
      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/blog"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]"
          >
            Back to insights
          </Link>
          <h1 className="title mt-4 text-4xl font-semibold">{post.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {post.publishedAt ?? "Insight"} • {post.author ?? "Carolina Growth"}
          </p>
          <div className="prose prose-lg max-w-none mt-6">
            <div className="grid gap-6 text-base leading-relaxed text-[var(--muted)]">
              {post.body?.split("\n").map((paragraph, index) => {
                // Handle markdown headers
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2
                      key={`${post.slug}-${index}`}
                      className="title mt-8 mb-4 text-2xl font-semibold text-[var(--foreground)] first:mt-0"
                    >
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3
                      key={`${post.slug}-${index}`}
                      className="title mt-6 mb-3 text-xl font-semibold text-[var(--foreground)]"
                    >
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                // Handle bold text
                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                  return (
                    <p key={`${post.slug}-${index}`} className="font-semibold text-[var(--foreground)]">
                      {paragraph.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                // Handle list items
                if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
                  return (
                    <li key={`${post.slug}-${index}`} className="ml-6 list-disc">
                      {paragraph.replace(/^[-*] /, "")}
                    </li>
                  );
                }
                // Handle numbered list items
                if (/^\d+\. /.test(paragraph)) {
                  return (
                    <li key={`${post.slug}-${index}`} className="ml-6 list-decimal">
                      {paragraph.replace(/^\d+\. /, "")}
                    </li>
                  );
                }
                // Regular paragraphs
                if (paragraph.trim()) {
                  return (
                    <p key={`${post.slug}-${index}`} className="mb-4">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Strong CTA Section */}
          <div className="mt-12 rounded-3xl border-2 border-[var(--accent)] bg-gradient-to-br from-[var(--accent)]/10 via-[var(--surface-soft)] to-[var(--accent)]/5 p-8 text-center">
            <h2 className="title text-2xl font-semibold text-[var(--foreground)]">
              {post.slug === "fix-conversion-leaks"
                ? "Ready to Fix Your Conversion Leaks?"
                : "Ready to Build Your 2025 Growth Stack?"}
            </h2>
            <p className="mt-4 text-base text-[var(--muted)] max-w-2xl mx-auto">
              {post.slug === "fix-conversion-leaks"
                ? "Let our team audit your website and identify every conversion leak. We'll show you exactly what's costing you revenue and how to fix it fast."
                : "Let's build your 2025 growth stack together. Schedule a free strategy call and we'll map out a plan to compound your local growth."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/free-consultation?utm_source=site&utm_medium=cta&utm_campaign=blog-article"
                className="btn-primary rounded-full px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Book Your Free Strategy Call
              </Link>
              <Link
                href="/contact?utm_source=site&utm_medium=cta&utm_campaign=blog-article-secondary"
                className="btn-secondary rounded-full px-8 py-4 text-base font-semibold"
              >
                Get Started Today
              </Link>
            </div>
            <p className="mt-6 text-sm text-[var(--muted)]">
              No obligation • 30-minute call • Actionable insights guaranteed
            </p>
          </div>
        </div>
      </section>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
    </>
  );
}
