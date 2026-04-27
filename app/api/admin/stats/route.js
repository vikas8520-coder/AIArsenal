import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY;
const PLAUSIBLE_SITE_ID =
  process.env.PLAUSIBLE_SITE_ID || "aiarsenal.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function unauthorized(msg = "unauthorized") {
  return NextResponse.json({ error: msg }, { status: 401, headers: corsHeaders });
}

async function fetchAirtable(table, params = "") {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return [];
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}${params}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.records || [];
  } catch {
    return [];
  }
}

async function fetchPlausible(endpoint, params) {
  if (!PLAUSIBLE_API_KEY) return null;
  const url = `https://plausible.io/api/v1/stats/${endpoint}?site_id=${PLAUSIBLE_SITE_ID}&${params}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${PLAUSIBLE_API_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function summarize(records, field) {
  const counts = {};
  for (const r of records) {
    const v = r.fields?.[field];
    if (!v) continue;
    counts[v] = (counts[v] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([k, v]) => ({ key: k, count: v }))
    .sort((a, b) => b.count - a.count);
}

export async function POST(request) {
  if (!ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env var not set" },
      { status: 500, headers: corsHeaders }
    );
  }

  const { password } = await request.json();
  if (password !== ADMIN_PASSWORD) return unauthorized("bad password");

  // ── Airtable data ──
  const [leads, questions, submissions] = await Promise.all([
    fetchAirtable("Leads", "?pageSize=100&sort[0][field]=subscribed_at&sort[0][direction]=desc"),
    fetchAirtable("ChatQuestions", "?pageSize=100&sort[0][field]=asked_at&sort[0][direction]=desc"),
    fetchAirtable("FeaturedSubmissions", "?pageSize=50&sort[0][field]=created_at&sort[0][direction]=desc"),
  ]);

  const recentSubmissions = submissions.slice(0, 20).map((r) => ({
    eventType: r.fields?.event_type || "—",
    tier: r.fields?.tier || "—",
    toolName: r.fields?.tool_name || "—",
    toolUrl: r.fields?.tool_url || "",
    contactName: r.fields?.contact_name || "",
    contactEmail: r.fields?.contact_email || "",
    pitch: r.fields?.pitch || "",
    amount: r.fields?.amount || "",
    status: r.fields?.status || "",
    at: r.fields?.created_at || r.createdTime,
  }));

  const leadSources = summarize(leads, "source");
  const recentLeads = leads.slice(0, 20).map((r) => ({
    email: r.fields?.email || "—",
    source: r.fields?.source || "—",
    at: r.fields?.subscribed_at || r.createdTime,
  }));

  const recentQuestions = questions.slice(0, 30).map((r) => ({
    question: r.fields?.question || "—",
    turn: r.fields?.turn || 1,
    at: r.fields?.asked_at || r.createdTime,
  }));

  // ── Plausible data (7-day window) ──
  const [topPages, topEvents, aggregate, topSources] = await Promise.all([
    fetchPlausible("breakdown", "period=7d&property=event:page&limit=12"),
    fetchPlausible("breakdown", "period=7d&property=event:goal&limit=20"),
    fetchPlausible("aggregate", "period=7d&metrics=visitors,pageviews,bounce_rate"),
    fetchPlausible("breakdown", "period=7d&property=visit:source&limit=8"),
  ]);

  // ── Affiliate/tool clicks from Plausible events ──
  const affiliateProps = await fetchPlausible(
    "breakdown",
    "period=7d&property=event:props:tool&filters=event:goal%3D%3DAffiliate%20Click&limit=10"
  );
  const toolProps = await fetchPlausible(
    "breakdown",
    "period=7d&property=event:props:tool&filters=event:goal%3D%3DTool%20Click&limit=10"
  );

  return NextResponse.json(
    {
      ok: true,
      leads: {
        total: leads.length,
        recent: recentLeads,
        sources: leadSources,
      },
      questions: {
        total: questions.length,
        recent: recentQuestions,
      },
      featuredSubmissions: {
        total: submissions.length,
        pendingCount: submissions.filter(
          (r) => r.fields?.status === "pending_review"
        ).length,
        recent: recentSubmissions,
      },
      plausible: {
        configured: Boolean(PLAUSIBLE_API_KEY),
        aggregate: aggregate?.results || null,
        topPages: topPages?.results || [],
        topSources: topSources?.results || [],
        topEvents: topEvents?.results || [],
        topAffiliateClicks: affiliateProps?.results || [],
        topToolClicks: toolProps?.results || [],
      },
    },
    { headers: corsHeaders }
  );
}
