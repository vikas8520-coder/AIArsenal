import { NextResponse } from "next/server";
import { TOOLS } from "../../../src/data/tools";
import {
  PAID_TOOLS,
  BUDGET_BLUEPRINTS,
  COST_STRATEGIES,
} from "../../../src/data/paid-tools";

const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function buildCatalog() {
  return TOOLS.map(
    (t) =>
      `ID:${t.id} | ${t.name} | ${t.category} > ${t.subcategory} | ${t.desc}. Free: ${t.free}${t.oss ? " | OSS" : ""}`
  ).join("\n");
}

function buildPaidContext() {
  return PAID_TOOLS.map(
    (p) =>
      `${p.name} (${p.category}): ${p.pricing.tiers.map((t) => `${t.label} ${t.price}`).join(", ")}. Best for: ${p.bestFor}`
  ).join("\n");
}

function buildSystemPrompt() {
  return `You are the AIArsenal assistant — an expert curator of ${TOOLS.length}+ AI tools.
You help users find the right tools, plan AI stacks, compare options, and understand pricing tradeoffs.

TONE: Direct, helpful, opinionated. Use plain English. No filler. Keep replies tight.

RESPONSE FORMAT — return ONLY valid JSON (no markdown, no backticks):
{
  "answer": "2-5 sentence direct answer to the user",
  "tool_ids": ["d3", "e1"],
  "followups": ["Suggested follow-up 1", "Suggested follow-up 2", "Suggested follow-up 3"]
}

RULES:
- tool_ids must reference exact IDs from the catalog below (0-8 ids)
- followups: 2-4 short natural-language questions the user might ask next
- If you don't know, say so honestly — don't invent tools
- If the user is vague ("what's good for AI"), ask a clarifying question in "answer" and leave tool_ids empty
- If they ask about a tool not in the catalog, mention it honestly and recommend the closest match that IS in the catalog

CATALOG:
${buildCatalog()}

PAID ALTERNATIVES (for context when users ask about paid options):
${buildPaidContext()}

BUDGET BLUEPRINTS:
${Object.entries(BUDGET_BLUEPRINTS)
  .map(([k, v]) => `- ${v.label} (${v.monthlyBudget}): ${v.description}`)
  .join("\n")}

COST STRATEGIES: ${COST_STRATEGIES.map((s) => s.name).join(", ")}`;
}

async function logQuestion(question, turn) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return;
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent("ChatQuestions")}`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              question: question.slice(0, 500),
              turn,
              asked_at: new Date().toISOString(),
            },
          },
        ],
      }),
    });
  } catch {
    // Silent — logging must never block chat.
  }
}

export async function POST(request) {
  if (!GEMINI_KEY) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 500, headers: corsHeaders }
    );
  }

  const body = await request.json();
  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages array required" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Fire-and-forget log the latest user question.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser?.content) {
    logQuestion(lastUser.content, messages.length);
  }

  const systemPrompt = buildSystemPrompt();

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [
        {
          text: "Understood. I'll respond with JSON containing answer, tool_ids, and followups.",
        },
      ],
    },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json(
        { error: `AI error: ${err}` },
        { status: geminiRes.status, headers: corsHeaders }
      );
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json(
          { error: "Invalid AI response" },
          { status: 500, headers: corsHeaders }
        );
      }
      parsed = JSON.parse(match[0]);
    }

    const tools = (parsed.tool_ids || [])
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter(Boolean)
      .slice(0, 8);

    return NextResponse.json(
      {
        answer: parsed.answer || "",
        tools,
        followups: parsed.followups || [],
      },
      { headers: corsHeaders }
    );
  } catch (e) {
    return NextResponse.json(
      { error: `Chat failed: ${e.message}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
