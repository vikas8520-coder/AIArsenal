import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.AIRTABLE_API_KEY || "";
  const base = process.env.AIRTABLE_BASE_ID || "";
  return NextResponse.json({
    hasKey: !!key,
    keyPrefix: key.slice(0, 8) || "NOT_SET",
    hasBase: !!base,
    basePrefix: base.slice(0, 8) || "NOT_SET",
  });
}
