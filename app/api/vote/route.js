import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "ToolVotes";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return NextResponse.json(
      { error: "Airtable not configured" },
      { status: 500, headers: corsHeaders }
    );
  }

  const body = await request.json();
  const { toolId, vote } = body;

  if (!toolId || (vote !== "up" && vote !== "down")) {
    return NextResponse.json(
      { error: "toolId and vote ('up' | 'down') required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              tool_id: String(toolId).slice(0, 12),
              vote,
              voted_at: new Date().toISOString(),
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Airtable: ${err.slice(0, 200)}` },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed: ${e.message}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
