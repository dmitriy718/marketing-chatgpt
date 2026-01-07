import portfolioData from "../../content/portfolio.json";
import servicesData from "../../content/services.json";
import settingsData from "../../content/settings.json";
import teamData from "../../content/team.json";
import landingPagesData from "../../content/landing-pages.json";
import testimonialsData from "../../content/testimonials.json";
import reviewsData from "../../content/reviews.json";
import leadMagnetsData from "../../content/lead-magnets.json";
import blogData from "../../content/blog.json";
import landingTemplatesData from "../../content/landing-templates.json";

export type Service = {
  slug: string;
  title: string;
  kicker?: string | null;
  summary?: string | null;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  deliverables?: string[] | null;
};

export type PortfolioItem = {
  title: string;
  result: string;
  focus: string;
  metrics?: {
    label: string;
    before: number;
    after: number;
    prefix?: string;
    suffix?: string;
  } | null;
  timeframe?: string | null;
};

export type LandingPageSection = {
  title: string;
  body?: string | null;
  bullets?: string[] | null;
};

export type LandingPageHero = {
  headline: string;
  subheadline?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaHref?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
};

export type LandingPage = {
  title: string;
  slug: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  hero?: LandingPageHero | null;
  sections?: LandingPageSection[] | null;
};

export type TeamMember = {
  name: string;
  role: string;
  focus: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role?: string | null;
  company?: string | null;
};

export type Review = {
  source: string;
  rating: number;
  quote: string;
};

export type LeadMagnet = {
  title: string;
  description?: string | null;
  downloadUrl: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  excerpt?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  body?: string | null;
};

export type LandingTemplate = {
  title: string;
  industry: string;
  focus: string;
  summary: string;
  sections?: string[] | null;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  defaultDescription: string;
  ogImage: string;
};

const services = (servicesData as { services?: Service[] }).services ?? [];
const portfolioItems = (portfolioData as { items?: PortfolioItem[] }).items ?? [];
const teamMembers = (teamData as { team?: TeamMember[] }).team ?? [];
const siteSettings = (settingsData as Partial<SiteSettings>) ?? {};
const landingPages = (landingPagesData as { pages?: LandingPage[] }).pages ?? [];
const testimonials = (testimonialsData as { items?: Testimonial[] }).items ?? [];
const reviews = (reviewsData as { items?: Review[] }).items ?? [];
const leadMagnets = (leadMagnetsData as { items?: LeadMagnet[] }).items ?? [];
const blogPosts = (blogData as { posts?: BlogPost[] }).posts ?? [];
const landingTemplates = (landingTemplatesData as { templates?: LandingTemplate[] }).templates ?? [];

export function getServices() {
  return services;
}

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getPortfolioItems() {
  return portfolioItems;
}

export function getTeamMembers() {
  return teamMembers;
}

export function getSiteSettings() {
  return siteSettings;
}

export function getLandingPages() {
  return landingPages;
}

export function getLandingPageBySlug(slug: string) {
  return landingPages.find((page) => page.slug === slug);
}

export function getTestimonials() {
  return testimonials;
}

export function getReviews() {
  return reviews;
}

export function getLeadMagnets() {
  return leadMagnets;
}

export function getBlogPosts() {
  return blogPosts;
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getLandingTemplates() {
  return landingTemplates;
}
