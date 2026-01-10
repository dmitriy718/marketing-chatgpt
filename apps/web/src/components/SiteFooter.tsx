import Image from "next/image";
import Link from "next/link";

import { companyLinks, footerLinks, primaryNavLinks, toolLinks } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Carolina Growth"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <p className="text-lg font-semibold">Carolina Growth</p>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Boutique growth studio helping local brands scale with precision.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-[var(--muted)]">
            {primaryNavLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=footer`}
                className="hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Tools</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[var(--muted)]">
            {toolLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=footer-tools`}
                className="hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Company</p>
          <div className="mt-3 flex flex-col gap-2 text-[var(--muted)]">
            {companyLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=footer-company`}
                className="hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-6 font-semibold">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-[var(--muted)]">
            {footerLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=footer-legal`}
                className="hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
        © 2026 Carolina Growth. All rights reserved.
      </div>
    </footer>
  );
}
