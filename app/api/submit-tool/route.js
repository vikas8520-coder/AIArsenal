import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Tool Submissions";

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
  const { name, url: toolUrl, category, subcategory, description, free_tier, company, oss, submitter_email } = await request.json();

  if (!name || !toolUrl || !category) {
    return NextResponse.json({ success: false, error: "name, url, and category are required" }, { status: 400, headers: corsHeaders });
  }

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  try {
    const airtableRes = await fetch(airtableUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        records: [{
          fields: {
            name: name.slice(0, 200),
            url: toolUrl.slice(0, 500),
            category,
            subcategory: (subcategory || "").slice(0, 200),
            description: (description || "").slice(0, 2000),
            free_tier: (free_tier || "").slice(0, 500),
            company: (company || "").slice(0, 200),
            oss: !!oss,
            submitter_email: (submitter_email || "").slice(0, 200),
            status: "Pending",
            submitted_at: new Date().toISOString(),
            notes: "",
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
    return NextResponse.json({ success: false, error: "Failed to submit tool" }, { status: 500, headers: corsHeaders });
  }
}
