import { NextResponse } from "next/server";
import { TOOLS } from "../../../../src/data/tools";
import { STACKS } from "../../../../src/data/stacks";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const maxDuration = 60;

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function buildPrompt(question, relatedToolNames) {
  return `You are AIArsenal's editor. A reader asked the question below in the /ask chat. Draft a complete blog post answering it that ranks for SEO and feels human.

THE QUESTION: ${question}

CATALOG SUMMARY (referenceable tools — exact names):
${TOOLS.map((t) => `- ${t.name} (${t.category}): ${t.desc} | Free: ${t.free}`).slice(0, 80).join("\n")}
${relatedToolNames?.length ? `\nLikely-relevant tools: ${relatedToolNames.join(", ")}` : ""}

STRUCTURE (return ONLY valid JSON, no markdown wrapper):
{
  "slug": "<url-slug, 3-6 hyphenated words>",
  "title": "<headline, 50-65 chars, optimized for the question — include 2026 if relevant>",
  "description": "<meta description, 140-160 chars, hooks the reader>",
  "tags": ["<3-5 single-word tags>"],
  "markdown": "<full body, 800-1200 words, structured with H2 and H3 headings, opinionated, conversational, with concrete tool recommendations linked inline as [Tool Name](https://aiarsenal-nu.vercel.app/tools/tool-slug). End with a CTA paragraph linking to /quiz or /stacks.>"
}

RULES:
- Direct, opinionated voice. No corporate filler.
- Cite specific tools by exact name. Use markdown links to /tools/[slug] for the top mentions.
- Open with a punchy intro that restates the question.
- Use H2 for main sections, H3 for subsections.
- Include at least one numbered list and at least one bullet list.
- End with a "What to do next" section linking to /quiz or /stacks.
- ~1000 words is ideal — readable in ~5 minutes.`;
}

export async function POST(request) {
  if (!ADMIN_PASSWORD || !GEMINI_KEY) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500, headers: corsHeaders }
    );
  }

  const body = await request.json();
  const { password, question, relatedToolNames } = body;
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: corsHeaders }
    );
  }
  if (!question || typeof question !== "string") {
    return NextResponse.json(
      { error: "question is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const prompt = buildPrompt(question, relatedToolNames || []);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.55,
            maxOutputTokens: 8000,
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

    return NextResponse.json(
      {
        ok: true,
        slug: parsed.slug || "",
        title: parsed.title || "",
        description: parsed.description || "",
        tags: parsed.tags || [],
        markdown: parsed.markdown || "",
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
