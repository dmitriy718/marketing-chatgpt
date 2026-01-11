"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { primaryNavLinks, toolLinks } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  const toolsRef = useRef<HTMLDetailsElement>(null);
  const mobileRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (toolsRef.current?.open && !toolsRef.current.contains(target)) {
        toolsRef.current.open = false;
      }
      if (mobileRef.current?.open && !mobileRef.current.contains(target)) {
        mobileRef.current.open = false;
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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 whitespace-nowrap">
            <Image
              src="/logo.svg"
              alt="Carolina Growth"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Carolina Growth
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3 md:hidden">
            <details ref={mobileRef}>
              <summary
                className="cursor-pointer text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground)]"
                aria-label="Open navigation menu"
              >
                Menu
              </summary>
              <div className="glass absolute right-6 mt-3 flex w-48 flex-col gap-3 rounded-2xl p-3 text-sm text-[var(--muted)]">
                <details className="rounded-xl border border-[var(--border)] px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground)]">
                    <Link
                      href="/services?utm_source=site&utm_medium=link&utm_campaign=mobile-nav"
                      className="hover:text-[var(--foreground)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Services
                    </Link>
                  </summary>
                  <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
                    {toolLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=mobile-tools`}
                        className="hover:text-[var(--foreground)]"
                        onClick={() => closeDetails(mobileRef)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </details>
                {primaryNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=mobile-nav`}
                    className="hover:text-[var(--foreground)]"
                    onClick={() => closeDetails(mobileRef)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--muted)]">
                  Theme
                </div>
                <div className="flex items-center justify-start">
                  <ThemeToggle />
                </div>
              </div>
            </details>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:ml-10 md:flex">
          <details ref={toolsRef} className="relative group">
            <summary className="cursor-pointer list-none text-sm font-medium transition hover:text-[var(--foreground)] flex items-center gap-1">
              <Link
                href="/services?utm_source=site&utm_medium=link&utm_campaign=navigation"
                className="hover:text-[var(--foreground)]"
                onClick={(e) => {
                  // Allow link to work, but also toggle dropdown
                  e.stopPropagation();
                }}
              >
                Services
              </Link>
            </summary>
            <div className="glass absolute left-0 mt-3 flex w-48 flex-col gap-2 rounded-2xl p-3 text-sm text-[var(--muted)]">
              {toolLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=navigation-tools`}
                  className="hover:text-[var(--foreground)]"
                  onClick={() => closeDetails(toolsRef)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={`${link.href}${link.href.includes('?') ? '&' : '?'}utm_source=site&utm_medium=link&utm_campaign=navigation`}
              className="text-sm font-medium transition hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 md:ml-6">
          <Link
            href="/contact?utm_source=site&utm_medium=nav&utm_campaign=header"
            className="btn-primary w-full rounded-full px-4 py-2 text-sm font-semibold md:w-auto"
          >
            Book a Call
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
