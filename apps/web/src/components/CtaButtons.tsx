"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";

type CtaButtonsProps = {
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
};

export function CtaButtons({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaButtonsProps) {
  const showPrimary = primaryLabel && primaryHref;
  const showSecondary = secondaryLabel && secondaryHref;

  if (!showPrimary && !showSecondary) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {showPrimary ? (
        <Link
          href={primaryHref ?? "#"}
          className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          onClick={() =>
            trackEvent({ name: "cta_click", params: { label: primaryLabel ?? "", variant: "primary" } })
          }
        >
          {primaryLabel}
        </Link>
      ) : null}
      {showSecondary ? (
        <Link
          href={secondaryHref ?? "#"}
          className="btn-secondary rounded-full px-6 py-3 text-sm font-semibold"
          onClick={() =>
            trackEvent({ name: "cta_click", params: { label: secondaryLabel ?? "", variant: "secondary" } })
          }
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
