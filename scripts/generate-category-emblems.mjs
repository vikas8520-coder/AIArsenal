#!/usr/bin/env node
/**
 * Generate one minimalist emblem image per AIArsenal category via
 * Pollinations.ai (free, no auth). Saves to public/categories/{id}.webp
 * (we save as .jpg actually since Pollinations returns jpeg).
 *
 * Run:
 *   node scripts/generate-category-emblems.mjs
 *   node scripts/generate-category-emblems.mjs --force  # regen existing
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "categories");

mkdirSync(OUT_DIR, { recursive: true });

const { CATEGORIES } = await import(join(ROOT, "src", "data", "categories.js"));

const force = process.argv.includes("--force");

// One concept seed per category. Tuned to be:
//   - minimal (single subject, no clutter)
//   - color-aligned with category accent
//   - dark background (so they sit on the cyberpunk theme)
//   - icon-style (not detailed scenes)
const PROMPTS = {
  all: "minimalist hexagonal lattice emblem, cyan and magenta glow, dark background, abstract icon, geometric, sharp focus",
  "Developer Tools": "minimalist green circuit board emblem, glowing nodes connected by lines, pure black background, flat icon style, no text",
  "End-User Tools": "minimalist pink abstract human silhouette emblem, soft glow, pure black background, simple icon style",
  "Creative AI": "minimalist gold spark burst emblem, abstract creative explosion, pure black background, icon style, sharp",
  "Open-Source Models": "minimalist purple and green hexagon emblem with branching lines, pure black background, icon style",
  Infrastructure: "minimalist orange server rack stack emblem, glowing edges, pure black background, isometric icon",
  "Research & Education": "minimalist blue book and atom emblem, soft glow, pure black background, icon style",
  "Automation & Agents": "minimalist green flowing arrow loop emblem, automation cycle, pure black background, icon style",
  "Business AI": "minimalist orange chart bars going up emblem, pure black background, icon style",
  "Safety & Ethics": "minimalist red shield emblem with checkmark, pure black background, icon style, sharp",
  "Token Economy": "minimalist cyan diamond crypto emblem, faceted gem, pure black background, icon style",
  "AI Income": "minimalist green dollar sign growing emblem, pure black background, icon style",
  "Cost Optimization": "minimalist pink lightning savings emblem, pure black background, icon style",
  "Personal AI Systems": "minimalist purple brain network emblem, glowing synapses, pure black background, icon style",
};

async function generateOne(category, attempt = 1) {
  const prompt =
    PROMPTS[category.id] ||
    `minimalist abstract ${category.color} emblem, pure black background, icon style`;
  const finalPrompt = `${prompt}. High quality digital art, no text, no letters, vector-clean, square composition`;
  const params = new URLSearchParams({
    width: "512",
    height: "512",
    seed: String(11 + attempt + category.id.length),
    model: "flux",
    nologo: "true",
    enhance: "true",
    negative: "text, watermark, letters, words, low quality, blurry, distorted, photo, realistic, complex scene, multiple subjects",
  });
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?${params.toString()}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return generateOne(category, attempt + 1);
    }
    throw new Error(`HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const safeId = category.id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const outPath = join(OUT_DIR, `${safeId}.jpg`);
  writeFileSync(outPath, buf);
  return { path: outPath, bytes: buf.length };
}

console.log(`🎨 Generating ${CATEGORIES.length} category emblems via Pollinations.ai`);
const startTime = Date.now();
let ok = 0;
let skipped = 0;
let failed = 0;

for (const category of CATEGORIES) {
  const safeId = category.id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const outPath = join(OUT_DIR, `${safeId}.jpg`);
  if (existsSync(outPath) && !force) {
    console.log(`  - ${safeId.padEnd(22)} (skipped, exists)`);
    skipped++;
    continue;
  }
  try {
    const result = await generateOne(category);
    const kb = (result.bytes / 1024).toFixed(0);
    console.log(`  ✓ ${safeId.padEnd(22)} ${kb}KB`);
    ok++;
  } catch (e) {
    console.log(`  ✗ ${safeId.padEnd(22)} ${e.message}`);
    failed++;
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n⏱  Done in ${elapsed}s · ${ok} generated · ${skipped} skipped · ${failed} failed`);
console.log(`📁 Saved to public/categories/`);
