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
          <div className="mt-6 grid gap-4 text-base text-[var(--muted)]">
            {post.body?.split("\n").map((paragraph, index) => (
              <p key={`${post.slug}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
    </>
  );
}
