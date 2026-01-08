"use client";

import { useEffect, useMemo, useState } from "react";

import { crmGraphQL } from "@/components/crm/CrmApi";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { CrmShell } from "@/components/crm/CrmShell";
import { formatDate } from "@/components/crm/formatters";

type Customer = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  status: string;
  owner_user_id: string | null;
  created_at: string;
};

type CustomersData = {
  customers: Customer[];
};

const customersQuery = `
  query Customers {
    customers {
      id
      name
      industry
      website
      status
      owner_user_id
      created_at
    }
  }
`;

function CustomersContent() {
  const { token } = useCrmAuth();
  const [data, setData] = useState<CustomersData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    crmGraphQL<CustomersData>(customersQuery, token)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token]);

  const customers = useMemo(() => {
    return data?.customers
      ? [...data.customers].sort((a, b) => b.created_at.localeCompare(a.created_at))
      : [];
  }, [data]);

  const loading = Boolean(token && !data && !error);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>Accounts are the core company records connected to people, deals, and activity.</p>
        <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.3em]">
          {customers.length} total
        </span>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading accounts...</p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-[var(--danger)]">{error}</p> : null}
      {!loading && !error && customers.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
          No accounts yet. Create accounts when a lead becomes a qualified opportunity.
        </div>
      ) : null}
      <div className="mt-8 grid gap-4">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {customer.industry ?? "General"} • {customer.status}
                </p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {formatDate(customer.created_at)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Website</p>
                <p className="mt-1 text-[var(--foreground)]">
                  {customer.website ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Owner</p>
                <p className="mt-1 text-[var(--foreground)]">
                  {customer.owner_user_id ?? "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Status</p>
                <p className="mt-1 text-[var(--foreground)]">{customer.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function CrmCustomersPage() {
  return (
    <CrmShell title="Accounts">
      <CustomersContent />
    </CrmShell>
  );
}
