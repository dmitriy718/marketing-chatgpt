"use client";

import { ErrorNotice } from "@/components/ErrorNotice";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-4xl">
            <ErrorNotice error={error} context="global-error" />
            <button
              type="button"
              onClick={reset}
              className="btn-secondary mt-6 inline-flex justify-center rounded-full px-4 py-2 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
