import { NextResponse } from "next/server";

type LoginPayload = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginPayload | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ ok: false, error: "Missing email or password." }, { status: 400 });
  }

  try {
    // For now, return mock data - in production, implement proper client authentication
    // This would check against Customer/Contact records and return their data
    return NextResponse.json({
      ok: true,
      data: {
        customer: {
          name: "Demo Client",
          status: "active",
          website: "https://example.com",
        },
        projects: [
          { id: "1", name: "SEO Optimization", status: "in-progress" },
          { id: "2", name: "Website Redesign", status: "planning" },
        ],
        reports: [
          {
            id: "1",
            title: "Monthly SEO Report - January 2026",
            created_at: new Date().toISOString(),
          },
        ],
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Login failed." },
      { status: 500 }
    );
  }
}
