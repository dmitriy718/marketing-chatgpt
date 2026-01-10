import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";

type LeadPotentialPayload = {
  industry: string;
  monthly_website_visitors: number;
  current_conversion_rate: number;
  average_deal_value: number;
  email?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LeadPotentialPayload | null;

  if (!body?.industry || !body?.monthly_website_visitors || !body?.current_conversion_rate || !body?.average_deal_value) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/lead-potential/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        industry: body.industry,
        monthly_website_visitors: body.monthly_website_visitors,
        current_conversion_rate: body.current_conversion_rate,
        average_deal_value: body.average_deal_value,
        email: body.email ?? null,
        turnstile_token: body.turnstileToken ?? null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Calculation failed." },
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
