import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { shouldBypassTurnstile } from "@/lib/turnstileServer";

type ResearchPayload = {
  seedKeyword: string;
  email?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ResearchPayload | null;

  if (!body?.seedKeyword || body.seedKeyword.trim().length < 2) {
    return NextResponse.json(
      { ok: false, error: "Seed keyword must be at least 2 characters." },
      { status: 400 }
    );
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
    const apiResponse = await fetch(`${API_URL}/public/keyword-research/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        seed_keyword: body.seedKeyword.trim(),
        email: body.email ?? null,
        turnstile_token: body.turnstileToken ?? null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Keyword research failed." },
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
