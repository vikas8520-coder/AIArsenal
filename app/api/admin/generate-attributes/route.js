import { NextResponse } from "next/server";
import { TOOLS } from "../../../../src/data/tools";
import { TOOL_ATTRIBUTES } from "../../../../src/data/tool-attributes";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const maxDuration = 60; // Vercel Pro allows 60s; default 10s on Hobby

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function buildPrompt(tool) {
  return `You are writing editorial decision-guide attributes for a directory of free AI tools.

TOOL:
- Name: ${tool.name}
- Category: ${tool.category} > ${tool.subcategory || ""}
- Company: ${tool.company}
- Free tier: ${tool.free}
- Open source: ${tool.oss ? "yes" : "no"}
- Privacy: ${tool.privacy || "unspecified"}
- Description: ${tool.desc}
- Detail: ${tool.detail || ""}

Write 3 bestFor lines and 2 notFor lines. Each line ≤ 85 characters. Be specific and opinionated — what *kind of user* wins with this tool, and what kind should skip it. No filler, no generic "beginners and pros alike".

Return ONLY this JSON shape — no markdown, no backticks:
{"bestFor":["…","…","…"],"notFor":["…","…"]}`;
}

async function generateOne(tool) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(tool) }] }],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json",
        },
      }),
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.bestFor) || !Array.isArray(parsed.notFor)) {
    throw new Error("bad shape");
  }
  return {
    bestFor: parsed.bestFor.slice(0, 4).map((s) => String(s).trim()),
    notFor: parsed.notFor.slice(0, 3).map((s) => String(s).trim()),
  };
}

export async function POST(request) {
  if (!ADMIN_PASSWORD || !GEMINI_KEY) {
    return NextResponse.json(
      { error: "Missing env vars" },
      { status: 500, headers: corsHeaders }
    );
  }

  const body = await request.json();
  const { password, startIdx = 0, count = 20, force = false } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: corsHeaders }
    );
  }

  const candidates = TOOLS.filter(
    (t) => force || !TOOL_ATTRIBUTES[t.id]
  );
  const slice = candidates.slice(startIdx, startIdx + count);

  const out = {};
  const errors = [];

  // Run in parallel within this batch (fast enough for 10-20 tools)
  const results = await Promise.allSettled(
    slice.map((t) => generateOne(t).then((attrs) => ({ id: t.id, attrs })))
  );

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const t = slice[i];
    if (r.status === "fulfilled") {
      out[r.value.id] = r.value.attrs;
    } else {
      errors.push({ id: t.id, name: t.name, error: r.reason?.message || "?" });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      generated: out,
      errors,
      remaining: Math.max(0, candidates.length - (startIdx + slice.length)),
      totalMissing: candidates.length,
    },
    { headers: corsHeaders }
  );
}
