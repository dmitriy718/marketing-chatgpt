import { NextResponse } from "next/server";

type InvoicePayload = {
  tier: string;
  locations: string;
  urgency: string;
  support: string;
  name: string;
  email: string;
  daysUntilDue?: number | null;
  requestId?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as InvoicePayload | null;

  if (
    !body?.tier ||
    !body?.locations ||
    !body?.urgency ||
    !body?.support ||
    !body?.name ||
    !body?.email
  ) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const apiResponse = await fetch(`${API_URL}/public/stripe/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : null),
      },
      body: JSON.stringify({
        tier: body.tier,
        locations: body.locations,
        urgency: body.urgency,
        support: body.support,
        name: body.name,
        email: body.email,
        days_until_due: body.daysUntilDue ?? null,
        request_id: body.requestId ?? null,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Invoice failed." },
        { status: 502 }
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
