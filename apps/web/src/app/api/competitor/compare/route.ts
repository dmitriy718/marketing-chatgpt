import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";

type CompetitorComparePayload = {
  user_url: string;
  competitor_urls: string[];
  email?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CompetitorComparePayload | null;

  if (!body?.user_url || !body?.competitor_urls || body.competitor_urls.length === 0) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/competitor/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        user_url: body.user_url,
        competitor_urls: body.competitor_urls,
        email: body.email ?? null,
        turnstile_token: body.turnstileToken ?? null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Comparison failed." },
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
