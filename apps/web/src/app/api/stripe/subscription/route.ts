import { NextResponse } from "next/server";

type SubscriptionPayload = {
  priceId: string;
  name: string;
  email: string;
  planLabel?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SubscriptionPayload | null;

  if (!body?.priceId || !body?.name || !body?.email) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/stripe/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price_id: body.priceId,
        name: body.name,
        email: body.email,
        plan_label: body.planLabel ?? null,
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      return NextResponse.json(
        { ok: false, error: payload?.detail ?? "Subscription failed." },
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
