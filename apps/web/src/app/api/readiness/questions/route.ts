import { NextResponse } from "next/server";

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:8001";

export async function GET() {
  try {
    const apiResponse = await fetch(`${API_URL}/public/readiness/questions`);
    const payload = await apiResponse.json().catch(() => ({}));
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ questions: [] });
  }
}
