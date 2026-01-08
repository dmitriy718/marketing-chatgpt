import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyTurnstileToken } from "@/lib/turnstile";

type LeadPayload = {
  name: string;
  email: string;
  company: string;
  budget?: string | null;
  details: string;
  source?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;
const CRM_WEBHOOK_TOKEN = process.env.CRM_WEBHOOK_TOKEN;
const RATE_LIMIT_AUTH = process.env.RATE_LIMIT_TOKEN;

async function getUtmDetails() {
  const cookieStore = await cookies();
  const rawUtm = cookieStore.get("cg_utm")?.value;
  const rawRef = cookieStore.get("cg_ref")?.value;
  const details: string[] = [];

  if (rawUtm) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawUtm));
      details.push(`UTM: ${JSON.stringify(parsed)}`);
    } catch {
      details.push(`UTM: ${rawUtm}`);
    }
  }

  if (rawRef) {
    details.push(`Referrer: ${decodeURIComponent(rawRef)}`);
  }

  return details.length ? details.join("\n") : null;
}

export async function POST(request: Request) {
  const authToken = request.headers.get("x-rate-limit-token");
  if (RATE_LIMIT_AUTH && authToken && authToken !== RATE_LIMIT_AUTH) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as LeadPayload | null;

  if (!body?.name || !body?.email || !body?.company || !body?.details) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
  }

  const utmDetails = await getUtmDetails();
  const entry: LeadPayload = {
    ...body,
    details: utmDetails ? `${body.details}\n\n${utmDetails}` : body.details,
    source: body.source ?? "web",
  };

  try {
    const apiResponse = await fetch(`${API_URL}/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...entry,
        turnstile_token: body.turnstileToken ?? null,
      }),
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
