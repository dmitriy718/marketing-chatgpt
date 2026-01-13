import { NextResponse } from "next/server";

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";

const DEFAULT_QUESTIONS = [
  {
    id: "seo",
    question: "How would you rate your website's SEO optimization?",
    options: {
      "1": "We don't have SEO",
      "2": "Basic SEO, not optimized",
      "3": "Some optimization, needs work",
      "4": "Well optimized",
      "5": "Expertly optimized",
    },
  },
  {
    id: "content",
    question: "How often do you publish new content (blog, social, etc.)?",
    options: {
      "1": "Rarely or never",
      "2": "Monthly",
      "3": "Bi-weekly",
      "4": "Weekly",
      "5": "Daily or multiple times per week",
    },
  },
  {
    id: "leads",
    question: "How would you rate your lead generation system?",
    options: {
      "1": "We don't have a system",
      "2": "Basic contact form only",
      "3": "Some automation, manual follow-up",
      "4": "Automated with nurturing",
      "5": "Fully automated with scoring",
    },
  },
  {
    id: "analytics",
    question: "How well do you track and analyze your marketing performance?",
    options: {
      "1": "We don't track anything",
      "2": "Basic website traffic only",
      "3": "Some metrics, not comprehensive",
      "4": "Good tracking, regular reviews",
      "5": "Comprehensive analytics with insights",
    },
  },
  {
    id: "social",
    question: "How active and effective is your social media presence?",
    options: {
      "1": "No social media",
      "2": "Inactive or irregular",
      "3": "Active but low engagement",
      "4": "Regular posts, good engagement",
      "5": "Highly active with strong community",
    },
  },
  {
    id: "email",
    question: "How sophisticated is your email marketing?",
    options: {
      "1": "No email marketing",
      "2": "Occasional newsletters",
      "3": "Regular emails, basic segmentation",
      "4": "Automated sequences, good segmentation",
      "5": "Advanced automation with personalization",
    },
  },
  {
    id: "conversion",
    question: "How optimized is your website for conversions?",
    options: {
      "1": "Not optimized",
      "2": "Basic optimization",
      "3": "Some testing done",
      "4": "Well optimized with testing",
      "5": "Continuously optimized with data",
    },
  },
  {
    id: "brand",
    question: "How strong is your brand presence and recognition?",
    options: {
      "1": "No clear brand",
      "2": "Basic branding",
      "3": "Some brand awareness",
      "4": "Strong brand in local market",
      "5": "Strong brand, recognized widely",
    },
  },
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const apiResponse = await fetch(`${API_URL}/public/readiness/questions`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    const payload = await apiResponse.json().catch(() => ({}));
    if (Array.isArray(payload?.questions) && payload.questions.length > 0) {
      return NextResponse.json(payload);
    }
    return NextResponse.json({ questions: DEFAULT_QUESTIONS });
  } catch {
    return NextResponse.json({ questions: DEFAULT_QUESTIONS });
  }
}
