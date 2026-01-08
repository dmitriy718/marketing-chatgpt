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

export default function CrmDashboardPage() {
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    crmGraphQL<DashboardData>(dashboardQuery, token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  const openDeals = data?.deals.filter((deal) => deal.status === "open").length ?? 0;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          { label: "Leads", value: data?.leads.length ?? 0 },
          { label: "Accounts", value: data?.customers.length ?? 0 },
          { label: "Open Deals", value: openDeals },
          { label: "Activities", value: data?.activities.length ?? 0 },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      {error ? <p className="mt-6 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="mt-8 grid gap-4 rounded-3xl border border-[var(--border)] p-6 text-sm text-[var(--muted)]">
        <p>
          Phase 1 CRM is live. Use the navigation to manage leads, accounts, and pipeline activity.
        </p>
        <p>Next upgrades: multi-pipeline, lead scoring, and workflow automation.</p>
      </div>
    </>
  );
}
