import { NextResponse } from "next/server";

type LoginPayload = {
  email: string;
  password: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type PortalQueryData = {
  customers: Array<{
    id: string;
    name: string;
    status: string;
    website: string | null;
  }>;
  deals: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  notes: Array<{
    id: string;
    body: string;
    created_at: string;
  }>;
};

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginPayload | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ ok: false, error: "Missing email or password." }, { status: 400 });
  }

  try {
    const authResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    const authPayload = await authResponse.json().catch(() => ({}));
    if (!authResponse.ok) {
      return NextResponse.json(
        { ok: false, error: authPayload?.detail ?? "Invalid credentials." },
        { status: authResponse.status }
      );
    }

    const token = authPayload?.access_token as string | undefined;
    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing auth token." }, { status: 500 });
    }

    const query = `
      query PortalData {
        customers { id name status website }
        deals { id name status }
        notes { id body created_at }
      }
    `;

    const gqlResponse = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const gqlPayload = (await gqlResponse.json()) as GraphQLResponse<PortalQueryData>;
    if (!gqlResponse.ok || gqlPayload.errors?.length) {
      return NextResponse.json(
        { ok: false, error: gqlPayload.errors?.[0]?.message ?? "Portal data unavailable." },
        { status: 502 }
      );
    }

    const customers = gqlPayload.data?.customers ?? [];
    const deals = gqlPayload.data?.deals ?? [];
    const notes = gqlPayload.data?.notes ?? [];

    return NextResponse.json({
      ok: true,
      token,
      data: {
        customer: customers[0] ?? null,
        projects: deals.map((deal) => ({
          id: deal.id,
          name: deal.name,
          status: deal.status,
        })),
        reports: notes.map((note) => ({
          id: note.id,
          title: note.body.slice(0, 80),
          created_at: note.created_at,
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Login failed." },
      { status: 500 }
    );
  }
}
