"use client";

import { useEffect, useMemo, useState } from "react";

import { crmGraphQL } from "@/components/crm/CrmApi";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { CrmShell } from "@/components/crm/CrmShell";
import { formatCurrency, formatDate } from "@/components/crm/formatters";

type Deal = {
  id: string;
  name: string;
  customer_id: string;
  stage_id: string | null;
  value: number | null;
  close_date: string | null;
  status: string;
};

type Stage = {
  id: string;
  name: string;
  probability: number;
  order: number;
};

type Customer = {
  id: string;
  name: string;
};

type DealsData = {
  deals: Deal[];
  pipeline_stages: Stage[];
  customers: Customer[];
};

const dealsQuery = `
  query DealsPage {
    deals {
      id
      name
      customer_id
      stage_id
      value
      close_date
      status
    }
    pipeline_stages {
      id
      name
      probability
      order
    }
    customers {
      id
      name
    }
  }
`;

function DealsContent() {
  const { token } = useCrmAuth();
  const [data, setData] = useState<DealsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    crmGraphQL<DealsData>(dealsQuery, token)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token]);

  const { deals, stageMap, customerMap } = useMemo(() => {
    const stages = new Map<string, Stage>();
    const customers = new Map<string, Customer>();
    data?.pipeline_stages.forEach((stage) => stages.set(stage.id, stage));
    data?.customers.forEach((customer) => customers.set(customer.id, customer));
    return {
      deals: data?.deals ?? [],
      stageMap: stages,
      customerMap: customers,
    };
  }, [data]);

  const openDeals = deals.filter((deal) => deal.status === "open");

  const loading = Boolean(token && !data && !error);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>Track deal value, stage movement, and close timing.</p>
        <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.3em]">
          {openDeals.length} open
        </span>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading deals...</p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-[var(--danger)]">{error}</p> : null}
      {!loading && !error && deals.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
          No deals yet. Convert qualified leads into deals to start tracking revenue.
        </div>
      ) : null}
      <div className="mt-8 grid gap-4">
        {deals.map((deal) => {
          const stage = deal.stage_id ? stageMap.get(deal.stage_id) : null;
          const customer = customerMap.get(deal.customer_id);
          return (
            <div
              key={deal.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{deal.name}</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    {customer?.name ?? deal.customer_id} • {deal.status}
                  </p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                  {formatCurrency(deal.value)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em]">Stage</p>
                  <p className="mt-1 text-[var(--foreground)]">
                    {stage ? `${stage.name} (${stage.probability}%)` : "Unassigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em]">Close Date</p>
                  <p className="mt-1 text-[var(--foreground)]">{formatDate(deal.close_date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em]">Pipeline Health</p>
                  <p className="mt-1 text-[var(--foreground)]">
                    {stage ? `${stage.probability}% probability` : "Needs stage"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function CrmDealsPage() {
  return (
    <CrmShell title="Deals">
      <DealsContent />
    </CrmShell>
  );
}
