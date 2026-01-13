import { Metadata } from "next";
import { CrmDashboardPageClient } from "./client";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
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
