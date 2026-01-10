import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";

type ConsultationBookPayload = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ConsultationBookPayload | null;

  if (!body?.name || !body?.email) {
    return NextResponse.json({ ok: false, error: "Missing name or email." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? null);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Bot verification failed." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/consultation/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        company: body.company ?? null,
        preferred_date: body.preferred_date ?? null,
        preferred_time: body.preferred_time ?? null,
        message: body.message ?? null,
        turnstile_token: body.turnstileToken ?? null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Booking failed." },
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
