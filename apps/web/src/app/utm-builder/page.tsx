import Link from "next/link";

import { UtmQrBuilder } from "@/components/UtmQrBuilder";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildPageMetadata({
    title: "UTM Builder + QR Generator",
    description: "Build clean UTM links and QR codes for campaigns in seconds.",
    path: "/utm-builder",
  });
}

const useCases = [
  "Track offline campaigns with QR scans",
  "Keep campaign attribution consistent",
  "Share ready-to-use links with your team",
];

export default function UtmBuilderPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              UTM builder
            </p>
            <h1 className="title text-4xl font-semibold">
              Build clean UTMs and QR codes in seconds.
            </h1>
            <p className="text-base text-[var(--muted)]">
              Keep campaign tracking consistent across channels. Generate UTM links and a
              ready-to-use QR code for print, events, and offline activations.
            </p>
            <div className="grid gap-3 text-sm text-[var(--muted)]">
              {useCases.map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] p-4">
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
              Need campaign QA support?{" "}
              <Link href="/contact?utm_source=site&utm_medium=cta&utm_campaign=utm-builder">
                Book a tracking consult →
              </Link>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="title text-2xl font-semibold">How to use</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {[
                "Paste the destination URL",
                "Fill your UTM fields",
                "Copy the link or download the QR",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <UtmQrBuilder />
      </div>
    </section>
  );
}
