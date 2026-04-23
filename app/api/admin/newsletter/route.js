import { NextResponse } from "next/server";
import { TOOLS } from "../../../../src/data/tools";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function getRecentTools(days = 14) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return TOOLS.filter((t) => {
    if (!t.dateAdded) return false;
    return new Date(t.dateAdded).getTime() >= cutoff;
  });
}

export async function POST(request) {
  if (!ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env var not set" },
      { status: 500, headers: corsHeaders }
    );
  }

  const { password, topQuestions = [], topToolClicks = [] } = await request.json();
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: corsHeaders }
    );
  }

  if (!GEMINI_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY not set" },
      { status: 500, headers: corsHeaders }
    );
  }

  const recent = getRecentTools(14);
  const recentList = recent
    .map((t) => `- ${t.name} (${t.category} > ${t.subcategory}): ${t.desc}. Free: ${t.free}`)
    .join("\n");

  const trendingQuestions = topQuestions
    .slice(0, 10)
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  const trendingTools = topToolClicks
    .slice(0, 8)
    .map((t, i) => `${i + 1}. ${t}`)
    .join("\n");

  const prompt = `You are the editor of AIArsenal's weekly newsletter. Draft THIS WEEK's edition.

TITLE FORMAT: "AIArsenal Weekly — [punchy theme in 4-6 words]"

NEW TOOLS THIS FORTNIGHT (add prominently if non-empty):
${recentList || "(none added recently — skip this section)"}

TRENDING QUESTIONS FROM /ask THIS WEEK:
${trendingQuestions || "(no data)"}

MOST-CLICKED TOOLS THIS WEEK:
${trendingTools || "(no data)"}

WRITE THE NEWSLETTER IN MARKDOWN. STRUCTURE:

# Title
Hook paragraph (2-3 sentences that tie the week together).

## Tools added this week
For each new tool: bold name, one sentence on what it does, one on why someone would pick it.

## What you're asking about
Pick 2-3 of the most interesting /ask questions. For each: restate it, then give a 2-4 sentence opinionated answer with tool recommendations inline (Tool Name style, no links needed).

## What you're clicking
One short paragraph. What does this say about what's hot this week?

## Ask AIArsenal
End with a one-line CTA driving to https://ai-arsenal-nu.vercel.app/ask

TONE: Direct, opinionated, a little bit of edge. Like a trusted friend who actually uses these tools. No corporate newsletter fluff. No emoji spam. Don't start sentences with "In this issue...". Plain English only.

OUTPUT ONLY the markdown. No preamble, no signoff like "Best, the team".`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `AI: ${err}` },
        { status: 500, headers: corsHeaders }
      );
    }
    const data = await res.json();
    const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json(
      {
        ok: true,
        markdown,
        meta: {
          recentToolCount: recent.length,
          questionsConsidered: topQuestions.length,
          toolClicksConsidered: topToolClicks.length,
        },
      },
      { headers: corsHeaders }
    );
  } catch (e) {
    return NextResponse.json(
      { error: `Failed: ${e.message}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
