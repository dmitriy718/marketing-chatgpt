"use client";

import { useEffect, useMemo, useState } from "react";

import { crmGraphQL } from "@/components/crm/CrmApi";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { CrmShell } from "@/components/crm/CrmShell";
import { formatCurrency } from "@/components/crm/formatters";

type Stage = {
  id: string;
  name: string;
  order: number;
  probability: number;
};

type Deal = {
  id: string;
  name: string;
  stage_id: string | null;
  value: number | null;
  status: string;
};

type PipelineData = {
  pipeline_stages: Stage[];
  deals: Deal[];
};

const pipelineQuery = `
  query PipelineOverview {
    pipeline_stages {
      id
      name
      order
      probability
    }
    deals {
      id
      name
      stage_id
      value
      status
    }
  }
`;

function PipelineContent() {
  const { token } = useCrmAuth();
  const [data, setData] = useState<PipelineData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    crmGraphQL<PipelineData>(pipelineQuery, token)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token]);

  const buckets = useMemo(() => {
    const stages = [...(data?.pipeline_stages ?? [])].sort((a, b) => a.order - b.order);
    const byStage = new Map<string, Deal[]>();
    stages.forEach((stage) => byStage.set(stage.id, []));
    const unassigned: Deal[] = [];
    (data?.deals ?? []).forEach((deal) => {
      if (deal.stage_id && byStage.has(deal.stage_id)) {
        byStage.get(deal.stage_id)?.push(deal);
      } else {
        unassigned.push(deal);
      }
    });
    return { stages, byStage, unassigned };
  }, [data]);

  const totalPipelineValue = useMemo(() => {
    return (data?.deals ?? [])
      .filter((deal) => deal.status === "open")
      .reduce((sum, deal) => sum + (deal.value ?? 0), 0);
  }, [data]);

  const loading = Boolean(token && !data && !error);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>Monitor deal volume and probability across pipeline stages.</p>
        <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.3em]">
          {formatCurrency(totalPipelineValue)} open pipeline
        </span>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading pipeline...</p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-[var(--danger)]">{error}</p> : null}
      {!loading && !error && buckets.stages.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
          No pipeline stages yet. Add stages to define the journey from lead to closed win.
        </div>
      ) : null}
      <div className="mt-8 grid gap-4">
        {buckets.stages.map((stage) => {
          const deals = buckets.byStage.get(stage.id) ?? [];
          const stageValue = deals.reduce((sum, deal) => sum + (deal.value ?? 0), 0);
          return (
            <div
              key={stage.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{stage.name}</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    {stage.probability}% probability
                  </p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                  {deals.length} deals • {formatCurrency(stageValue)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
                {deals.length === 0 ? (
                  <p>No deals in this stage yet.</p>
                ) : (
                  deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3"
                    >
                      <span className="text-[var(--foreground)]">{deal.name}</span>
                      <span className="text-xs text-[var(--muted)]">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
        {buckets.unassigned.length > 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--border)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Unassigned</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Needs stage
                </p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {buckets.unassigned.length} deals
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
              {buckets.unassigned.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3"
                >
                  <span className="text-[var(--foreground)]">{deal.name}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {formatCurrency(deal.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function CrmPipelinePage() {
  return (
    <CrmShell title="Pipeline">
      <PipelineContent />
    </CrmShell>
  );
}
