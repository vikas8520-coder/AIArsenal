// Curated "stack recipes" — multi-tool guides for specific goals.
// Each becomes /stacks/[slug]. Add entries freely.
//
// Schema:
//   slug:         URL segment, lowercase-dashes
//   title:        Headline, H1 on page
//   hook:         One sentence tagline
//   useCase:      Who this is for
//   budget:       Monthly cost estimate
//   difficulty:   Beginner | Intermediate | Advanced
//   timeToShip:   Rough shipping time
//   roles:        [{ label, toolId, why, alternatives: [toolIds] }]
//   steps:        Ordered quickstart steps (3-6 items)
//   hiddenCosts:  Watch-outs, rate limits, "free" caveats
//   relatedSlugs: Other stack slugs to cross-link

export const STACKS = [
  {
    slug: "ai-saas-weekend",
    title: "Ship an AI SaaS in a Weekend",
    hook: "Zero to paying users in 48 hours. Every tool on the free tier.",
    useCase: "Solo builder with a weekend and a validated idea",
    budget: "$0/mo (until scale)",
    difficulty: "Intermediate",
    timeToShip: "48 hours",
    roles: [
      {
        label: "AI-native code editor",
        toolId: "d3",
        why: "Cursor's agent mode writes multi-file changes and understands the whole codebase — your biggest speedup over manual coding.",
        alternatives: ["d41", "d42", "d44"],
      },
      {
        label: "LLM API (with generous free tier)",
        toolId: "d9",
        why: "Gemini 2.5 Flash + Pro free tiers are the most generous — you can ship with zero API cost until you hit real traffic.",
        alternatives: ["d10", "d12", "d18"],
      },
      {
        label: "TypeScript AI SDK",
        toolId: "d21",
        why: "Vercel AI SDK gives you streaming, tool use, structured output with one unified API — lets you swap providers later.",
        alternatives: ["d28"],
      },
      {
        label: "No-code landing page",
        toolId: "d43",
        why: "v0 generates production-ready React + Tailwind from prompts — ship a landing page in an hour instead of a day.",
        alternatives: [],
      },
      {
        label: "Fast LLM observability",
        toolId: "x7",
        why: "Helicone's free tier logs 100K requests/month so you can debug failures before users complain.",
        alternatives: ["x8", "x9"],
      },
    ],
    steps: [
      "Install Cursor, open an empty folder, ask the agent to scaffold a Next.js + Vercel AI SDK app",
      "Grab a free Gemini API key from ai.google.dev (no credit card needed)",
      "Prompt v0 for a landing page, copy the generated component into /app/page.tsx",
      "Wire the AI SDK to Gemini Flash, stream responses into a chat component",
      "Deploy to Vercel (free), add Helicone proxy for observability, share the link",
    ],
    hiddenCosts:
      "Gemini free tier caps at 100 req/day on Pro, 250 on Flash — enough for early users but you'll need a paid tier past ~100 DAUs. Vercel free tier includes 100GB bandwidth; a viral launch can blow past it.",
    relatedSlugs: ["replace-chatgpt-plus", "content-creator-free"],
  },

  {
    slug: "replace-chatgpt-plus",
    title: "Replace ChatGPT Plus for $0",
    hook: "Stack the free tiers of 4 frontier chatbots — end up with more capability than ChatGPT Plus gives you for $20/mo.",
    useCase: "Power users who want frontier AI without the subscription",
    budget: "$0/mo",
    difficulty: "Beginner",
    timeToShip: "1 hour to set up bookmarks",
    roles: [
      {
        label: "Primary chatbot (best reasoning)",
        toolId: "e2",
        why: "Claude.ai's free tier gives you Sonnet-class quality with Projects and Artifacts — the best free option for writing and coding.",
        alternatives: ["e1"],
      },
      {
        label: "Real-time web search",
        toolId: "e4",
        why: "Perplexity does cited web search better than GPT browsing — unlimited basic queries + 5 Pro/day + 3 Deep Research/day.",
        alternatives: [],
      },
      {
        label: "Long-context + multimodal",
        toolId: "e3",
        why: "Gemini free tier includes 2.5 Pro with Thinking mode and 1M+ token context — better than Plus for long documents.",
        alternatives: [],
      },
      {
        label: "Anonymous fallback",
        toolId: "e23",
        why: "DuckDuckGo AI Chat routes to GPT-4o mini / Claude Haiku without any account — handy for quick queries you don't want logged.",
        alternatives: [],
      },
      {
        label: "Image generation",
        toolId: "c1",
        why: "Leonardo gives 150 tokens/day free — roughly 20-30 images with style control that Plus's DALL-E doesn't match.",
        alternatives: ["c2", "c3"],
      },
    ],
    steps: [
      "Sign up for Claude (claude.ai), Perplexity, Gemini, and Leonardo — all free, no credit card",
      "Bookmark all four in a browser folder named 'AI' for one-click switching",
      "Route reasoning + coding to Claude, research to Perplexity, long docs to Gemini",
      "Use DuckDuckGo AI for throwaway questions without leaving a trail",
      "For serious image generation, batch requests to Leonardo during your daily token refresh",
    ],
    hiddenCosts:
      "Free tiers have daily caps — Claude ~10 messages/5 hours, Perplexity 5 Pro searches, Gemini 100 Pro req/day. Heavy users will hit them; switch to the next tool in your stack when you do.",
    relatedSlugs: ["ai-saas-weekend", "content-creator-free"],
  },

  {
    slug: "content-creator-free",
    title: "The $0 Content Creator AI Stack",
    hook: "Write, design, record, and edit — every asset an agency would charge for, built with free-tier AI.",
    useCase: "Solo creators, newsletter writers, marketers without a budget",
    budget: "$0/mo",
    difficulty: "Beginner",
    timeToShip: "Half a day to set up the workflow",
    roles: [
      {
        label: "Long-form writing",
        toolId: "e2",
        why: "Claude writes with nuance and voice consistency — the gap between it and GPT shows up immediately in creative work.",
        alternatives: ["e6"],
      },
      {
        label: "Grammar + tone polish",
        toolId: "e5",
        why: "Grammarly's free tier handles the mechanical pass and 100 AI rewrites/month — doesn't train on your text (SOC 2).",
        alternatives: ["e7"],
      },
      {
        label: "Hero images",
        toolId: "c3",
        why: "Adobe Firefly is IP-safe (trained only on licensed content), so you can use output commercially without copyright risk.",
        alternatives: ["c1", "c16"],
      },
      {
        label: "Voice-overs",
        toolId: "c10",
        why: "ElevenLabs gives 10-20K free credits/month — enough for a weekly podcast episode with the best voice quality available.",
        alternatives: ["c11"],
      },
      {
        label: "Background music",
        toolId: "c18",
        why: "Udio's 1,200 free songs/month is class-leading — you'll never run out of royalty-like tracks.",
        alternatives: ["c8", "c9"],
      },
      {
        label: "AI presentations",
        toolId: "e13",
        why: "Gamma turns a topic prompt into a polished deck in seconds — 400 free credits get you ~10 decks.",
        alternatives: [],
      },
    ],
    steps: [
      "Draft in Claude Projects (set your brand voice as project instructions)",
      "Pipe through Grammarly for the mechanical polish + tone adjustment",
      "Generate hero images in Firefly (IP-safe) or Krea for real-time iteration",
      "Record voice-over once in ElevenLabs, layer Udio background music underneath",
      "Repurpose into a deck via Gamma for LinkedIn or webinar use",
    ],
    hiddenCosts:
      "Udio free tier is non-commercial — upgrade to $10/mo if you want to monetize. ElevenLabs free voices are public; clone your own on the paid tier for brand consistency.",
    relatedSlugs: ["ai-saas-weekend", "replace-chatgpt-plus"],
  },

  {
    slug: "local-private-ai",
    title: "100% Private, 100% Local AI Stack",
    hook: "Frontier-ish AI that never leaves your laptop. No cloud, no tracking, no per-token billing.",
    useCase: "Privacy-sensitive work, offline development, cost-zero experimentation",
    budget: "$0/mo (hardware: 16GB+ RAM, ideally 8GB+ VRAM)",
    difficulty: "Intermediate",
    timeToShip: "2 hours to download models and wire up UI",
    roles: [
      {
        label: "Local LLM runtime",
        toolId: "d24",
        why: "Ollama is the simplest way to run 100+ open models with a single CLI — auto-detects your hardware.",
        alternatives: [],
      },
      {
        label: "Coding agent",
        toolId: "d2",
        why: "Continue.dev is the best OSS code assistant and runs against any local Ollama model — zero data leaves your box.",
        alternatives: ["d42"],
      },
      {
        label: "Top open LLM",
        toolId: "o1",
        why: "Llama 3.1 8B runs on a laptop; 70B on a workstation — both good enough for 90% of what GPT-3.5 handled.",
        alternatives: ["o2", "o3", "o5"],
      },
      {
        label: "Local image gen",
        toolId: "c4",
        why: "Stable Diffusion via ComfyUI gives unlimited local generation with community fine-tunes — needs 8GB+ VRAM.",
        alternatives: [],
      },
      {
        label: "Local notes RAG",
        toolId: "e16",
        why: "Smart Connections runs bge-micro-v2 locally against your Obsidian vault — AI-powered discovery with zero cloud.",
        alternatives: ["e15"],
      },
    ],
    steps: [
      "Install Ollama from ollama.com, run `ollama pull llama3.1:8b`",
      "Install Continue.dev in VS Code, point it at your local Ollama endpoint",
      "For images: install ComfyUI + download an SDXL base model from CivitAI",
      "For RAG: open Obsidian, install Smart Connections from Community Plugins, let it index",
      "Verify: unplug your wifi — everything should still work",
    ],
    hiddenCosts:
      "You need real hardware. A $2,000 MacBook Pro M3 runs 8B-70B models comfortably; a $500 laptop will only run 3B-7B. Electricity isn't free either — GPU-heavy generation can add $10-30/mo to your power bill.",
    relatedSlugs: ["ai-saas-weekend"],
  },

  {
    slug: "free-gpu-research",
    title: "Free GPU Compute for AI Research",
    hook: "75+ hours of free GPU time per week across 5 providers. Enough to train and fine-tune real models.",
    useCase: "ML researchers, students, indie AI builders",
    budget: "$0/mo",
    difficulty: "Intermediate",
    timeToShip: "30 min to spread workload across free tiers",
    roles: [
      {
        label: "Notebook-first experimentation",
        toolId: "i1",
        why: "Google Colab free tier gives T4 GPUs with 12-24hr sessions — unbeatable for prototyping.",
        alternatives: ["i2"],
      },
      {
        label: "Pro-quality Kaggle kernels",
        toolId: "i2",
        why: "Kaggle gives 30 free GPU hours/week on P100/T4 — pair with Colab for doubled capacity.",
        alternatives: [],
      },
      {
        label: "Persistent GPU dev boxes",
        toolId: "i3",
        why: "Lightning AI Studios give free always-on GPU instances — better for training runs that hit Colab's session limits.",
        alternatives: ["i4"],
      },
      {
        label: "Demo hosting",
        toolId: "i5",
        why: "Hugging Face ZeroGPU gives free H200 access for Spaces — host a demo that others can actually try.",
        alternatives: ["d20"],
      },
      {
        label: "Fine-tuning toolkit",
        toolId: "o11",
        why: "Unsloth makes QLoRA fine-tuning 2x faster and fits bigger models into free-tier GPUs.",
        alternatives: ["o12"],
      },
    ],
    steps: [
      "Sign up for Google Colab + Kaggle + Lightning AI + Hugging Face — all free",
      "Prototype on Colab, scale training to Kaggle (30hr/week quota)",
      "For long runs, move to Lightning Studios (no session timeout)",
      "Fine-tune with Unsloth to fit bigger models on free hardware",
      "Deploy the final model as a Hugging Face Space with ZeroGPU",
    ],
    hiddenCosts:
      "Free tiers throttle under heavy use — Colab disconnects idle sessions, Kaggle caps weekly hours. Plan training runs to fit the windows. Model storage is cheap but egress on HF Hub can slow down.",
    relatedSlugs: ["local-private-ai"],
  },

  {
    slug: "rag-bot-weekend",
    title: "Build a Production RAG Bot This Weekend",
    hook: "Retrieval-augmented chat over your docs, deployed and shareable, with observability baked in.",
    useCase: "Engineers building internal knowledge bots or customer support AI",
    budget: "$0-20/mo",
    difficulty: "Intermediate",
    timeToShip: "2 days",
    roles: [
      {
        label: "Agent framework",
        toolId: "d26",
        why: "Agno benchmarks 529× faster than LangGraph and has cleaner storage primitives — less boilerplate, more velocity.",
        alternatives: ["a1", "a2"],
      },
      {
        label: "Persistent memory layer",
        toolId: "d27",
        why: "Mem0 gives hierarchical memory (user/session/agent) with 26% better retrieval accuracy than full-context.",
        alternatives: [],
      },
      {
        label: "Vector database",
        toolId: "i6",
        why: "ChromaDB runs embedded for dev + has a free cloud tier for production — simplest path to a working RAG.",
        alternatives: ["i7", "i8", "i9"],
      },
      {
        label: "LLM API",
        toolId: "d9",
        why: "Gemini Flash 2.5 is cheap-to-free and handles RAG answer generation with 1M-token context.",
        alternatives: ["d10"],
      },
      {
        label: "LLM observability",
        toolId: "x8",
        why: "Langfuse's self-hosted OSS + free cloud tier traces every retrieval and generation step — critical for debugging RAG.",
        alternatives: ["x7"],
      },
    ],
    steps: [
      "Install Agno + Mem0 + ChromaDB client (all pip installs)",
      "Chunk your docs (markdown, PDFs) and embed into Chroma with sentence-transformers",
      "Wire an Agno agent with Chroma retrieval tool + Gemini Flash as the LLM",
      "Add Mem0 for conversational memory across sessions",
      "Deploy to Cloud Run/Vercel and pipe all traces through Langfuse",
    ],
    hiddenCosts:
      "Chroma Cloud free tier has row limits — large doc corpuses need the $50/mo tier or self-hosting. Embedding API costs scale with corpus size; use a local sentence-transformers model to keep it free.",
    relatedSlugs: ["ai-saas-weekend", "local-private-ai"],
  },

  {
    slug: "ai-income-earner",
    title: "Earn Your First $1,000 with AI",
    hook: "Five real income streams where free-tier AI tools give you unfair leverage. No courses, no MLM.",
    useCase: "Side-hustlers looking to turn AI skills into income",
    budget: "$0 upfront",
    difficulty: "Beginner",
    timeToShip: "First dollar: ~2 weeks of consistent work",
    roles: [
      {
        label: "RLHF / data labeling",
        toolId: "n1",
        why: "Outlier AI pays $20-65/hr for AI training work — it's the most reliable AI-adjacent income stream.",
        alternatives: ["n2", "n3", "n4"],
      },
      {
        label: "Bug bounty work",
        toolId: "n6",
        why: "Immunefi pays six figures for smart contract bugs — Claude Code is surprisingly good at spotting them.",
        alternatives: ["n5"],
      },
      {
        label: "Prompt marketplace",
        toolId: "n8",
        why: "PromptBase sells prompts that solve specific problems — creators have earned $5K+/mo.",
        alternatives: ["n9"],
      },
      {
        label: "Research grants",
        toolId: "n7",
        why: "AI Grant and similar programs fund indie AI work — applications take hours, not weeks.",
        alternatives: [],
      },
      {
        label: "DePIN passive income",
        toolId: "t5",
        why: "Grass sells your unused bandwidth for AI training — truly passive, $20-50/mo typical.",
        alternatives: ["t1", "t2", "t4"],
      },
    ],
    steps: [
      "Apply to Outlier AI and DataAnnotation — both have vetting delays, so start early",
      "Build 2-3 high-quality prompts and list them on PromptBase",
      "Install Grass in a spare browser tab on every machine you own",
      "If you code: spend one weekend on an Immunefi contest (huge upside if you find something)",
      "Apply to AI Grant if you have a research idea — small time investment, large potential",
    ],
    hiddenCosts:
      "Outlier wait times can be 2-6 weeks. Immunefi contests take weeks of focus with no guarantee. DePIN earnings fluctuate with token price. Treat this as a portfolio, not a single bet.",
    relatedSlugs: ["content-creator-free", "ai-saas-weekend"],
  },

  {
    slug: "agent-automation",
    title: "Automate Your Work with AI Agents",
    hook: "Replace three repetitive jobs with agents that run on their own — email triage, research, and content drafting.",
    useCase: "Knowledge workers drowning in repetitive tasks",
    budget: "$0-24/mo",
    difficulty: "Intermediate",
    timeToShip: "A day per agent",
    roles: [
      {
        label: "Workflow automation",
        toolId: "a7",
        why: "n8n is self-hostable (truly free) + has 400+ integrations — the most flexible agent orchestrator.",
        alternatives: ["a8", "a9"],
      },
      {
        label: "Agent framework",
        toolId: "a2",
        why: "CrewAI gives you multi-agent collaboration with role-based specialization — clean mental model for task delegation.",
        alternatives: ["a1", "a3", "d26"],
      },
      {
        label: "LLM backend",
        toolId: "d12",
        why: "OpenRouter routes across 30+ free models — set up a fallback chain so your agents never hit a dead end.",
        alternatives: ["d9"],
      },
      {
        label: "Research tool",
        toolId: "e9",
        why: "Exa's semantic search API is designed for agents — returns clean structured content, not scraped snippets.",
        alternatives: ["r6", "e10"],
      },
      {
        label: "Memory + state",
        toolId: "d27",
        why: "Mem0 lets agents remember across sessions — critical for recurring tasks like weekly digests.",
        alternatives: [],
      },
    ],
    steps: [
      "Pick ONE repetitive task (email triage, weekly research, content idea gen)",
      "Self-host n8n (Docker one-liner) — it becomes your agent cockpit",
      "Build a CrewAI agent for the task with Exa as its research tool",
      "Route LLM calls through OpenRouter with free models first, paid as fallback",
      "Add Mem0 so the agent remembers context between runs",
    ],
    hiddenCosts:
      "Self-hosting n8n needs a tiny VPS (~$5/mo) if you don't have a spare machine. Agents can loop unexpectedly — set aggressive token budgets in OpenRouter to prevent runaway costs.",
    relatedSlugs: ["rag-bot-weekend", "ai-saas-weekend"],
  },
];

export function getStackBySlug(slug) {
  return STACKS.find((s) => s.slug === slug) || null;
}

export function getAllStackSlugs() {
  return STACKS.map((s) => s.slug);
}
