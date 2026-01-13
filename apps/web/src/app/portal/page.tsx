import { Metadata } from "next";
import { ClientPortalPageClient } from "./client";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Client Portal | Access Your Projects & Reports",
    description: "Login to your Carolina Growth client portal to access your active projects, performance reports, account information, and marketing analytics dashboard.",
    path: "/portal",
    keywords: ["client portal", "customer portal", "client dashboard", "project management", "marketing reports", "account access"],
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function ClientPortalPage() {
  return <ClientPortalPageClient />;
}
