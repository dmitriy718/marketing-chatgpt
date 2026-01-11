"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { primaryNavLinks, toolLinks } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * PRODUCTION NAVIGATION - Modern horizontal bar style
 * This is the main navigation component for carolinagrowth.co
 *
 * Features:
 * - Horizontal top bar with full-width background
 * - Mega-menu style dropdown for Services
 * - Compact logo and links
 * - Modern visual hierarchy
 */
export function SiteHeaderDev() {
  const mobileRef = useRef<HTMLDetailsElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesLinkRef = useRef<HTMLAnchorElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (mobileRef.current?.open && !mobileRef.current.contains(target)) {
        mobileRef.current.open = false;
      }
      if (
        servicesRef.current &&
        !servicesRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setServicesOpen(false);
      }
    }

    function updateDropdownPosition() {
      if (servicesLinkRef.current && servicesOpen) {
        const rect = servicesLinkRef.current.getBoundingClientRect();
        setDropdownPosition({
          left: rect.left + rect.width / 2 - 160, // Center the 320px (w-80) dropdown
          top: rect.bottom + 8,
        });
      }
    }

    function handleMouseEnter() {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setServicesOpen(true);
    }

    function handleMouseLeave() {
      // Add delay before closing to allow mouse to move to dropdown
      closeTimeoutRef.current = setTimeout(() => {
        setServicesOpen(false);
      }, 200); // 200ms delay
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", updateDropdownPosition);
    window.addEventListener("resize", updateDropdownPosition);
    updateDropdownPosition();

    // Add mouse enter/leave handlers to both trigger and dropdown
    const servicesElement = servicesRef.current;
    const dropdownElement = dropdownRef.current;

    if (servicesElement) {
      servicesElement.addEventListener("mouseenter", handleMouseEnter);
      servicesElement.addEventListener("mouseleave", handleMouseLeave);
    }

    if (dropdownElement) {
      dropdownElement.addEventListener("mouseenter", handleMouseEnter);
      dropdownElement.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", updateDropdownPosition);
      window.removeEventListener("resize", updateDropdownPosition);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (servicesElement) {
        servicesElement.removeEventListener("mouseenter", handleMouseEnter);
        servicesElement.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (dropdownElement) {
        dropdownElement.removeEventListener("mouseenter", handleMouseEnter);
        dropdownElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [servicesOpen]);

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
        <nav className="hidden md:flex items-center justify-center gap-1 px-6 py-2">
          <div ref={servicesRef} className="relative">
            <Link
              ref={servicesLinkRef}
              href="/services?utm_source=site&utm_medium=link&utm_campaign=navigation"
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Services
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            {servicesOpen && (
              <div
                ref={dropdownRef}
                className="fixed w-80 rounded-lg border-2 border-[var(--accent)] bg-[var(--background)] p-4 shadow-2xl z-[9999]"
                style={{
                  left: `${dropdownPosition.left}px`,
                  top: `${Math.max(dropdownPosition.top, 0)}px`, // Ensure it doesn't go above viewport
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  {toolLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=navigation-tools`}
                      className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors py-1 border-b border-[var(--border)]/30 last:border-0"
                      onClick={() => setServicesOpen(false)}
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
