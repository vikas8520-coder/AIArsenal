import { NextResponse } from "next/server";
import { TOOLS } from "../../../src/data/tools";
import { PAID_TOOLS } from "../../../src/data/paid-tools";

const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const maxDuration = 30;

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function buildPrompt(paidTool, useCase, monthlyCost) {
  const candidates = TOOLS.map(
    (t) =>
      `ID:${t.id} | ${t.name} | ${t.category} > ${t.subcategory} | ${t.desc} | Free: ${t.free}${t.oss ? " | OSS" : ""}`
  ).join("\n");

  const paidContext = PAID_TOOLS.find(
    (p) => p.name.toLowerCase() === (paidTool || "").toLowerCase()
  );
  const paidLine = paidContext
    ? `\nReference paid context: ${paidContext.name} (${paidContext.category}) — ${paidContext.bestFor}. Pricing: ${paidContext.pricing.tiers.map((t) => `${t.label} ${t.price}`).join(", ")}.`
    : "";

  return `You're helping a user migrate AWAY from a paid AI tool to free alternatives from AIArsenal's catalog.

USER IS ON: ${paidTool || "(unspecified paid tool)"}${paidLine}
${useCase ? `USE CASE: ${useCase}` : ""}
${monthlyCost ? `CURRENT SPEND: ${monthlyCost}` : ""}

CATALOG (pick alternatives ONLY from these — exact id):
${candidates}

Return ONLY this JSON shape (no markdown, no backticks):
{
  "bestAlternative": { "id": "<tool_id>", "why": "<2-3 sentence reason>" },
  "alternatives": [
    { "id": "<tool_id>", "why": "<1-2 sentence reason>" }
  ],
  "caveats": [
    "<thing you lose by switching, 1 sentence each>"
  ],
  "migrationSteps": [
    "<concrete step 1>",
    "<concrete step 2>"
  ],
  "estimatedSavings": "<dollar amount or range, e.g. '$20/mo' or '$240/yr'>"
}

RULES:
- bestAlternative must be the single closest free replacement
- alternatives: 2–4 OTHER good options, ranked
- caveats: 2–4 honest tradeoffs (rate limits, missing features, etc.)
- migrationSteps: 3–5 concrete steps to actually switch over
- Use exact tool ids only
- If the paid tool is fundamentally hard to replace for free, say so in the bestAlternative.why and pick the closest still`;
}

export async function POST(request) {
  if (!GEMINI_KEY) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 500, headers: corsHeaders }
    );
  }

  const body = await request.json();
  const { paidTool, useCase, monthlyCost } = body;

  if (!paidTool || typeof paidTool !== "string") {
    return NextResponse.json(
      { error: "paidTool is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const prompt = buildPrompt(paidTool, useCase, monthlyCost);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `AI: ${err.slice(0, 200)}` },
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text);

    // Hydrate tool ids → full tool objects
    const hydrate = (entry) => {
      const tool = TOOLS.find((t) => t.id === entry?.id);
      return tool ? { id: tool.id, name: tool.name, desc: tool.desc, free: tool.free, why: entry.why || "" } : null;
    };

    return NextResponse.json(
      {
        ok: true,
        bestAlternative: hydrate(parsed.bestAlternative),
        alternatives: (parsed.alternatives || [])
          .map(hydrate)
          .filter(Boolean)
          .slice(0, 5),
        caveats: parsed.caveats || [],
        migrationSteps: parsed.migrationSteps || [],
        estimatedSavings: parsed.estimatedSavings || "",
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
