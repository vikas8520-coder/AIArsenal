import { NextResponse } from "next/server";
import { TOOLS } from "../../../src/data/tools";
import {
  ARCHETYPES,
  scoreArchetypes,
  ANSWER_LABELS,
} from "../../../src/data/quiz-archetypes";
import { STACKS } from "../../../src/data/stacks";

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

function buildPrompt(archetype, answers, candidateTools) {
  const answerLines = Object.entries(answers || {})
    .map(([dim, key]) => `  ${dim}: ${ANSWER_LABELS[dim]?.[key] || key}`)
    .join("\n");

  const toolList = candidateTools
    .map(
      (t) =>
        `ID:${t.id} | ${t.name} | ${t.category} > ${t.subcategory} | ${t.desc} | Free: ${t.free}${t.oss ? " | OSS" : ""}`
    )
    .join("\n");

  const relatedStacks = STACKS.filter((s) =>
    s.roles.some((r) => candidateTools.some((c) => c.id === r.toolId))
  )
    .slice(0, 4)
    .map((s) => `  - /stacks/${s.slug} — ${s.title}`)
    .join("\n");

  return `You're picking 5–7 AI tools for a user who took AIArsenal's quiz.

USER ANSWERS:
${answerLines}

ARCHETYPE: ${archetype.name} — "${archetype.tagline}"
Identity: ${archetype.identity}

CANDIDATE TOOLS (pre-ranked, pick from these):
${toolList}

${relatedStacks ? `RELEVANT CURATED STACK RECIPES:\n${relatedStacks}\n` : ""}

RULES:
- Pick 5 to 7 tools that together form a complete, working stack for this user
- Each pick must cover a distinct role (don't pick two coding assistants, etc.)
- Cover all the roles a complete stack needs for this user's goal
- Order from most-critical to least-critical
- Each tool gets a "why" line that echoes the user's answers and feels personal
- "why" lines should be 1-2 sentences, direct, specific — say WHY this tool for THIS person given THEIR answers
- Use the exact tool id from the list

Return ONLY this JSON (no markdown, no backticks):
{
  "tools": [
    { "id": "d3", "role": "AI code editor", "why": "Because you said you're a full-stack dev shipping fast, Cursor's agent mode…" }
  ]
}`;
}

// Pre-filter tools by answers → reduce the prompt size + improve quality.
function filterCandidates(answers) {
  const { technical, privacy, budget, building } = answers || {};

  let pool = TOOLS.slice();

  // Privacy filters
  if (privacy === "self-host") {
    pool = pool.filter(
      (t) =>
        t.oss ||
        /(local|self[- ]?host|on[- ]?device)/i.test(t.privacy || "") ||
        /(local|self[- ]?host|on[- ]?device)/i.test(t.desc || "")
    );
  } else if (privacy === "no-train") {
    pool = pool.filter(
      (t) =>
        t.oss ||
        /(not used to train|no data|zero.?data|opt[- ]?out|soc 2|hipaa|privacy)/i.test(
          t.privacy || ""
        )
    );
  }

  // Technical depth — if non-technical, drop hardcore infra/ml categories
  if (technical === "no-code") {
    pool = pool.filter(
      (t) =>
        t.category !== "Infrastructure" &&
        t.category !== "Open-Source Models" &&
        t.subcategory !== "ML Frameworks"
    );
  }

  // Budget — no filter, but we'll inform the prompt
  // Building goal → light category weighting by prioritizing relevant ones
  const goalCategoryWeights = {
    "ship-product": ["Developer Tools", "Infrastructure", "Cost Optimization"],
    "create-content": ["Creative AI", "End-User Tools"],
    "automate-work": ["Automation & Agents", "Business AI", "End-User Tools"],
    "replace-paid": ["End-User Tools", "Creative AI", "Open-Source Models"],
    "learn-research": ["Research & Education", "Open-Source Models", "Infrastructure"],
    "earn-income": ["AI Income", "Token Economy", "Developer Tools"],
  };
  const priorityCats = new Set(goalCategoryWeights[building] || []);

  pool.sort((a, b) => {
    const aP = priorityCats.has(a.category) ? 1 : 0;
    const bP = priorityCats.has(b.category) ? 1 : 0;
    return bP - aP;
  });

  // Cap candidates to keep the prompt tight
  return pool.slice(0, 75);
}

function fallbackPick(archetype, answers) {
  // Static fallback if Gemini fails — pick top 5 from catalog by archetype
  // scoring affinity + coverage across categories.
  const candidates = filterCandidates(answers);
  const picks = [];
  const seenCat = new Set();
  for (const t of candidates) {
    if (seenCat.has(t.category)) continue;
    picks.push({
      id: t.id,
      role: t.subcategory || t.category,
      why: `Strong match for ${archetype.name.toLowerCase()}: ${t.desc.toLowerCase()}.`,
    });
    seenCat.add(t.category);
    if (picks.length >= 6) break;
  }
  return picks;
}

export async function POST(request) {
  const body = await request.json();
  const answers = body?.answers || {};

  // Validate
  const required = ["building", "role", "budget", "technical", "privacy"];
  for (const r of required) {
    if (!answers[r]) {
      return NextResponse.json(
        { error: `Missing answer: ${r}` },
        { status: 400, headers: corsHeaders }
      );
    }
  }

  // Pick archetype by score
  const scored = scoreArchetypes(answers);
  const archetype = scored[0]?.archetype || ARCHETYPES[0];

  // If no Gemini, return fallback immediately
  if (!GEMINI_KEY) {
    return NextResponse.json(
      {
        ok: true,
        archetype: {
          slug: archetype.slug,
          name: archetype.name,
          tagline: archetype.tagline,
          identity: archetype.identity,
          emoji: archetype.emoji,
          accent: archetype.accent,
        },
        tools: fallbackPick(archetype, answers),
        source: "fallback-no-api",
      },
      { headers: corsHeaders }
    );
  }

  const candidates = filterCandidates(answers);
  const prompt = buildPrompt(archetype, answers, candidates);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) throw new Error(`AI ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text);

    // Validate + hydrate
    const tools = (parsed.tools || [])
      .filter((t) => t.id && TOOLS.find((x) => x.id === t.id))
      .slice(0, 8)
      .map((t) => ({ id: t.id, role: t.role || "", why: t.why || "" }));

    if (tools.length === 0) throw new Error("No valid tools in AI response");

    return NextResponse.json(
      {
        ok: true,
        archetype: {
          slug: archetype.slug,
          name: archetype.name,
          tagline: archetype.tagline,
          identity: archetype.identity,
          emoji: archetype.emoji,
          accent: archetype.accent,
        },
        tools,
        source: "ai",
      },
      { headers: corsHeaders }
    );
  } catch (e) {
    // Fallback if Gemini fails
    return NextResponse.json(
      {
        ok: true,
        archetype: {
          slug: archetype.slug,
          name: archetype.name,
          tagline: archetype.tagline,
          identity: archetype.identity,
          emoji: archetype.emoji,
          accent: archetype.accent,
        },
        tools: fallbackPick(archetype, answers),
        source: "fallback-ai-failed",
        error: e.message,
      },
      { headers: corsHeaders }
    );
  }
}
