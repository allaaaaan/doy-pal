import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "Bulk embedding update feature is disabled",
    updated: 0,
    total: 0,
  });
}
