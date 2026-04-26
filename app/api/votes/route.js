import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "ToolVotes";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Cache aggregated vote counts for 5 minutes — Airtable rate limits at
// 5 req/sec per base, and a popular tool page can easily flood that.
export const revalidate = 300;

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

async function fetchAllVotes() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return [];
  const records = [];
  let offset = "";
  do {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}?pageSize=100&fields[]=tool_id&fields[]=vote${offset ? `&offset=${offset}` : ""}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        next: { revalidate: 300 },
      });
      if (!res.ok) break;
      const data = await res.json();
      records.push(...(data.records || []));
      offset = data.offset || "";
    } catch {
      break;
    }
  } while (offset && records.length < 5000);
  return records;
}

export async function GET() {
  const records = await fetchAllVotes();
  const counts = {};
  for (const r of records) {
    const id = r.fields?.tool_id;
    const v = r.fields?.vote;
    if (!id || (v !== "up" && v !== "down")) continue;
    if (!counts[id]) counts[id] = { up: 0, down: 0 };
    counts[id][v]++;
  }
  return NextResponse.json(
    { ok: true, counts, totalVotes: records.length },
    {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
