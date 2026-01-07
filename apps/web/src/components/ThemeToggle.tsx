"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
      aria-label="Toggle color theme"
    >
      <span className="uppercase tracking-[0.2em]">{theme}</span>
      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
    </button>
  );
}
