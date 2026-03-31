import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Feedback";

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
  try {
    const airtableRes = await fetch(
      `${url}?filterByFormula=${encodeURIComponent("{approved}=TRUE()")}&sort%5B0%5D%5Bfield%5D=timestamp&sort%5B0%5D%5Bdirection%5D=desc`,
      { headers }
    );
    const data = await airtableRes.json();
    const testimonials = (data.records || []).map((r) => ({
      name: r.fields.name || "Anonymous",
      category: r.fields.category || "",
      message: r.fields.message || "",
      rating: r.fields.rating || 5,
    }));
    return NextResponse.json({ success: true, testimonials }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch testimonials" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
  const { name, category, message, rating, email } = await request.json();

  if (!message || !category) {
    return NextResponse.json({ success: false, error: "message and category are required" }, { status: 400, headers: corsHeaders });
  }

  try {
    const airtableRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        records: [{
          fields: {
            name: (name || "Anonymous").slice(0, 100),
            category,
            message: message.slice(0, 2000),
            rating: Math.min(Math.max(Number(rating) || 5, 1), 5),
            email: (email || "").slice(0, 200),
            timestamp: new Date().toISOString(),
            approved: false,
          },
        }],
      }),
    });

    if (!airtableRes.ok) {
      const err = await airtableRes.json();
      return NextResponse.json({ success: false, error: err }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500, headers: corsHeaders });
  }
}
