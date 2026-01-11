"use client";

import { CrmShell } from "@/components/crm/CrmShell";
import { crmGraphQL } from "@/components/crm/CrmApi";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { useEffect, useState } from "react";

type DashboardData = {
  leads: Array<{ id: string }>;
  customers: Array<{ id: string }>;
  deals: Array<{ id: string; status: string }>; 
  activities: Array<{ id: string }>;
};

export function CrmDashboardPageClient() {
  return (
    <CrmShell title="Dashboard">
      <DashboardContent />
    </CrmShell>
  );
}

const dashboardQuery = `
  query Dashboard {
    leads { id }
    customers { id }
    deals { id status }
    activities { id }
  }
`;

function DashboardContent() {
  const { token } = useCrmAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    crmGraphQL<DashboardData>(dashboardQuery, token)
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">Total Leads</p>
        <p className="mt-2 text-3xl font-semibold">{data?.leads.length || 0}</p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">Customers</p>
        <p className="mt-2 text-3xl font-semibold">{data?.customers.length || 0}</p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">Active Deals</p>
        <p className="mt-2 text-3xl font-semibold">
          {data?.deals.filter((d) => d.status !== "closed").length || 0}
        </p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">Activities</p>
        <p className="mt-2 text-3xl font-semibold">{data?.activities.length || 0}</p>
      </div>
    </div>
  );
}
