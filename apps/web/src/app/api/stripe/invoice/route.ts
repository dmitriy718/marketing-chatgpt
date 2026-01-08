import { NextResponse } from "next/server";

type InvoicePayload = {
  amount: number;
  name: string;
  email: string;
  description?: string | null;
  daysUntilDue?: number | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as InvoicePayload | null;

  if (!body?.amount || !body?.name || !body?.email) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/stripe/invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(Number(body.amount)),
        name: body.name,
        email: body.email,
        description: body.description ?? null,
        days_until_due: body.daysUntilDue ?? null,
      }),
    });

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
