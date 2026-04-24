// URL builder for Pollinations.ai image generation.
// Free, no auth. Images return as jpg/png via direct GET.
// Docs: https://pollinations.ai

const BASE_URL = "https://image.pollinations.ai/prompt";

const DEFAULT_NEGATIVE =
  "text, watermark, logo, signature, letters, words, low quality, blurry";

/**
 * Build a Pollinations image URL.
 * @param {string} prompt       - The image prompt
 * @param {object} [opts]
 * @param {number} [opts.width=1024]
 * @param {number} [opts.height=512]
 * @param {number} [opts.seed]
 * @param {string} [opts.model='flux']   - flux | turbo
 * @param {boolean} [opts.nologo=true]
 * @param {boolean} [opts.enhance=true]
 * @param {string} [opts.negative]
 */
export function pollinationsUrl(prompt, opts = {}) {
  const {
    width = 1024,
    height = 512,
    seed,
    model = "flux",
    nologo = true,
    enhance = true,
    negative = DEFAULT_NEGATIVE,
  } = opts;

  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: nologo ? "true" : "false",
    enhance: enhance ? "true" : "false",
    negative,
  });
  if (seed != null) params.set("seed", String(seed));

  return `${BASE_URL}/${encodeURIComponent(prompt)}?${params.toString()}`;
}

// Scene keywords per "building" answer used to tint the signature background.
const BUILDING_SCENES = {
  "ship-product": "cyberpunk solo founder at laptop shipping code",
  "create-content": "colorful content studio with floating cameras and microphones",
  "automate-work": "flowing automation pipelines and connected workflow nodes",
  "replace-paid": "breaking chains of paid subscriptions, liberation",
  "learn-research": "library of glowing data, neural network diagrams floating",
  "earn-income": "revenue graphs climbing, golden dollar signs, indie hacker workspace",
};

const PRIVACY_TINTS = {
  "cloud-ok": "cyan and purple neon",
  "no-train": "deep blue with cyan accents",
  "self-host": "matrix green and black, terminal aesthetic",
};

/**
 * Build a prompt for the signature background based on quiz answers.
 */
export function signatureBackgroundPrompt(answers, archetypeKeywords = "") {
  const scene =
    BUILDING_SCENES[answers.building] ||
    "futuristic AI workspace with floating interfaces";
  const palette = PRIVACY_TINTS[answers.privacy] || "cyan and purple neon";
  const extra = archetypeKeywords ? `, ${archetypeKeywords}` : "";
  return `Ultra-wide atmospheric digital art, ${scene}${extra}, ${palette} lighting, cinematic depth, subtle abstract composition, no humans, no text, wallpaper composition`;
}
