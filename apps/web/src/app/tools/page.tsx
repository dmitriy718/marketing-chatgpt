import { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Free Marketing Tools | SEO, Content, & Growth Calculators",
    description: "Access our suite of free marketing tools: SEO auditor, competitor comparison, marketing readiness assessment, content generator, lead potential calculator, and competitive intelligence reports. No signup required.",
    path: "/tools",
    keywords: ["free marketing tools", "SEO tools", "marketing calculators", "competitor analysis", "content generator", "SEO audit", "marketing assessment"],
  });
}

const tools = [
  {
    name: "SEO Website Auditor",
    description: "Get an instant SEO score (0-100) for any website with actionable recommendations. Checks title tags, meta descriptions, headings, images, links, and structured data.",
    href: "/seo-audit?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "🔍",
    category: "SEO",
  },
  {
    name: "Competitor Comparison Tool",
    description: "Compare your website's SEO performance against up to 5 competitors. Get insights on rankings, backlinks, content quality, and technical SEO.",
    href: "/competitor-comparison?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "⚔️",
    category: "Competitive Analysis",
  },
  {
    name: "Marketing Readiness Assessment",
    description: "Take our 10-question assessment to discover your marketing maturity level and get personalized recommendations to accelerate your growth.",
    href: "/marketing-readiness?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "📊",
    category: "Assessment",
  },
  {
    name: "Competitive Intelligence Report",
    description: "Generate a comprehensive competitive intelligence report for any website. Get SWOT analysis, market positioning insights, and actionable recommendations.",
    href: "/competitive-intelligence?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "🎯",
    category: "Competitive Analysis",
  },
  {
    name: "Lead Generation Potential Calculator",
    description: "Calculate your untapped lead generation potential. See how improving your conversion rate could increase leads and revenue.",
    href: "/lead-potential?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "💰",
    category: "Calculator",
  },
  {
    name: "AI Content Generator",
    description: "Generate high-quality blog posts, social media content, and email campaigns with AI. Customize tone, length, and style to match your brand voice.",
    href: "/content-generator?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "✍️",
    category: "Content",
  },
  {
    name: "Backlink Analyzer",
    description: "Analyze your website's backlink profile, identify linking opportunities, and get actionable insights for link building campaigns.",
    href: "/backlink-analyzer?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "🔗",
    category: "SEO",
  },
  {
    name: "Keyword Research Tool",
    description: "Discover high-value keywords for your SEO strategy. Get keyword suggestions, search volume estimates, and competition analysis.",
    href: "/keyword-research?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "🔑",
    category: "SEO",
  },
  {
    name: "A/B Testing Platform",
    description: "Test variations of landing pages, email campaigns, and CTAs. Get statistical significance calculations and determine winners.",
    href: "/ab-testing?utm_source=site&utm_medium=link&utm_campaign=tools-page",
    icon: "🧪",
    category: "Testing",
  },
];

export default function ToolsPage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Free Marketing Tools
            </p>
            <h1 className="title mt-4 text-5xl font-semibold">
              Professional Marketing Tools, Free Forever
            </h1>
            <p className="mt-6 text-lg text-[var(--muted)]">
              Access our suite of free marketing tools designed to help you grow your business. No signup required, no credit card needed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 text-4xl">{tool.icon}</div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  {tool.category}
                </p>
                <h3 className="title mt-3 text-xl font-semibold">{tool.name}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">{tool.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  Use tool
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center">
            <h2 className="title text-2xl font-semibold">Need Help Using These Tools?</h2>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Our team is here to help you get the most out of these free tools. Book a free consultation to discuss your marketing goals.
            </p>
            <Link
              href="/free-consultation?utm_source=site&utm_medium=cta&utm_campaign=tools-page"
              className="btn-primary mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      </section>
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
