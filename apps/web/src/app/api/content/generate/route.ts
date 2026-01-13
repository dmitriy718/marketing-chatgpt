import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { shouldBypassTurnstile } from "@/lib/turnstileServer";

type ContentGeneratePayload = {
  content_type: string;
  topic: string;
  tone?: string;
  length?: string;
  email?: string | null;
  turnstileToken?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContentGeneratePayload | null;

  if (!body?.content_type || !body?.topic) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
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
    const apiResponse = await fetch(`${API_URL}/public/content/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        content_type: body.content_type,
        topic: body.topic,
        tone: body.tone || "professional",
        length: body.length || "medium",
        email: body.email ?? null,
        turnstile_token: body.turnstileToken ?? null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Content generation failed." },
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
