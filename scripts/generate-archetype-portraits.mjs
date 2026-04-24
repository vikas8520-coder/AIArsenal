#!/usr/bin/env node
/**
 * Generate 10 archetype portrait images via Pollinations.ai (no auth, free).
 * Each image is saved to public/archetypes/{slug}.webp.
 *
 * Run:
 *   node scripts/generate-archetype-portraits.mjs
 *   node scripts/generate-archetype-portraits.mjs --force  # regen existing
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "archetypes");

mkdirSync(OUT_DIR, { recursive: true });

const { ARCHETYPES } = await import(join(ROOT, "src", "data", "quiz-archetypes.js"));

const force = process.argv.includes("--force");

const BASE_NEGATIVE =
  "text, watermark, logo, signature, letters, words, low quality, blurry, distorted";

async function generateOne(archetype, attempt = 1) {
  const prompt = `${archetype.portraitPrompt}. High quality digital art, editorial portrait, no text, no letters, sharp focus, cinematic composition`;
  // Pollinations image API: https://image.pollinations.ai/prompt/{prompt}?...
  const params = new URLSearchParams({
    width: "768",
    height: "768",
    seed: String(42 + attempt),
    model: "flux",
    nologo: "true",
    enhance: "true",
    negative: BASE_NEGATIVE,
  });
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return generateOne(archetype, attempt + 1);
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = join(OUT_DIR, `${archetype.slug}.webp`);
  // Pollinations returns jpeg/png — we save as-is with .webp extension for
  // consistency. Browsers serve it correctly via Content-Type from the file.
  // Actually we must use the correct extension — save as .jpg.
  const jpgPath = join(OUT_DIR, `${archetype.slug}.jpg`);
  writeFileSync(jpgPath, buf);
  return { path: jpgPath, bytes: buf.length };
}

console.log(`📸 Generating ${ARCHETYPES.length} archetype portraits via Pollinations.ai`);
const startTime = Date.now();
let ok = 0;
let skipped = 0;
let failed = 0;

for (const archetype of ARCHETYPES) {
  const outPath = join(OUT_DIR, `${archetype.slug}.jpg`);
  if (existsSync(outPath) && !force) {
    console.log(`  - ${archetype.slug.padEnd(20)} (skipped, exists)`);
    skipped++;
    continue;
  }
  try {
    const result = await generateOne(archetype);
    const kb = (result.bytes / 1024).toFixed(0);
    console.log(`  ✓ ${archetype.slug.padEnd(20)} ${kb}KB`);
    ok++;
  } catch (e) {
    console.log(`  ✗ ${archetype.slug.padEnd(20)} ${e.message}`);
    failed++;
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(
  `\n⏱  Done in ${elapsed}s · ${ok} generated · ${skipped} skipped · ${failed} failed`
);
console.log(`📁 Saved to public/archetypes/`);
