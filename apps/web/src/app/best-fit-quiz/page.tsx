import { redirect } from "next/navigation";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Best Fit Quiz | Find Your Perfect Marketing Package",
    description: "Take our quick quiz to find the perfect marketing package for your business. Answer a few questions and get personalized recommendations based on your needs and goals.",
    path: "/best-fit-quiz",
    keywords: ["marketing quiz", "package finder", "marketing assessment", "best fit", "marketing recommendation"],
  });
}

export default function BestFitQuizPage() {
  redirect("/web-design");
}
