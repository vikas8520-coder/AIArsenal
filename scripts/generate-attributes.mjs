#!/usr/bin/env node
/**
 * Generate bestFor / notFor editorial attributes for every tool that
 * doesn't already have them. Reads tool-attributes.js, finds missing
 * entries, calls Gemini 2.5 Flash for each, and appends back into the file.
 *
 * Run:
 *   node scripts/generate-attributes.mjs            # fill in gaps
 *   node scripts/generate-attributes.mjs --force    # regenerate everything
 *
 * Needs GOOGLE_AI_API_KEY in .env.local (Vercel pull) or environment.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ATTRS_PATH = join(ROOT, "src", "data", "tool-attributes.js");

// ── Load env ────────────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf-8");
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    // Strip matching double or single quotes
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvLocal();

const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY;
if (!GEMINI_KEY) {
  console.error("❌ GOOGLE_AI_API_KEY missing. Run: vercel env pull .env.local");
  process.exit(1);
}

// ── Load tools + existing attributes ────────────────────────────────────────
const { TOOLS } = await import(join(ROOT, "src", "data", "tools.js"));
const { TOOL_ATTRIBUTES } = await import(
  join(ROOT, "src", "data", "tool-attributes.js")
);

const force = process.argv.includes("--force");
const todo = TOOLS.filter((t) => force || !TOOL_ATTRIBUTES[t.id]);

if (todo.length === 0) {
  console.log("✅ All tools already have attributes. Use --force to regenerate.");
  process.exit(0);
}

console.log(
  `📋 ${todo.length} tools need attributes${force ? " (forced)" : ""} of ${TOOLS.length} total`
);

// ── Prompt builder ──────────────────────────────────────────────────────────
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

async function generateOne(tool, attempt = 1) {
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
    if (attempt < 2 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return generateOne(tool, attempt + 1);
    }
    throw new Error(`${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed.bestFor) || !Array.isArray(parsed.notFor)) {
    throw new Error("Invalid shape from AI");
  }

  return {
    bestFor: parsed.bestFor.slice(0, 4).map((s) => String(s).trim()),
    notFor: parsed.notFor.slice(0, 3).map((s) => String(s).trim()),
  };
}

// ── Process in small parallel batches ───────────────────────────────────────
const BATCH = 5;
const results = {};
let done = 0;
const startTime = Date.now();

for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  await Promise.all(
    batch.map(async (tool) => {
      try {
        const attrs = await generateOne(tool);
        results[tool.id] = attrs;
        done++;
        console.log(
          `  ✓ ${String(done).padStart(3)}/${todo.length}  ${tool.id.padEnd(5)} ${tool.name}`
        );
      } catch (e) {
        console.log(`  ✗ ${tool.id.padEnd(5)} ${tool.name} — ${e.message}`);
      }
    })
  );
  // Small pacing between batches to stay under rate limits
  if (i + BATCH < todo.length) await new Promise((r) => setTimeout(r, 500));
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n⏱  Generated ${Object.keys(results).length} in ${elapsed}s`);

// ── Merge + write back ──────────────────────────────────────────────────────
const merged = force ? results : { ...TOOL_ATTRIBUTES, ...results };

function serializeAttrs(attrs) {
  const entries = Object.keys(attrs).sort().map((id) => {
    const { bestFor, notFor } = attrs[id];
    const b = bestFor.map((s) => `      ${JSON.stringify(s)}`).join(",\n");
    const n = notFor.map((s) => `      ${JSON.stringify(s)}`).join(",\n");
    return `  ${id}: {\n    bestFor: [\n${b},\n    ],\n    notFor: [\n${n},\n    ],\n  },`;
  });
  return entries.join("\n");
}

const header = `// Decision-guide attributes layered on top of tools.js by tool id.
// Each entry: { bestFor: [2-4 short lines], notFor: [2-3 short lines] }.
// Used by ToolCard, ToolPageClient, and ComparePageClient when present.
//
// Regenerate missing entries:
//   node scripts/generate-attributes.mjs
// Force-regenerate all:
//   node scripts/generate-attributes.mjs --force

export const TOOL_ATTRIBUTES = {
${serializeAttrs(merged)}
};

export function getAttributes(toolId) {
  return TOOL_ATTRIBUTES[toolId] || null;
}
`;

writeFileSync(ATTRS_PATH, header, "utf-8");

console.log(
  `\n✅ Wrote ${Object.keys(merged).length} total attribute entries to src/data/tool-attributes.js`
);
