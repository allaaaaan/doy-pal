import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Parse the request body for consistency
  const body = await request.json();
  const { eventId, embedding } = body;

  if (!eventId || !embedding) {
    return NextResponse.json(
      { error: "Event ID and embedding are required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Individual embedding update feature is disabled",
    event: null,
  });
}
