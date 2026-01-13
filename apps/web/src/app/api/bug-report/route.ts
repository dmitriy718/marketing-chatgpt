import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { shouldBypassTurnstile } from "@/lib/turnstileServer";

type BugReportPayload = {
  message: string;
  stack?: string | null;
  digest?: string | null;
  url?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  context?: string | null;
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

  const body = (await request.json().catch(() => null)) as BugReportPayload | null;

  if (!body?.message) {
    return NextResponse.json({ ok: false, error: "Missing error message." }, { status: 400 });
  }

  const bypassTurnstile = await shouldBypassTurnstile(
    request,
    body.turnstileToken ?? null
  );
  if (!bypassTurnstile) {
    const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
    if (!turnstileOk) {
      return NextResponse.json(
        { ok: false, error: "Bot verification failed." },
        { status: 400 }
      );
    }
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/bug-reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, turnstile_token: body.turnstileToken ?? null }),
    });

    if (!apiResponse.ok) {
      const result = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: result?.detail ?? "Failed to store bug report." },
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
