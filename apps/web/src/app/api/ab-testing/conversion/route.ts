import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://carolinagrowth.co";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, eventName, userId, sessionId } = body;

    if (!testId || !eventName) {
      return NextResponse.json(
        { error: "Test ID and event name are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/public/ab-testing/conversion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test_id: testId,
        event_name: eventName,
        user_id: userId || null,
        session_id: sessionId || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Conversion tracking failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("A/B test conversion error:", error);
    return NextResponse.json(
      { error: "Failed to track conversion" },
      { status: 500 }
    );
  }
}
