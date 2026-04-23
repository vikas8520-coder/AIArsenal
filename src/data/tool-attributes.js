// Decision-guide attributes layered on top of tools.js by tool id.
// Each entry: { bestFor: [2-4 short lines], notFor: [2-3 short lines] }.
// Used by ToolCard, ToolPageClient, and ComparePageClient when present.
//
// Regenerate missing entries:
//   node scripts/generate-attributes.mjs
// Force-regenerate all:
//   node scripts/generate-attributes.mjs --force

export const TOOL_ATTRIBUTES = {
  c1: {
    bestFor: [
      "Designers who need a generous daily free tier",
      "Stylized output from community-trained models",
      "Built-in canvas for iterating on compositions",
    ],
    notFor: [
      "Commercial work requiring IP-safe output guarantees",
      "Photorealism at Midjourney levels",
    ],
  },
  c10: {
    bestFor: [
      "The most natural-sounding AI voices and clones",
      "Audiobook, podcast, and accessibility workflows",
      "Multilingual output across 29 languages",
    ],
    notFor: [
      "Heavy voiceover at scale on the free plan (10K credits)",
      "Privacy-critical work — they monitor for misuse",
    ],
  },
  c15: {
    bestFor: [
      "Creators who want Ray-2 photorealistic motion",
      "Daily free credits for regular experimentation",
      "Cinematic camera control and prompt adherence",
    ],
    notFor: [
      "Stylized or animated looks — leans realistic",
      "Heavy daily production — rate limits apply",
    ],
  },
  c16: {
    bestFor: [
      "Real-time AI painting with FLUX and SDXL",
      "Unified image, video, and upscale workflows",
      "Designers who think visually and iterate fast",
    ],
    notFor: [
      "Users who want a classic 'prompt-and-wait' image generator",
      "Offline / fully private workflows",
    ],
  },
  c17: {
    bestFor: [
      "Marketers and educators producing talking-head video at scale",
      "Avatar consistency across many scripts",
      "Multilingual voiceover with lip-sync",
    ],
    notFor: [
      "High-volume free use (1 credit/month)",
      "Projects that need fully original on-camera footage",
    ],
  },
  c18: {
    bestFor: [
      "Creators who need high-volume music output",
      "Strong vocal quality competitive with Suno",
      "1,200 songs/month on free tier — class-leading",
    ],
    notFor: [
      "Commercial use on free tier",
      "Instrument-level MIDI control",
    ],
  },
  c7: {
    bestFor: [
      "Filmmakers and VFX artists needing production-quality video",
      "Precise camera / motion control (motion brush)",
      "Industry-standard workflows",
    ],
    notFor: [
      "Free tier only — 125 one-time credits don't go far",
      "Casual experimentation at zero cost",
    ],
  },
  c8: {
    bestFor: [
      "Quickly generating complete songs with realistic vocals",
      "Creators who need background music + lyrics in one shot",
      "Genre and language variety",
    ],
    notFor: [
      "Commercial use on the free tier (Suno owns the output)",
      "Users who want fine-grained instrument-level control",
    ],
  },
  d1: {
    bestFor: [
      "Developers already deep in the GitHub/VS Code ecosystem",
      "Students or OSS maintainers (they get Pro free)",
      "Teams that want the safest, most battle-tested option",
    ],
    notFor: [
      "Privacy-sensitive work — free tier code may train models",
      "Teams that need agent-mode, multi-file autonomy out of the box",
    ],
  },
  d10: {
    bestFor: [
      "Latency-sensitive apps that need 300+ tok/sec",
      "Open-weight models (Llama, Mixtral) at no cost",
      "Quick prototyping without a credit card",
    ],
    notFor: [
      "Frontier closed models (Claude, GPT-4) — not available",
      "High-volume production without a paid tier",
    ],
  },
  d12: {
    bestFor: [
      "Builders who want to swap models without code changes",
      "30+ free models behind one OpenAI-compatible endpoint",
      "Fallback chains and model A/B testing",
    ],
    notFor: [
      "Lowest-latency serving — adds a routing hop",
      "Teams that need guaranteed uptime SLAs",
    ],
  },
  d18: {
    bestFor: [
      "Cheapest GPT-4-class performance available",
      "Math and code reasoning on R1",
      "Self-hosting via open weights if privacy matters",
    ],
    notFor: [
      "Sensitive data on the hosted API (Chinese jurisdiction)",
      "Workloads that need strong guardrails / safety filtering",
    ],
  },
  d24: {
    bestFor: [
      "Running LLMs 100% offline on your own machine",
      "Developers who want zero API costs and full privacy",
      "Experimenting with 100+ open models behind one CLI",
    ],
    notFor: [
      "Laptops under ~8GB RAM — large models won't fit",
      "Teams that need frontier-model quality (Claude, GPT-4)",
    ],
  },
  d3: {
    bestFor: [
      "Solo developers who want the most polished AI-native editor",
      "Codebase-aware chat and agent mode in a single UI",
      "Teams already paying for frontier model quality",
    ],
    notFor: [
      "Free-tier-only workflows — premium requests cap fast",
      "Privacy-critical code without upgrading to a paid tier",
    ],
  },
  d41: {
    bestFor: [
      "Developers who want an agentic Cursor alternative",
      "Cascade agent that plans + executes multi-file edits",
      "Strong free tier with frontier models included",
    ],
    notFor: [
      "Enterprises without zero-retention requirements",
      "Teams already paying for Cursor Pro (overlap)",
    ],
  },
  d42: {
    bestFor: [
      "Free, open-source VS Code agent with full autonomy",
      "BYOK users who want to plug in any LLM provider",
      "Teams that want MCP server integration",
    ],
    notFor: [
      "Developers who want an all-in-one IDE experience",
      "Users without any LLM API credits",
    ],
  },
  d43: {
    bestFor: [
      "Frontend developers who need fast UI generation",
      "Designers shipping React + Tailwind quickly",
      "Prototyping components from screenshots",
    ],
    notFor: [
      "Full-stack app generation — it's UI-only",
      "Teams that don't use Tailwind + shadcn",
    ],
  },
  d44: {
    bestFor: [
      "Large codebases where 1M-token context matters",
      "Developers who want the fastest inline completions",
      "Low-friction upgrade from Copilot",
    ],
    notFor: [
      "Chat-first workflows — Pro tier required for that",
      "Agent-mode autonomy",
    ],
  },
  d45: {
    bestFor: [
      "Terminal-heavy developers who want AI alongside their shell",
      "Teams on macOS/Linux/Windows who share commands",
      "Natural-language-to-shell conversion",
    ],
    notFor: [
      "Users who want a traditional minimal terminal",
      "Heavy-duty AI needs — 150 requests/month caps early",
    ],
  },
  d8: {
    bestFor: [
      "Power users who live in the terminal",
      "Agentic workflows with sub-agents and MCP tools",
      "Existing Claude subscribers — it's included",
    ],
    notFor: [
      "Developers who want a GUI-first experience",
      "Teams without an Anthropic subscription",
    ],
  },
  d9: {
    bestFor: [
      "Prototypers who need a generous free LLM API",
      "Anyone who wants 1M-token context on the free tier",
      "Builders outside the EU/UK who don't mind training opt-out",
    ],
    notFor: [
      "EU/UK teams with strict data residency needs",
      "Production traffic at scale — free tier rate limits hit fast",
    ],
  },
  e1: {
    bestFor: [
      "General-purpose AI across the widest range of tasks",
      "Anyone who needs image gen + browsing in one place",
      "The largest plugin / GPTs ecosystem",
    ],
    notFor: [
      "Privacy-sensitive chat (opt out of training is manual)",
      "Highest-fidelity coding answers — Claude wins here",
    ],
  },
  e11: {
    bestFor: [
      "Students and researchers grounding AI on their own sources",
      "Audio Overview podcast generation from uploads",
      "Private notebooks where sources aren't used for training",
    ],
    notFor: [
      "General-purpose chat — it's source-grounded only",
      "Users who need more than 50 sources per notebook",
    ],
  },
  e2: {
    bestFor: [
      "Writing, analysis, and nuanced reasoning",
      "Coding tasks where careful, correct answers matter",
      "Projects mode for context-rich, reusable chats",
    ],
    notFor: [
      "Realtime web browsing out of the box",
      "Image generation — not a native feature",
    ],
  },
  e21: {
    bestFor: [
      "European teams with GDPR + data residency needs",
      "Fastest response times in the mainstream chatbot category",
      "Users who want a credible ChatGPT alternative",
    ],
    notFor: [
      "Users who rely on the GPT / Claude plugin ecosystems",
      "Image generation quality on par with DALL-E / Midjourney",
    ],
  },
  e22: {
    bestFor: [
      "Meeting-heavy professionals on Mac who want polished notes",
      "Teams who dislike bots joining calls",
      "Sales/CS workflows with CRM handoff",
    ],
    notFor: [
      "Windows or Linux users (Mac-only today)",
      "Non-recording environments or highly regulated meetings",
    ],
  },
  e23: {
    bestFor: [
      "Users who want anonymous AI chat without an account",
      "Quick, ephemeral questions where privacy matters",
      "Route between GPT-4o mini, Claude Haiku, Llama, Mistral",
    ],
    notFor: [
      "Persistent context — no chat history is saved",
      "Advanced features like file upload or image gen",
    ],
  },
  e3: {
    bestFor: [
      "Deep Google ecosystem users (Gmail, Drive, YouTube)",
      "Long-context tasks — 1M+ tokens on Pro",
      "Thinking mode for math and multi-step reasoning",
    ],
    notFor: [
      "Users wary of Google's data policies",
      "Coding tasks — Claude and ChatGPT usually outperform",
    ],
  },
  e4: {
    bestFor: [
      "Research questions that need cited, live web sources",
      "Deep Research for multi-step investigations",
      "Replacing Google for knowledge queries",
    ],
    notFor: [
      "Pure creative writing — not a general-purpose chatbot",
      "Offline or private workflows",
    ],
  },
  o1: {
    bestFor: [
      "Default choice for anyone self-hosting an LLM",
      "Sizes from 8B (laptop) to 405B (GPT-4-rival)",
      "128K context + permissive commercial license",
    ],
    notFor: [
      "Frontier reasoning — Claude / GPT-4 still lead",
      "Out-of-the-box multimodal features",
    ],
  },
};

export function getAttributes(toolId) {
  return TOOL_ATTRIBUTES[toolId] || null;
}
