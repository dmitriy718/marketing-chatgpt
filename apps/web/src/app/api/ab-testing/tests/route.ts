import { NextRequest, NextResponse } from "next/server";

// Use API_URL (external) as primary, with internal as fallback
const API_URL = process.env.API_URL ?? process.env.API_INTERNAL_URL ?? "https://carolinagrowth.co";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/public/ab-testing/tests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Failed to get tests" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("A/B test list error:", error);
    return NextResponse.json(
      { error: "Failed to get tests" },
      { status: 500 }
    );
  }
}
