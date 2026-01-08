"use client";

import Link from "next/link";
import { useState } from "react";

import { CrmAuthProvider, useCrmAuth } from "@/components/crm/CrmAuth";

const navLinks = [
  { href: "/crm", label: "Dashboard" },
  { href: "/crm/leads", label: "Leads" },
  { href: "/crm/customers", label: "Accounts" },
  { href: "/crm/deals", label: "Deals" },
  { href: "/crm/pipeline", label: "Pipeline" },
  { href: "/crm/activities", label: "Timeline" },
  { href: "/crm/reports", label: "Reports" },
];

function LoginCard() {
  const { login } = useCrmAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg">
      <h1 className="title text-2xl font-semibold">CRM Login</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sign in to manage leads, accounts, and pipeline activity.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Email
          <input
            className="rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm text-[var(--foreground)]"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Password
          <input
            className="rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm text-[var(--foreground)]"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <button
          className="btn-primary mt-2 rounded-full px-4 py-2 text-sm font-semibold"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function CrmLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { token, loading, logout } = useCrmAuth();

  if (loading) {
    return <div className="p-10 text-sm text-[var(--muted)]">Loading...</div>;
  }

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
        <LoginCard />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row">
      <aside className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:w-64">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Carolina Growth
        </p>
        <h2 className="title mt-3 text-xl font-semibold">CRM</h2>
        <nav className="mt-6 grid gap-2 text-sm text-[var(--muted)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl px-3 py-2 transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="mt-6 w-full rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]"
          type="button"
          onClick={logout}
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Phase 1 CRM
              </p>
              <h1 className="title mt-2 text-3xl font-semibold">{title}</h1>
            </div>
            <Link
              href="/contact?utm_source=crm&utm_medium=cta&utm_campaign=crm-help"
              className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Need help?
            </Link>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function CrmShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <CrmAuthProvider>
      <CrmLayout title={title}>{children}</CrmLayout>
    </CrmAuthProvider>
  );
}
