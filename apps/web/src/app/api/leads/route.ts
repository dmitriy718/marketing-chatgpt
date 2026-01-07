import { NextResponse } from "next/server";

type LeadPayload = {
  name: string;
  email: string;
  company: string;
  budget?: string | null;
  details: string;
  source?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;
const CRM_WEBHOOK_TOKEN = process.env.CRM_WEBHOOK_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LeadPayload | null;

  if (!body?.name || !body?.email || !body?.company || !body?.details) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const entry: LeadPayload = {
    ...body,
    source: body.source ?? "web",
  };

  try {
    const apiResponse = await fetch(`${API_URL}/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (!apiResponse.ok) {
      const result = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: result?.detail ?? "Failed to store lead." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to reach the API." },
      { status: 502 }
    );
  }

  let crmDelivered = false;
  if (CRM_WEBHOOK_URL) {
    try {
      const response = await fetch(CRM_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_WEBHOOK_TOKEN ? { Authorization: `Bearer ${CRM_WEBHOOK_TOKEN}` } : null),
        },
        body: JSON.stringify(entry),
      });
      crmDelivered = response.ok;
    } catch {
      crmDelivered = false;
    }
  }

  return NextResponse.json({ ok: true, crmDelivered });
}
