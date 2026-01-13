import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://carolinagrowth.co";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, userId, sessionId } = body;

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/public/ab-testing/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test_id: testId,
        user_id: userId || null,
        session_id: sessionId || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Assignment failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("A/B test assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign variant" },
      { status: 500 }
    );
  }
}
