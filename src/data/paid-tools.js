/**
 * paid-tools.js
 * Knowledge base of paid AI tool pricing, budget blueprints, and cost strategies.
 * Source: "AI Builder's Arsenal: Complete paid and free tool guide for 2025-2026"
 *
 * Referenced by the AI Planner to make budget-aware recommendations.
 */

// ---------------------------------------------------------------------------
// Paid Tools — pricing, breakpoints, and competitive landscape
// ---------------------------------------------------------------------------

export const PAID_TOOLS = [
  // ── LLM APIs ─────────────────────────────────────────────────────────
  {
    name: "OpenAI GPT-4.1",
    category: "LLM API",
    pricing: {
      unit: "per token",
      tiers: [
        { label: "Input", price: "$2 / 1M tokens" },
        { label: "Output", price: "$8 / 1M tokens" },
      ],
    },
    freeBreakpoint:
      "Free playground credits run out quickly with complex prompts; production use requires paid API keys from day one.",
    bestFor: "General-purpose reasoning, code generation, structured output",
    competitors: ["Claude Sonnet 4", "Gemini 2.5 Pro", "DeepSeek R1"],
  },
  {
    name: "OpenAI GPT-4.1 Mini",
    category: "LLM API",
    pricing: {
      unit: "per token",
      tiers: [
        { label: "Input", price: "$0.40 / 1M tokens" },
        { label: "Output", price: "$1.60 / 1M tokens" },
      ],
    },
    freeBreakpoint:
      "When you need a cheaper model for high-volume, less complex tasks that still require GPT-4-class quality.",
    bestFor: "High-volume classification, summarization, simple chat",
    competitors: ["Claude Haiku 3.5", "Gemini 2.5 Flash"],
  },
  {
    name: "Claude Opus 4",
    category: "LLM API",
    pricing: {
      unit: "per token",
      tiers: [
        { label: "Input", price: "$15 / 1M tokens" },
        { label: "Output", price: "$75 / 1M tokens" },
      ],
    },
    freeBreakpoint:
      "Opus is premium-only; use for tasks that justify the cost such as deep research, complex multi-step reasoning, and agentic workflows.",
    bestFor: "Deep analysis, agentic coding, long-context research",
    competitors: ["OpenAI GPT-4.1", "Gemini 2.5 Pro"],
  },
  {
    name: "Claude Sonnet 4",
    category: "LLM API",
    pricing: {
      unit: "per token",
      tiers: [
        { label: "Input", price: "$3 / 1M tokens" },
        { label: "Output", price: "$15 / 1M tokens" },
      ],
    },
    freeBreakpoint:
      "Free tier on claude.ai is rate-limited; API usage at scale requires paid access.",
    bestFor: "Balanced cost/quality coding, writing, and analysis",
    competitors: ["OpenAI GPT-4.1", "Gemini 2.5 Pro"],
  },
  {
    name: "Claude Haiku 3.5",
    category: "LLM API",
    pricing: {
      unit: "per token",
      tiers: [
        { label: "Input", price: "$0.80 / 1M tokens" },
        { label: "Output", price: "$4 / 1M tokens" },
      ],
    },
    freeBreakpoint:
      "When you outgrow free-tier rate limits and need fast, cheap responses at volume.",
    bestFor: "Real-time chat, routing, lightweight extraction",
    competitors: ["OpenAI GPT-4.1 Mini", "Gemini 2.5 Flash"],
  },
  {
    name: "Gemini 2.5 Pro",
    category: "LLM API",
    pricing: {
      unit: "per token",
      tiers: [
        { label: "Input", price: "$1.25–$10 / 1M tokens (varies by thinking budget)" },
        { label: "Output", price: "$2.50–$10 / 1M tokens (varies by thinking budget)" },
      ],
    },
    freeBreakpoint:
      "Google AI Studio free tier has daily quotas; production apps hit limits within hours of moderate traffic.",
    bestFor: "Multimodal tasks, long-context (1M+ tokens), code with thinking",
    competitors: ["Claude Opus 4", "OpenAI GPT-4.1"],
  },
  {
    name: "DeepSeek R1",
    category: "LLM API",
    pricing: {
      unit: "per token",
      tiers: [
        { label: "Input", price: "$0.55 / 1M tokens" },
        { label: "Output", price: "$2.19 / 1M tokens" },
      ],
    },
    freeBreakpoint:
      "Free web access is heavily rate-limited; API is needed for any automation or integration.",
    bestFor: "Cost-effective reasoning, math, code — strong open-weight alternative",
    competitors: ["Claude Haiku 3.5", "OpenAI GPT-4.1 Mini"],
  },

  // ── Dev Tools (paid tiers) ───────────────────────────────────────────
  {
    name: "Cursor Pro",
    category: "Dev Tool",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Pro", price: "$20/mo", includes: "500 premium requests" }],
    },
    freeBreakpoint:
      "Free tier caps premium model requests at ~50/mo; power users burn through that in a day.",
    bestFor: "AI-native IDE with codebase-aware completions and chat",
    competitors: ["GitHub Copilot Pro", "Windsurf Pro"],
  },
  {
    name: "GitHub Copilot Pro",
    category: "Dev Tool",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Pro", price: "$10/mo" }],
    },
    freeBreakpoint:
      "Free tier limited to public repos and basic completions; Pro unlocks all models and agent mode.",
    bestFor: "Inline completions, PR reviews, CLI assistance inside VS Code / JetBrains",
    competitors: ["Cursor Pro", "Windsurf Pro"],
  },
  {
    name: "Windsurf Pro",
    category: "Dev Tool",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Pro", price: "$15/mo" }],
    },
    freeBreakpoint:
      "Free tier has limited Cascade (agentic) flows per day; Pro removes the cap.",
    bestFor: "Agentic coding flows with deep codebase awareness",
    competitors: ["Cursor Pro", "GitHub Copilot Pro"],
  },
  {
    name: "Replit Core",
    category: "Dev Tool",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Core", price: "$25/mo" }],
    },
    freeBreakpoint:
      "Free tier limits compute, storage, and AI generations; Core unlocks always-on deployments and more AI usage.",
    bestFor: "Browser-based full-stack dev with AI agent, instant deploys",
    competitors: ["Bolt.new", "Lovable"],
  },

  // ── Automation ───────────────────────────────────────────────────────
  {
    name: "n8n Cloud",
    category: "Automation",
    pricing: {
      unit: "per request",
      tiers: [{ label: "Starter", price: "$24/mo", includes: "2,500 executions" }],
    },
    freeBreakpoint:
      "Self-hosted is free forever; Cloud plan needed when you want managed hosting and team collaboration.",
    bestFor: "AI-augmented workflow automation with 400+ integrations, self-hostable",
    competitors: ["Make", "Zapier"],
  },
  {
    name: "Make",
    category: "Automation",
    pricing: {
      unit: "per request",
      tiers: [{ label: "Core", price: "$9/mo", includes: "10,000 operations" }],
    },
    freeBreakpoint:
      "Free tier allows 1,000 ops/mo; most non-trivial automations exceed that within the first week.",
    bestFor: "Visual automation builder with branching logic and data transformation",
    competitors: ["n8n Cloud", "Zapier"],
  },
  {
    name: "Zapier",
    category: "Automation",
    pricing: {
      unit: "per request",
      tiers: [{ label: "Professional", price: "$19.99/mo", includes: "750 tasks" }],
    },
    freeBreakpoint:
      "Free tier is 100 tasks/mo with single-step zaps; multi-step and higher volume require paid.",
    bestFor: "Largest app ecosystem (7,000+), easiest setup for non-technical users",
    competitors: ["n8n Cloud", "Make"],
  },

  // ── No-Code AI Builders ──────────────────────────────────────────────
  {
    name: "Bolt.new",
    category: "No-Code AI Builder",
    pricing: {
      unit: "per seat",
      tiers: [
        { label: "Pro", price: "$20/mo" },
        { label: "Teams / Enterprise", price: "up to $200/mo" },
      ],
    },
    freeBreakpoint:
      "Free tier gives limited daily token budget; a single complex app can exhaust it in one session.",
    bestFor: "Prompt-to-full-stack app generation with instant preview",
    competitors: ["Lovable", "Replit"],
  },
  {
    name: "Lovable",
    category: "No-Code AI Builder",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Pro", price: "$20/mo" }],
    },
    freeBreakpoint:
      "Free tier caps message count; Pro needed for serious iteration on production apps.",
    bestFor: "Prompt-to-app with strong UI/UX defaults and Supabase integration",
    competitors: ["Bolt.new", "Replit"],
  },
  {
    name: "Replit (Builder)",
    category: "No-Code AI Builder",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Core", price: "$25/mo" }],
    },
    freeBreakpoint:
      "Free tier limits AI agent usage and compute; Core unlocks full agent and always-on hosting.",
    bestFor: "End-to-end build + deploy in browser with AI agent",
    competitors: ["Bolt.new", "Lovable"],
  },

  // ── Observability ────────────────────────────────────────────────────
  {
    name: "Helicone",
    category: "Observability",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Pro", price: "$120/mo" }],
    },
    freeBreakpoint:
      "Free tier covers up to 100K logged requests/mo; high-traffic apps or teams need Pro for advanced analytics.",
    bestFor: "LLM request logging, cost tracking, caching, rate limiting",
    competitors: ["LangSmith", "Langfuse"],
  },
  {
    name: "LangSmith",
    category: "Observability",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Plus", price: "$39/mo" }],
    },
    freeBreakpoint:
      "Free developer tier has limited trace retention and seats; Plus adds longer retention and team features.",
    bestFor: "LangChain-native tracing, evaluation, and prompt management",
    competitors: ["Helicone", "Langfuse"],
  },

  // ── Customer AI ──────────────────────────────────────────────────────
  {
    name: "Intercom Fin",
    category: "Customer AI",
    pricing: {
      unit: "per request",
      tiers: [{ label: "Per resolution", price: "$0.99/resolution" }],
    },
    freeBreakpoint:
      "No free tier; you pay per AI-resolved conversation from the start.",
    bestFor: "AI-first customer support with deep knowledge base integration",
    competitors: ["Zendesk AI", "Tidio Lyro"],
  },
  {
    name: "Zendesk AI",
    category: "Customer AI",
    pricing: {
      unit: "per request",
      tiers: [{ label: "Per automated resolution", price: "$1/automated resolution" }],
    },
    freeBreakpoint:
      "Zendesk itself requires a paid plan; AI add-on charges per resolution on top.",
    bestFor: "Enterprise support automation layered onto existing Zendesk workflows",
    competitors: ["Intercom Fin", "Tidio Lyro"],
  },
  {
    name: "Tidio Lyro",
    category: "Customer AI",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Lyro AI", price: "$39/mo", includes: "50 conversations" }],
    },
    freeBreakpoint:
      "Free Tidio plan includes only a handful of Lyro conversations; real usage requires the paid add-on.",
    bestFor: "SMB-friendly AI chatbot with easy setup and affordable entry point",
    competitors: ["Intercom Fin", "Zendesk AI"],
  },

  // ── Creative ─────────────────────────────────────────────────────────
  {
    name: "Midjourney",
    category: "Creative",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Basic", price: "$10/mo" }],
    },
    freeBreakpoint:
      "No free tier currently; paid subscription required for any generation.",
    bestFor: "Photorealistic and artistic image generation with strong aesthetic control",
    competitors: ["DALL-E 3", "Stable Diffusion", "Flux"],
  },
  {
    name: "Runway Gen-4",
    category: "Creative",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Standard", price: "$12/mo" }],
    },
    freeBreakpoint:
      "Free trial gives minimal credits; any serious video generation requires a subscription.",
    bestFor: "AI video generation and editing, image-to-video, motion brush",
    competitors: ["Pika", "Kling", "Sora"],
  },
  {
    name: "ElevenLabs",
    category: "Creative",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Starter", price: "$5/mo" }],
    },
    freeBreakpoint:
      "Free tier gives ~10 min of audio/mo; a single podcast episode or voiceover exceeds that.",
    bestFor: "Ultra-realistic text-to-speech, voice cloning, audio AI",
    competitors: ["PlayHT", "Murf", "OpenAI TTS"],
  },
  {
    name: "Udio",
    category: "Creative",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Standard", price: "$10/mo" }],
    },
    freeBreakpoint:
      "Free tier offers a small number of daily generations; musicians and creators need paid for iteration.",
    bestFor: "AI music generation with lyrics, full songs, genre control",
    competitors: ["Suno", "Stable Audio"],
  },

  // ── BI / Analytics ───────────────────────────────────────────────────
  {
    name: "Julius AI",
    category: "BI/Analytics",
    pricing: {
      unit: "per seat",
      tiers: [{ label: "Pro", price: "$20/mo" }],
    },
    freeBreakpoint:
      "Free tier limits number of analyses and data sources; Pro unlocks unlimited and advanced visualizations.",
    bestFor: "Chat-with-your-data analytics, auto-generated charts, Python/R under the hood",
    competitors: ["Vizly", "ChatGPT Advanced Data Analysis"],
  },
  {
    name: "Vizly",
    category: "BI/Analytics",
    pricing: {
      unit: "per request",
      tiers: [{ label: "Usage-based", price: "Usage-based pricing" }],
    },
    freeBreakpoint:
      "Free tier limited to small datasets and basic charts; pay-as-you-go for larger workloads.",
    bestFor: "AI-powered data visualization and notebook-style analysis",
    competitors: ["Julius AI", "ChatGPT Advanced Data Analysis"],
  },
];

// ---------------------------------------------------------------------------
// Budget Blueprints — three spend tiers from the article
// ---------------------------------------------------------------------------

export const BUDGET_BLUEPRINTS = {
  bootstrap: {
    label: "Bootstrap",
    monthlyBudget: "$0/mo",
    description:
      "Maximize every free tier available. Ideal for solo builders validating ideas before spending a dime.",
    stack: {
      llm: "Gemini 2.5 Flash / GPT-4.1 Mini free playground / DeepSeek R1 (free web)",
      coding: "Cursor free tier + GitHub Copilot free tier",
      automation: "n8n self-hosted (free) or Make free (1,000 ops)",
      builder: "Bolt.new / Lovable / Replit free tiers",
      observability: "Langfuse self-hosted (free) or Helicone free tier",
      creative: "Stable Diffusion (local) + free ElevenLabs quota",
      analytics: "Julius AI free tier",
    },
    tradeoffs:
      "Rate limits, smaller context windows, no team features, manual infra management.",
  },

  growth: {
    label: "Growth",
    monthlyBudget: "$50–$150/mo",
    description:
      "Strategic paid upgrades where free tiers bottleneck you. Best for serious indie hackers and small teams.",
    stack: {
      llm: "Claude Sonnet 4 or GPT-4.1 for primary + Haiku/Mini for routing (~$30–60/mo API)",
      coding: "Cursor Pro ($20/mo) or GitHub Copilot Pro ($10/mo)",
      automation: "n8n Cloud ($24/mo) or Make Core ($9/mo)",
      builder: "Bolt.new Pro ($20/mo) or Lovable Pro ($20/mo)",
      observability: "LangSmith Plus ($39/mo) or Helicone free tier",
      creative: "Midjourney Basic ($10/mo) + ElevenLabs Starter ($5/mo)",
      analytics: "Julius AI Pro ($20/mo)",
    },
    tradeoffs:
      "Must be disciplined about which tools get the paid upgrade; model routing is essential to keep API costs down.",
  },

  scale: {
    label: "Scale",
    monthlyBudget: "$500+/mo",
    description:
      "Enterprise-grade stack for teams shipping production AI products with reliability and compliance requirements.",
    stack: {
      llm: "Claude Opus 4 / GPT-4.1 for complex tasks + Sonnet/Mini for volume (model routing mandatory)",
      coding: "Cursor Pro or Windsurf Pro per developer",
      automation: "n8n Cloud or Zapier Professional with high execution limits",
      builder: "Bolt.new Teams ($200/mo) or Replit Teams",
      observability: "Helicone Pro ($120/mo) + LangSmith Plus ($39/mo)",
      customerAI: "Intercom Fin ($0.99/resolution) or Zendesk AI ($1/resolution)",
      creative: "Runway Gen-4 ($12/mo) + Midjourney ($10/mo) + ElevenLabs ($5/mo)",
      analytics: "Julius AI Pro + custom dashboards",
    },
    tradeoffs:
      "Higher spend demands cost monitoring, usage alerts, and regular audits of which tools are actually delivering ROI.",
  },
};

// ---------------------------------------------------------------------------
// Cost Strategies — proven techniques to reduce AI spend
// ---------------------------------------------------------------------------

export const COST_STRATEGIES = [
  {
    name: "Model Routing",
    description:
      "Route 80% of requests to cheap models (Haiku, GPT-4.1 Mini) and only 20% to expensive models (Opus, GPT-4.1). Achieves ~73% cost savings compared to sending everything to the top-tier model.",
    implementation:
      "Classify incoming requests by complexity. Simple lookups, classification, and extraction go to the cheap model. Complex reasoning, creative writing, and multi-step analysis go to the premium model.",
    savingsEstimate: "~73%",
  },
  {
    name: "Semantic Caching",
    description:
      "Cache LLM responses keyed by semantic similarity of the prompt, not exact string match. Real-world hit rates of 61–69% mean the majority of repeat or near-duplicate queries are served from cache at zero token cost.",
    implementation:
      "Use an embedding model to vectorize prompts. Before calling the LLM, search the cache for semantically similar prompts (cosine similarity > 0.95). Return cached response if found.",
    savingsEstimate: "61–69% hit rate (proportional cost reduction)",
  },
  {
    name: "Prompt Optimization",
    description:
      "Shorter, well-structured prompts reduce input token costs without sacrificing output quality. Techniques include removing filler, using structured formats, and providing concise few-shot examples.",
    implementation:
      "Audit your top-10 most-called prompts. Trim unnecessary context, replace verbose instructions with structured templates, and A/B test to confirm quality holds.",
    savingsEstimate: "20–40% input token reduction",
  },
  {
    name: "Batch Processing",
    description:
      "Group non-urgent requests into batches. Many providers offer lower per-token pricing for batch/async API calls (e.g., OpenAI Batch API at 50% discount).",
    implementation:
      "Queue non-real-time tasks (summarization, classification, embedding generation) and submit them via batch endpoints during off-peak hours.",
    savingsEstimate: "Up to 50% on batch-eligible workloads",
  },
  {
    name: "Free Tier Stacking",
    description:
      "Combine free tiers from multiple providers to avoid paying for any single one. Each provider gives enough free usage for a portion of your workload.",
    implementation:
      "Map out free tier limits for each provider (OpenAI free credits, Gemini AI Studio, Claude free tier, Groq free tier). Distribute workloads across providers to stay within each free limit.",
    savingsEstimate: "100% (zero cost) for low-volume or early-stage projects",
  },
];
