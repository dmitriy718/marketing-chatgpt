import { Metadata } from "next";
import { EmailAutomationPageClient } from "./client";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Email Automation | CRM | Carolina Growth",
    description: "Manage email campaigns, sequences, and subscribers. Internal use only.",
    path: "/crm/email-automation",
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function EmailAutomationPage() {
  return <EmailAutomationPageClient />;
}
