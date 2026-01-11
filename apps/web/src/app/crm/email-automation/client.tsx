"use client";

import { CrmShell } from "@/components/crm/CrmShell";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://carolinagrowth.co";

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  sequence_count: number;
  subscriber_count: number;
  created_at: string | null;
};

type Sequence = {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body: string;
  sends: number;
  created_at: string | null;
};

type Subscriber = {
  id: string;
  email: string;
  status: string;
  tags: string | null;
  sends: number;
  opens: number;
  subscribed_at: string | null;
};

type Analytics = {
  subscribers: {
    total: number;
    active: number;
    unsubscribed: number;
  };
  campaigns: {
    total: number;
    active: number;
    draft: number;
  };
  sends: {
    total: number;
    opens: number;
    clicks: number;
    open_rate: number;
    click_rate: number;
    recent_30_days: number;
  };
};

type FormSource = {
  lead_sources: string[];
  newsletter_sources: string[];
  all_sources: string[];
};

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export function EmailAutomationPageClient() {
  return (
    <CrmShell title="Email Automation">
      <EmailAutomationContent />
    </CrmShell>
  );
}

function EmailAutomationContent() {
  const { token } = useCrmAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "subscribers" | "analytics">("overview");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [formSources, setFormSources] = useState<FormSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token, selectedCampaign]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [campaignsData, subscribersData, analyticsData, sourcesData] = await Promise.all([
        fetchWithAuth(`${API_URL}/admin/email/campaigns`, token),
        fetchWithAuth(`${API_URL}/admin/email/subscribers?limit=50`, token),
        fetchWithAuth(`${API_URL}/admin/email/analytics`, token),
        fetchWithAuth(`${API_URL}/admin/email/form-sources`, token),
      ]);

      setCampaigns(campaignsData.campaigns || []);
      setSubscribers(subscribersData.subscribers || []);
      setAnalytics(analyticsData);
      setFormSources(sourcesData);

      if (selectedCampaign) {
        const sequencesData = await fetchWithAuth(
          `${API_URL}/admin/email/campaigns/${selectedCampaign}/sequences`,
          token
        );
        setSequences(sequencesData.sequences || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !analytics) {
    return <div className="p-6">Loading email automation data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {(["overview", "campaigns", "subscribers", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && analytics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <p className="text-sm text-[var(--muted)]">Total Subscribers</p>
            <p className="mt-2 text-3xl font-semibold">{analytics.subscribers.total}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {analytics.subscribers.active} active
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <p className="text-sm text-[var(--muted)]">Active Campaigns</p>
            <p className="mt-2 text-3xl font-semibold">{analytics.campaigns.active}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {analytics.campaigns.total} total
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <p className="text-sm text-[var(--muted)]">Open Rate</p>
            <p className="mt-2 text-3xl font-semibold">{analytics.sends.open_rate}%</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {analytics.sends.opens} / {analytics.sends.total} opens
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <p className="text-sm text-[var(--muted)]">Click Rate</p>
            <p className="mt-2 text-3xl font-semibold">{analytics.sends.click_rate}%</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {analytics.sends.clicks} clicks
            </p>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Campaigns</h2>
            <button className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">
              + New Campaign
            </button>
          </div>
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {campaign.type} • {campaign.status}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {campaign.sequence_count} sequences • {campaign.subscriber_count} subscribers
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                    className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {selectedCampaign === campaign.id ? "Hide" : "View"} Sequences
                  </button>
                </div>
                {selectedCampaign === campaign.id && (
                  <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                    {sequences.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">No sequences yet</p>
                    ) : (
                      sequences.map((seq) => (
                        <div
                          key={seq.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">Step {seq.step_number}</p>
                              <p className="mt-1 text-sm text-[var(--foreground)]">{seq.subject}</p>
                              <p className="mt-1 text-xs text-[var(--muted)]">
                                Delay: {seq.delay_days} days • {seq.sends} sends
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subscribers</h2>
            <div className="text-sm text-[var(--muted)]">
              {subscribers.length} total
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Sends
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Opens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Subscribed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[var(--surface)]">
                    <td className="px-6 py-4 text-sm text-[var(--foreground)]">{sub.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{sub.tags || "-"}</td>
                    <td className="px-6 py-4 text-sm text-[var(--foreground)]">{sub.sends}</td>
                    <td className="px-6 py-4 text-sm text-[var(--foreground)]">{sub.opens}</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">
                      {sub.subscribed_at
                        ? new Date(sub.subscribed_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
              <p className="text-sm text-[var(--muted)]">Subscribers</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.subscribers.total}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {analytics.subscribers.active} active, {analytics.subscribers.unsubscribed} unsubscribed
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
              <p className="text-sm text-[var(--muted)]">Campaigns</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.campaigns.total}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {analytics.campaigns.active} active, {analytics.campaigns.draft} draft
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
              <p className="text-sm text-[var(--muted)]">Recent Activity</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.sends.recent_30_days}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Sends in last 30 days</p>
            </div>
          </div>

          {formSources && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
              <h3 className="text-lg font-semibold">Form Sources</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                These are the form sources that can be mapped to campaigns:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {formSources.all_sources.map((source) => (
                  <span
                    key={source}
                    className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)]"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
