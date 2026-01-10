import { Metadata } from "next";
import { ContentGeneratorPageClient } from "./client";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  
  return buildPageMetadata({
    title: "Free AI Content Generator | Create Marketing Content in Seconds",
    description: "Generate high-quality blog posts, social media content, and email campaigns with AI. Customize tone, length, and style to match your brand voice. Free marketing content generator tool.",
    path: "/content-generator",
    keywords: ["AI content generator", "marketing content", "blog post generator", "social media content", "email campaign generator", "content creation tool", "AI writing"],
  });
}

export default function ContentGeneratorPage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <ContentGeneratorPageClient />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
