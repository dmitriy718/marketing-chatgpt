import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";

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

  try {
    const apiResponse = await fetch(`${API_URL}/public/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name,
        email: body.email ?? null,
        message: body.message,
        page_url: body.pageUrl ?? null,
        user_agent: body.userAgent ?? null,
        referrer: body.referrer ?? null,
        turnstile_token: body.turnstileToken ?? null,
      }),
    });

    if (!apiResponse.ok) {
      const result = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: result?.detail ?? "Failed to send chat message." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to reach the API." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
