import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    batch_id: null,
    analyzed_events: 0,
    templates_generated: 0,
    templates: [],
    message: "AI template analysis feature is disabled",
  });
}
