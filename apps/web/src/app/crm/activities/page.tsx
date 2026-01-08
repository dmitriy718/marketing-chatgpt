"use client";

import { useEffect, useMemo, useState } from "react";

import { crmGraphQL } from "@/components/crm/CrmApi";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { CrmShell } from "@/components/crm/CrmShell";
import { formatDateTime } from "@/components/crm/formatters";

type Activity = {
  id: string;
  type: string;
  status: string;
  subject: string;
  due_at: string | null;
  assigned_to_user_id: string | null;
  lead_id: string | null;
  contact_id: string | null;
  customer_id: string | null;
  deal_id: string | null;
};

type ActivitiesData = {
  activities: Activity[];
};

const activitiesQuery = `
  query Activities {
    activities {
      id
      type
      status
      subject
      due_at
      assigned_to_user_id
      lead_id
      contact_id
      customer_id
      deal_id
    }
  }
`;

function ActivitiesContent() {
  const { token } = useCrmAuth();
  const [data, setData] = useState<ActivitiesData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    crmGraphQL<ActivitiesData>(activitiesQuery, token)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token]);

  const activities = useMemo(() => {
    return data?.activities
      ? [...data.activities].sort((a, b) => {
          const aTime = a.due_at ?? "";
          const bTime = b.due_at ?? "";
          return aTime.localeCompare(bTime);
        })
      : [];
  }, [data]);

  const getRelatedLabel = (activity: Activity) => {
    if (activity.deal_id) return `Deal ${activity.deal_id}`;
    if (activity.customer_id) return `Account ${activity.customer_id}`;
    if (activity.lead_id) return `Lead ${activity.lead_id}`;
    if (activity.contact_id) return `Contact ${activity.contact_id}`;
    return "General";
  };

  const loading = Boolean(token && !data && !error);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>Stay on top of calls, tasks, and follow-ups connected to pipeline activity.</p>
        <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.3em]">
          {activities.length} total
        </span>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading timeline...</p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-[var(--danger)]">{error}</p> : null}
      {!loading && !error && activities.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
          No activity logged yet. Activity will appear when tasks, calls, or meetings are recorded.
        </div>
      ) : null}
      <div className="mt-8 grid gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{activity.subject}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {activity.type} • {activity.status}
                </p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {formatDateTime(activity.due_at)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Related</p>
                <p className="mt-1 text-[var(--foreground)]">{getRelatedLabel(activity)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Assigned To</p>
                <p className="mt-1 text-[var(--foreground)]">
                  {activity.assigned_to_user_id ?? "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Status</p>
                <p className="mt-1 text-[var(--foreground)]">{activity.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function CrmActivitiesPage() {
  return (
    <CrmShell title="Timeline">
      <ActivitiesContent />
    </CrmShell>
  );
}
