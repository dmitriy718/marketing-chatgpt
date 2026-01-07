import { NextResponse } from "next/server";

type NewsletterPayload = {
  email: string;
  leadMagnet?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const AUTOMATION_WEBHOOK_URL = process.env.AUTOMATION_WEBHOOK_URL;
const AUTOMATION_WEBHOOK_TOKEN = process.env.AUTOMATION_WEBHOOK_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as NewsletterPayload | null;

  if (!body?.email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const entry: NewsletterPayload = {
    email: body.email,
    leadMagnet: body.leadMagnet ?? null,
  };

  try {
    const apiResponse = await fetch(`${API_URL}/public/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (!apiResponse.ok) {
      const result = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: result?.detail ?? "Failed to store signup." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to reach the API." },
      { status: 502 }
    );
  }

  let automationDelivered = false;
  if (AUTOMATION_WEBHOOK_URL) {
    try {
      const response = await fetch(AUTOMATION_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTOMATION_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${AUTOMATION_WEBHOOK_TOKEN}` }
            : null),
        },
        body: JSON.stringify(entry),
      });
      automationDelivered = response.ok;
    } catch {
      automationDelivered = false;
    }
  }

  return NextResponse.json({ ok: true, automationDelivered });
}
