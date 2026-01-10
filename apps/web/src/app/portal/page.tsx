"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type PortalData = {
  customer: {
    name: string;
    status: string;
    website: string | null;
  } | null;
  projects: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  reports: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
};

export default function ClientPortalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // For now, use a simple check - in production, implement proper client auth
      const response = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      setLoggedIn(true);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="title text-3xl font-bold">Client Portal</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Access your projects, reports, and account information
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8"
          >
            <div className="grid gap-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Need access? <Link href="/contact" className="underline">Contact us</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="title text-3xl font-bold">Client Portal</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Welcome, {data?.customer?.name || email}
            </p>
          </div>
          <button
            onClick={() => setLoggedIn(false)}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            Sign Out
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-lg font-semibold">Account Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Status:</span>
                <span className="font-semibold capitalize">
                  {data?.customer?.status || "Active"}
                </span>
              </div>
              {data?.customer?.website && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Website:</span>
                  <a
                    href={data.customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    {data.customer.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-lg font-semibold">Active Projects</h2>
            {data?.projects && data.projects.length > 0 ? (
              <div className="space-y-2">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
                  >
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs capitalize">
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">No active projects</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Reports</h2>
          {data?.reports && data.reports.length > 0 ? (
            <div className="space-y-2">
              {data.reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{report.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold">
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">No reports available</p>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
          <p className="mb-4 text-sm text-[var(--muted)]">
            Need help or have questions about your account?
          </p>
          <Link
            href="/contact"
            className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
