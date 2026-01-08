"use client";

import { useEffect, useMemo, useState } from "react";

import { crmGraphQL } from "@/components/crm/CrmApi";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { CrmShell } from "@/components/crm/CrmShell";
import { formatCurrency } from "@/components/crm/formatters";

type Lead = {
  id: string;
  source: string | null;
  status: string;
};

type Deal = {
  id: string;
  status: string;
  value: number | null;
  stage_id: string | null;
};

type Stage = {
  id: string;
  name: string;
  probability: number;
};

type ReportData = {
  leads: Lead[];
  customers: Array<{ id: string }>;
  deals: Deal[];
  activities: Array<{ id: string }>;
  pipeline_stages: Stage[];
};

const reportQuery = `
  query Reports {
    leads { id source status }
    customers { id }
    deals { id status value stage_id }
    activities { id }
    pipeline_stages { id name probability }
  }
`;

function ReportsContent() {
  const { token } = useCrmAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    crmGraphQL<ReportData>(reportQuery, token)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token]);

  const metrics = useMemo(() => {
    const leads = data?.leads ?? [];
    const deals = data?.deals ?? [];
    const openDeals = deals.filter((deal) => deal.status === "open");
    const wonDeals = deals.filter((deal) => deal.status === "won");
    const pipelineValue = openDeals.reduce((sum, deal) => sum + (deal.value ?? 0), 0);
    const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value ?? 0), 0);

    const sourceCounts = leads.reduce<Record<string, number>>((acc, lead) => {
      const key = lead.source ?? "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      totalLeads: leads.length,
      totalAccounts: data?.customers.length ?? 0,
      totalDeals: deals.length,
      totalActivities: data?.activities.length ?? 0,
      openDeals: openDeals.length,
      pipelineValue,
      wonValue,
      topSources,
    };
  }, [data]);

  const loading = Boolean(token && !data && !error);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>Manual reporting for Phase 1. Track volume and pipeline value.</p>
        <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.3em]">
          Updated in real time
        </span>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading reports...</p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          { label: "Total leads", value: metrics.totalLeads },
          { label: "Accounts", value: metrics.totalAccounts },
          { label: "Total deals", value: metrics.totalDeals },
          { label: "Open deals", value: metrics.openDeals },
          { label: "Pipeline value", value: formatCurrency(metrics.pipelineValue) },
          { label: "Won revenue", value: formatCurrency(metrics.wonValue) },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-[var(--border)] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Lead Sources
        </p>
        <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
          {metrics.topSources.length === 0 ? (
            <p>No lead sources yet. As leads arrive, their sources will appear here.</p>
          ) : (
            metrics.topSources.map(([source, count]) => (
              <div
                key={source}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3"
              >
                <span className="text-[var(--foreground)]">{source}</span>
                <span className="text-xs text-[var(--muted)]">{count} leads</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default function CrmReportsPage() {
  return (
    <CrmShell title="Reports">
      <ReportsContent />
    </CrmShell>
  );
}
