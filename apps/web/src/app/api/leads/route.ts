import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { cookies } from "next/headers";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { shouldBypassTurnstile } from "@/lib/turnstileServer";
import { appendOutbox, flushOutbox } from "@/lib/outbox";

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
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

type ApiResult = {
  ok: boolean;
  retryable: boolean;
  status: number;
  error?: string;
};

async function sendLeadToApi(entry: LeadPayload): Promise<ApiResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  const apiResponse = await fetch(`${API_URL}/public/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
    },
    body: JSON.stringify({
      ...entry,
      turnstile_token: entry.turnstileToken ?? null,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (apiResponse.ok) {
    return { ok: true, retryable: false, status: apiResponse.status };
  }
  const errorPayload = await apiResponse.json().catch(() => ({}));
  return {
    ok: false,
    retryable: apiResponse.status >= 500,
    status: apiResponse.status,
    error: errorPayload?.detail ?? "Failed to store lead.",
  };
}

async function sendLeadToApiForFlush(entry: LeadPayload) {
  const result = await sendLeadToApi(entry);
  return result.ok;
}

async function safeAppendOutbox(entry: {
  id: string;
  type: string;
  payload: LeadPayload;
  attempts: number;
  lastAttemptedAt: string;
}) {
  try {
    await appendOutbox(entry);
    return true;
  } catch {
    return false;
  }
}

async function getUtmDetails(cookieStore: Awaited<ReturnType<typeof cookies>>) {
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

  const cookieStore = await cookies();
  const bypassTurnstile = await shouldBypassTurnstile(
    request,
    body.turnstileToken ?? null
  );
  if (!bypassTurnstile) {
    const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
    if (!turnstileOk) {
      return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
    }
  }

  const utmDetails = await getUtmDetails(cookieStore);
  const entry: LeadPayload = {
    ...body,
    details: utmDetails ? `${body.details}\n\n${utmDetails}` : body.details,
    source: body.source ?? "web",
  };

  flushOutbox<LeadPayload>({
    lead: sendLeadToApiForFlush,
  }).catch(() => {
    // Outbox contention shouldn't block inbound leads.
  });

  try {
    const result = await sendLeadToApi(entry);
    if (!result.ok) {
      if (!result.retryable) {
        return NextResponse.json(
          { ok: false, error: result.error ?? "Failed to store lead." },
          { status: result.status || 502 }
        );
      }
      void safeAppendOutbox({
        id: crypto.randomUUID(),
        type: "lead",
        payload: entry,
        attempts: 1,
        lastAttemptedAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, queued: true }, { status: 202 });
    }
  } catch {
    void safeAppendOutbox({
      id: crypto.randomUUID(),
      type: "lead",
      payload: entry,
      attempts: 1,
      lastAttemptedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, queued: true }, { status: 202 });
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
