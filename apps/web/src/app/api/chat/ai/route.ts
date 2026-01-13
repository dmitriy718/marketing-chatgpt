import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { shouldBypassTurnstile } from "@/lib/turnstileServer";

type ChatAiPayload = {
  message: string;
  sessionId?: string | null;
  name?: string | null;
  email?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatAiPayload | null;

  if (!body?.message) {
    return NextResponse.json({ ok: false, error: "Missing message." }, { status: 400 });
  }

  // Allow bypass with internal token for E2E tests
  const shouldBypass = await shouldBypassTurnstile(
    request,
    body.turnstileToken ?? null
  );

  if (!shouldBypass) {
    const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
    if (!turnstileOk) {
      return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
    }
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/chat/ai-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        message: body.message,
        session_id: body.sessionId || null,
        name: body.name || null,
        email: body.email || null,
        turnstile_token: body.turnstileToken || null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "AI response failed." },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json({ ok: true, ...payload });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to reach the API." },
      { status: 502 }
    );
  }
}
