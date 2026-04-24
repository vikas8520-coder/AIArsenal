import { NextResponse } from "next/server";
import { TOOLS } from "../../../src/data/tools";

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

function buildPrompt(stack, framework) {
  const toolLines = stack.roles
    .map((r) => {
      const t = TOOLS.find((x) => x.id === r.toolId);
      if (!t) return null;
      return `- ${r.label || t.subcategory || "Tool"}: **${t.name}** (${t.url})
  - What it does: ${t.desc}
  - Free tier: ${t.free}
  - ${t.oss ? "Open source" : "Closed source"}
  - Tags: ${(t.tags || []).join(", ")}`;
    })
    .filter(Boolean)
    .join("\n");

  return `You are generating a complete starter kit document for a developer who picked this AI stack.

STACK NAME: ${stack.name || "Custom AI Stack"}
STACK GOAL: ${stack.description || "Build something with AI"}
TARGET FRAMEWORK: ${framework}

TOOLS IN THE STACK:
${toolLines}

OUTPUT: A single comprehensive Markdown document that a developer can follow end-to-end to scaffold a real project with these tools wired together. STRUCTURE EXACTLY LIKE THIS (use these H2 headings):

# [Stack Name] — Starter Kit
Short 2-sentence intro.

## Architecture
A short prose paragraph describing how the tools interact. Then a mermaid diagram in a \`\`\`mermaid code block showing data flow between the tools. Keep the diagram simple (5-8 nodes).

## Prerequisites
Bulleted list: Node version, Python version if needed, CLI tools, OS assumptions, required accounts.

## Environment Variables
A \`\`\`env code block with every API key / config var the stack needs, with inline comments explaining where to get each.

## Project Structure
A \`\`\`text code block showing the recommended file tree (use tree-style ascii with box-drawing chars).

## Setup — Step by Step
For each tool in the stack, a numbered step. Each step has:
- ### N. [Role]: [Tool Name]
- install command(s) in \`\`\`bash block
- initialization / config code in a \`\`\`${framework === "Next.js + TypeScript" ? "typescript" : framework === "Python / FastAPI" ? "python" : "javascript"} block (make it REAL working code, not pseudocode)
- 1-2 sentence explanation of what this code does

## Wiring It Together
Show a single integration example that ties the main tools together (e.g., a chat endpoint that calls the LLM + logs to observability + uses memory). Real code, \`\`\`${framework === "Next.js + TypeScript" ? "typescript" : framework === "Python / FastAPI" ? "python" : "javascript"} block.

## Run & Test
Commands to run the dev server + a curl / http example to hit an endpoint.

## Deploy
Short paragraph + deployment commands. Recommend Vercel for Next, Fly/Railway for others.

## Cost at Scale
Realistic paragraph: "If you hit 10K daily users, expect to pay roughly..." — base it on each tool's free-tier limits.

## Common Pitfalls
3-5 bullets of watch-outs specific to THIS combination of tools (rate limits colliding, which tool to cache first, etc).

RULES:
- Return ONLY the markdown. No preamble, no "here's your starter kit" intro.
- Write REAL working code, not TODO comments.
- Reference tools by their exact names from the list.
- Keep prose tight. No fluff. This is a senior engineer's README, not a marketing doc.
- Total length ~1500-2500 words.`;
}

export async function POST(request) {
  if (!GEMINI_KEY) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 500, headers: corsHeaders }
    );
  }

  const body = await request.json();
  const { stack, framework = "Next.js + TypeScript" } = body;

  if (!stack || !Array.isArray(stack.roles) || stack.roles.length === 0) {
    return NextResponse.json(
      { error: "stack.roles[] required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const validRoles = stack.roles.filter((r) =>
    TOOLS.find((t) => t.id === r.toolId)
  );
  if (validRoles.length === 0) {
    return NextResponse.json(
      { error: "No valid tool ids in stack" },
      { status: 400, headers: corsHeaders }
    );
  }

  const prompt = buildPrompt(
    { ...stack, roles: validRoles },
    framework
  );

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
            maxOutputTokens: 8000,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `AI error: ${err.slice(0, 200)}` },
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await res.json();
    let markdown = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip any ```markdown wrapper the model may add
    markdown = markdown
      .replace(/^```(?:markdown|md)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    return NextResponse.json(
      {
        ok: true,
        markdown,
        meta: {
          toolCount: validRoles.length,
          framework,
          tokenEstimate: data.usageMetadata?.totalTokenCount || null,
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
