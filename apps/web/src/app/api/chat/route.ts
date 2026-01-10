import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { appendOutbox, flushOutbox } from "@/lib/outbox";

type ChatPayload = {
  name: string;
  email?: string | null;
  message: string;
  pageUrl?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const RATE_LIMIT_AUTH = process.env.RATE_LIMIT_TOKEN;
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

type ApiResult = {
  ok: boolean;
  retryable: boolean;
  status: number;
  error?: string;
};

async function sendChatToApi(entry: ChatPayload): Promise<ApiResult> {
  const apiResponse = await fetch(`${API_URL}/public/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
    },
    body: JSON.stringify({
      name: entry.name,
      email: entry.email ?? null,
      message: entry.message,
      page_url: entry.pageUrl ?? null,
      user_agent: entry.userAgent ?? null,
      referrer: entry.referrer ?? null,
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
    error: errorPayload?.detail ?? "Failed to send chat message.",
  };
}

async function sendChatToApiForFlush(entry: ChatPayload) {
  const result = await sendChatToApi(entry);
  return result.ok;
}

export async function POST(request: Request) {
  const authToken = request.headers.get("x-rate-limit-token");
  if (RATE_LIMIT_AUTH && authToken && authToken !== RATE_LIMIT_AUTH) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ChatPayload | null;

  if (!body?.name || !body?.message) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
  }

  await flushOutbox<ChatPayload>({
    chat: sendChatToApiForFlush,
  });

  try {
    const result = await sendChatToApi(body);
    if (!result.ok) {
      if (!result.retryable) {
        return NextResponse.json(
          { ok: false, error: result.error ?? "Failed to send chat message." },
          { status: result.status || 502 }
        );
      }
      await appendOutbox({
        id: crypto.randomUUID(),
        type: "chat",
        payload: body,
        attempts: 1,
        lastAttemptedAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, queued: true }, { status: 202 });
    }
  } catch {
    await appendOutbox({
      id: crypto.randomUUID(),
      type: "chat",
      payload: body,
      attempts: 1,
      lastAttemptedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, queued: true }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}
