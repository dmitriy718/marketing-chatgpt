import { NextResponse } from "next/server";

type BugReportPayload = {
  message: string;
  stack?: string | null;
  digest?: string | null;
  url?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  context?: string | null;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as BugReportPayload | null;

  if (!body?.message) {
    return NextResponse.json({ ok: false, error: "Missing error message." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_URL}/public/bug-reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const result = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: result?.detail ?? "Failed to store bug report." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to reach the API." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
