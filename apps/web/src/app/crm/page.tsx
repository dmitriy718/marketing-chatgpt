import { Metadata } from "next";
import { CrmDashboardPageClient } from "./client";
import { buildPageMetadata, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  
  return buildPageMetadata({
    title: "CRM Dashboard | Carolina Growth",
    description: "Access your CRM dashboard to manage leads, customers, deals, and activities. Internal use only.",
    path: "/crm",
    keywords: ["CRM", "dashboard", "customer relationship management"],
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function CrmDashboardPage() {
  return <CrmDashboardPageClient />;
}
