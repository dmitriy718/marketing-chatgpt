"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { primaryNavLinks, toolLinks } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * DEVELOPMENT NAVIGATION - Experimental horizontal bar style
 * This component is ONLY used on development.carolinagrowth.co
 * DO NOT use this on production - use SiteHeader.tsx instead
 * 
 * This is a COMPLETELY DIFFERENT navigation style:
 * - Horizontal top bar with full-width background
 * - Mega-menu style dropdown for Services
 * - Compact logo and links
 * - Different visual hierarchy
 */
export function SiteHeaderDev() {
  const mobileRef = useRef<HTMLDetailsElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (mobileRef.current?.open && !mobileRef.current.contains(target)) {
        mobileRef.current.open = false;
      }
      if (servicesRef.current && !servicesRef.current.contains(target)) {
        setServicesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeDetails = (ref: React.RefObject<HTMLDetailsElement | null>) => {
    if (ref.current?.open) {
      ref.current.open = false;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[var(--accent)]/10 via-[var(--background)] to-[var(--accent)]/10 border-b border-[var(--accent)]/30 overflow-visible">
      <div className="mx-auto w-full max-w-7xl relative">
        {/* Top bar with logo and CTA */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]/50">
          <Link href="/" className="flex items-center gap-2 whitespace-nowrap group">
            <Image
              src="/logo.svg"
              alt="Carolina Growth"
              width={24}
              height={24}
              className="h-6 w-6 transition-transform group-hover:scale-110"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              Carolina Growth
            </span>
            <span className="ml-2 rounded bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--background)]">
              DEV
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/contact?utm_source=site&utm_medium=nav&utm_campaign=header"
              className="hidden md:inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--background)] transition-all hover:scale-105 hover:shadow-lg"
            >
              Book a Call
            </Link>
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>
            <details ref={mobileRef} className="md:hidden">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                Menu
              </summary>
              <div className="absolute right-6 top-full mt-2 w-64 rounded-lg border-2 border-[var(--accent)] bg-[var(--background)] p-4 shadow-xl">
                <div className="space-y-3">
                  <div>
                    <Link
                      href="/services?utm_source=site&utm_medium=link&utm_campaign=mobile-nav"
                      className="block text-sm font-bold text-[var(--foreground)] mb-2"
                      onClick={() => closeDetails(mobileRef)}
                    >
                      Services
                    </Link>
                    <div className="ml-3 space-y-1 border-l-2 border-[var(--accent)]/30 pl-3">
                      {toolLinks.slice(0, 5).map((link) => (
                        <Link
                          key={link.href}
                          href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=mobile-tools`}
                          className="block text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                          onClick={() => closeDetails(mobileRef)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {primaryNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=mobile-nav`}
                      className="block text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                      onClick={() => closeDetails(mobileRef)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-3 border-t border-[var(--border)]">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Horizontal navigation bar */}
        <nav className="hidden md:flex items-center justify-center gap-1 px-6 py-2 overflow-x-auto relative">
          <div
            ref={servicesRef}
            className="relative z-50"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <Link
              href="/services?utm_source=site&utm_medium=link&utm_campaign=navigation"
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Services
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            {servicesOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-lg border-2 border-[var(--accent)] bg-[var(--background)] p-4 shadow-2xl z-[100]">
                <div className="grid grid-cols-2 gap-3">
                  {toolLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=navigation-tools`}
                      className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors py-1 border-b border-[var(--border)]/30 last:border-0"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="h-4 w-px bg-[var(--border)] mx-2" />
          {primaryNavLinks.map((link, index) => (
            <div key={link.href} className="flex items-center gap-1">
              <Link
                href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=navigation`}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
              {index < primaryNavLinks.length - 1 && (
                <div className="h-4 w-px bg-[var(--border)] mx-1" />
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
