"use client";

import { ErrorNotice } from "@/components/ErrorNotice";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <ErrorNotice error={error} context="app-error" />
        <button
          type="button"
          onClick={reset}
          className="btn-secondary mt-6 inline-flex justify-center rounded-full px-4 py-2 text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
