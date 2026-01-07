"use client";

import { ErrorNotice } from "@/components/ErrorNotice";

export default function NotFoundPage() {
  const error = new Error("Page not found");

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <ErrorNotice error={error} context="not-found" />
      </div>
    </section>
  );
}
