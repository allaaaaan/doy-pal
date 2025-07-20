import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get threshold from query params for consistency
  const url = new URL(request.url);
  const threshold = parseFloat(url.searchParams.get("threshold") || "0.8");

  return NextResponse.json({
    categories: [],
    threshold,
    message: "AI event categorization feature is disabled",
  });
}
