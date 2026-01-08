"use client";

import { useEffect, useMemo, useState } from "react";

import { crmGraphQL } from "@/components/crm/CrmApi";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { CrmShell } from "@/components/crm/CrmShell";
import { formatDate } from "@/components/crm/formatters";

type Lead = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  budget: string | null;
  source: string | null;
  status: string;
  score: number | null;
  created_at: string;
};

type LeadsData = {
  leads: Lead[];
};

const leadsQuery = `
  query Leads {
    leads {
      id
      full_name
      email
      phone
      company
      budget
      source
      status
      score
      created_at
    }
  }
`;

function LeadsContent() {
  const { token } = useCrmAuth();
  const [data, setData] = useState<LeadsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    crmGraphQL<LeadsData>(leadsQuery, token)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token]);

  const leads = useMemo(() => {
    return data?.leads
      ? [...data.leads].sort((a, b) => b.created_at.localeCompare(a.created_at))
      : [];
  }, [data]);

  const loading = Boolean(token && !data && !error);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>Track inbound leads, enrichment details, and pipeline readiness.</p>
        <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.3em]">
          {leads.length} total
        </span>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading leads...</p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-[var(--danger)]">{error}</p> : null}
      {!loading && !error && leads.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
          No leads yet. New leads from forms, outbound campaigns, or imports will appear here.
        </div>
      ) : null}
      <div className="mt-8 grid gap-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{lead.full_name}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {lead.company ?? "Independent"} • {lead.status}
                </p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {formatDate(lead.created_at)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Contact</p>
                <p className="mt-1 text-[var(--foreground)]">
                  {lead.email ?? "No email"} {lead.phone ? `• ${lead.phone}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Source</p>
                <p className="mt-1 text-[var(--foreground)]">{lead.source ?? "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Budget / Score</p>
                <p className="mt-1 text-[var(--foreground)]">
                  {lead.budget ?? "Not shared"} • {lead.score ?? "—"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function CrmLeadsPage() {
  return (
    <CrmShell title="Leads">
      <LeadsContent />
    </CrmShell>
  );
}
