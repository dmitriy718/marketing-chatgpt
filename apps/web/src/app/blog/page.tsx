import Link from "next/link";

import { getBlogPosts, getSiteSettings } from "@/lib/content";
import { getBaseUrl, getDefaultSeoSettings } from "@/lib/seo";

export function generateMetadata() {
  const baseUrl = getBaseUrl();
  const title = "Insights";
  const description = "Guides, playbooks, and growth insights from Carolina Growth.";

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/blog` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/blog`,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function BlogPage() {
  const posts = getBlogPosts();
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const baseUrl = seo.baseUrl;
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: post.title,
      url: `${baseUrl}/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Insights
          </p>
          <h1 className="title mt-3 text-4xl font-semibold">Strategy notes for local growth.</h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--muted)]">
            Playbooks, checklists, and frameworks to help your team scale predictable pipeline.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-1"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  {post.publishedAt ?? "Insight"}
                </p>
                <h2 className="title mt-3 text-2xl font-semibold">{post.title}</h2>
                <p className="mt-3 text-sm text-[var(--muted)]">{post.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  Read more <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json">{JSON.stringify(listSchema)}</script>
    </>
  );
}
