import { NextRequest, NextResponse } from "next/server";

// Try internal URL first (Docker service name), then fallback to external URL
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://api:8001";
const API_URL = process.env.API_URL ?? "https://carolinagrowth.co";

export async function GET(request: NextRequest) {
  // Try internal URL first, then fallback to external
  const urlsToTry = [API_INTERNAL_URL, API_URL];
  
  for (const baseUrl of urlsToTry) {
    try {
      const response = await fetch(`${baseUrl}/public/ab-testing/tests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout for fetch
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const data = await response.json();

      if (response.ok) {
        return NextResponse.json(data);
      }

      // If we got a response but it's not ok, return the error
      if (baseUrl === urlsToTry[urlsToTry.length - 1]) {
        return NextResponse.json(
          { error: data.detail || data.error || "Failed to get tests" },
          { status: response.status }
        );
      }
    } catch (error) {
      // If this is the last URL to try, return error
      if (baseUrl === urlsToTry[urlsToTry.length - 1]) {
        console.error("A/B test list error:", error);
        return NextResponse.json(
          { error: "Failed to get tests" },
          { status: 500 }
        );
      }
      // Otherwise, try the next URL
      continue;
    }
  }

  return NextResponse.json(
    { error: "Failed to get tests" },
    { status: 500 }
  );
}
