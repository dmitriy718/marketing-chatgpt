import { Metadata } from "next";
import { ConsultationCalendarPageClient } from "./client";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Consultation Calendar | CRM | Carolina Growth",
    description: "Manage consultation bookings and view calendar. Internal use only.",
    path: "/crm/consultations",
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function ConsultationCalendarPage() {
  return <ConsultationCalendarPageClient />;
}
