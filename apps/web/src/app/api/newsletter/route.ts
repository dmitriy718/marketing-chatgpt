import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { appendOutbox, flushOutbox } from "@/lib/outbox";

type NewsletterPayload = {
  email: string;
  leadMagnet?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const AUTOMATION_WEBHOOK_URL = process.env.AUTOMATION_WEBHOOK_URL;
const AUTOMATION_WEBHOOK_TOKEN = process.env.AUTOMATION_WEBHOOK_TOKEN;
const RATE_LIMIT_AUTH = process.env.RATE_LIMIT_TOKEN;
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

type ApiResult = {
  ok: boolean;
  retryable: boolean;
  status: number;
  error?: string;
};

async function sendNewsletterToApi(entry: NewsletterPayload): Promise<ApiResult> {
  const apiResponse = await fetch(`${API_URL}/public/newsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
    },
    body: JSON.stringify({
      ...entry,
      turnstile_token: entry.turnstileToken ?? null,
    }),
  });

  if (apiResponse.ok) {
    return { ok: true, retryable: false, status: apiResponse.status };
  }
  const errorPayload = await apiResponse.json().catch(() => ({}));
  return {
    ok: false,
    retryable: apiResponse.status >= 500,
    status: apiResponse.status,
    error: errorPayload?.detail ?? "Failed to store signup.",
  };
}

async function sendNewsletterToApiForFlush(entry: NewsletterPayload) {
  const result = await sendNewsletterToApi(entry);
  return result.ok;
}

export async function POST(request: Request) {
  const authToken = request.headers.get("x-rate-limit-token");
  if (RATE_LIMIT_AUTH && authToken && authToken !== RATE_LIMIT_AUTH) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as NewsletterPayload | null;

  if (!body?.email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
  }

  const entry: NewsletterPayload = {
    email: body.email,
    leadMagnet: body.leadMagnet ?? null,
  };

  await flushOutbox<NewsletterPayload>({
    newsletter: sendNewsletterToApiForFlush,
  });

  try {
    const result = await sendNewsletterToApi(entry);
    if (!result.ok) {
      if (!result.retryable) {
        return NextResponse.json(
          { ok: false, error: result.error ?? "Failed to store signup." },
          { status: result.status || 502 }
        );
      }
      await appendOutbox({
        id: crypto.randomUUID(),
        type: "newsletter",
        payload: entry,
        attempts: 1,
        lastAttemptedAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, queued: true }, { status: 202 });
    }
  } catch {
    await appendOutbox({
      id: crypto.randomUUID(),
      type: "newsletter",
      payload: entry,
      attempts: 1,
      lastAttemptedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, queued: true }, { status: 202 });
  }

  let automationDelivered = false;
  if (AUTOMATION_WEBHOOK_URL) {
    try {
      const response = await fetch(AUTOMATION_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTOMATION_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${AUTOMATION_WEBHOOK_TOKEN}` }
            : null),
        },
        body: JSON.stringify(entry),
      });
      automationDelivered = response.ok;
    } catch {
      automationDelivered = false;
    }
  }

  return NextResponse.json({ ok: true, automationDelivered });
}
