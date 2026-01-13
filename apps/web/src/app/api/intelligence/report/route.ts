import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { shouldBypassTurnstile } from "@/lib/turnstileServer";

type IntelligenceReportPayload = {
  url: string;
  email: string;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as IntelligenceReportPayload | null;

  if (!body?.url || !body?.email) {
    return NextResponse.json({ ok: false, error: "Missing URL or email." }, { status: 400 });
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
    const apiResponse = await fetch(`${API_URL}/public/intelligence/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        url: body.url,
        email: body.email,
        turnstile_token: body.turnstileToken ?? null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Report generation failed." },
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
