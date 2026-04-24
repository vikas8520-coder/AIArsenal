// Ten result personas for the Stack Quiz.
// Each archetype has:
//   slug:             URL-safe id (also filename of portrait in /public/archetypes)
//   name:             Display name
//   tagline:          Short punchy tag shown below the name
//   identity:         1-2 sentence identity statement ("You…")
//   emoji:            Fallback if portrait image fails
//   accent:           Theme color for this archetype
//   portraitPrompt:   What to send to Pollinations for the portrait
//   sceneKeywords:    Extra context for the live-gen background
//   scoring:          How answers map to this archetype (higher = stronger match)
//
// Scoring: each answer key maps to a score contribution.
// The archetype with the highest total score wins.

export const ANSWER_KEYS = {
  building: [
    "ship-product",
    "create-content",
    "automate-work",
    "replace-paid",
    "learn-research",
    "earn-income",
  ],
  role: ["solo-dev", "creator", "biz-ops", "researcher", "non-technical"],
  budget: ["free-only", "under-50", "50-500", "enterprise"],
  technical: ["no-code", "copy-paste", "full-stack", "ml-engineer"],
  privacy: ["cloud-ok", "no-train", "self-host"],
};

export const ARCHETYPES = [
  {
    slug: "solo-shipper",
    name: "The Solo Shipper",
    tagline: "Ship fast. Ship free. Iterate.",
    identity:
      "You have an idea and a weekend. Your stack is optimized for velocity — tools that let a single person do the work of five, at the cost of zero.",
    emoji: "🚀",
    accent: "#00f0ff",
    portraitPrompt:
      "cyberpunk solo developer at a laptop, neon cyan lighting, minimalist portrait, dark background, synthwave aesthetic, focused intense expression, hooded figure",
    sceneKeywords: "neon city rooftop, laptop glow, solo coder, cyan cyberpunk",
    scoring: {
      building: { "ship-product": 5, "earn-income": 2 },
      role: { "solo-dev": 5, creator: 1 },
      budget: { "free-only": 3, "under-50": 4 },
      technical: { "full-stack": 4, "copy-paste": 2 },
      privacy: { "cloud-ok": 2, "no-train": 1 },
    },
  },
  {
    slug: "content-machine",
    name: "The Content Machine",
    tagline: "Generate, polish, publish — on loop.",
    identity:
      "You turn words, images, audio, and video into an audience. AI is your unfair advantage over creators who still do everything manually.",
    emoji: "🎬",
    accent: "#ff6b9d",
    portraitPrompt:
      "vibrant creative content creator with camera and microphone, surrounded by floating images and video screens, pink and purple lighting, modern studio setting, confident dynamic pose",
    sceneKeywords: "colorful creator studio, floating screens, pink purple palette",
    scoring: {
      building: { "create-content": 6, "earn-income": 2 },
      role: { creator: 5, "non-technical": 1 },
      budget: { "under-50": 3, "free-only": 2, "50-500": 3 },
      technical: { "no-code": 3, "copy-paste": 2 },
      privacy: { "cloud-ok": 3 },
    },
  },
  {
    slug: "privacy-maximalist",
    name: "The Privacy Maximalist",
    tagline: "Your data never leaves your hardware.",
    identity:
      "You want frontier AI without the surveillance. Every tool in your stack runs locally, self-hosted, or with an iron-clad no-train guarantee.",
    emoji: "🛡️",
    accent: "#00ff88",
    portraitPrompt:
      "hooded figure in front of multiple monitors displaying terminal interfaces, green matrix code background, cybersecurity aesthetic, dark moody lighting, shadowed face",
    sceneKeywords: "server rack, terminal green glow, matrix code, dark room",
    scoring: {
      building: { "learn-research": 2, "ship-product": 2, "automate-work": 1 },
      role: {
        "solo-dev": 2,
        researcher: 3,
        "biz-ops": 2,
      },
      budget: { "free-only": 2, "under-50": 1, enterprise: 2 },
      technical: { "full-stack": 3, "ml-engineer": 4 },
      privacy: { "self-host": 10, "no-train": 5 },
    },
  },
  {
    slug: "enterprise-builder",
    name: "The Enterprise Builder",
    tagline: "Compliance, scale, and six-figure budgets.",
    identity:
      "You're shipping AI inside an organization that needs SOC 2, HIPAA, audit trails, and uptime guarantees. Your stack is battle-tested.",
    emoji: "🏛️",
    accent: "#a855f7",
    portraitPrompt:
      "professional enterprise architect in modern glass office, holographic dashboards, blue and purple lighting, corporate futuristic aesthetic, confident posture",
    sceneKeywords:
      "glass corporate skyscraper, holographic dashboards, professional lighting",
    scoring: {
      building: { "ship-product": 3, "automate-work": 2 },
      role: { "biz-ops": 4, "solo-dev": 1 },
      budget: { enterprise: 8, "50-500": 3 },
      technical: { "full-stack": 3, "ml-engineer": 3, "copy-paste": 2 },
      privacy: { "no-train": 3, "self-host": 2 },
    },
  },
  {
    slug: "indie-hacker",
    name: "The Indie Hacker",
    tagline: "Bootstrap. Build. Bank revenue.",
    identity:
      "You'd rather own $1K MRR than work at FAANG. You pick tools that minimize burn and maximize your odds of escape velocity.",
    emoji: "💸",
    accent: "#eab308",
    portraitPrompt:
      "determined indie founder at standing desk in home office, motivational charts and revenue dashboards on screens, warm golden lighting, plants in background, casual hoodie, laptop glow",
    sceneKeywords: "home office, revenue dashboard, golden hour lighting, plants",
    scoring: {
      building: { "earn-income": 5, "ship-product": 4 },
      role: { "solo-dev": 4, creator: 2 },
      budget: { "free-only": 5, "under-50": 3 },
      technical: { "full-stack": 2, "copy-paste": 3, "no-code": 2 },
      privacy: { "cloud-ok": 2 },
    },
  },
  {
    slug: "no-code-hustler",
    name: "The No-Code Hustler",
    tagline: "Zero code. All leverage.",
    identity:
      "You don't write code — you orchestrate it. Your stack is built from visual builders, automations, and no-code AI that get you from idea to shipped in hours.",
    emoji: "⚡",
    accent: "#69f0ae",
    portraitPrompt:
      "casual professional with tablet, surrounded by colorful connected nodes and workflow diagrams, bright welcoming lighting, modern office, relaxed confident pose",
    sceneKeywords: "visual node editor floating, colorful workflow, bright modern",
    scoring: {
      building: { "automate-work": 4, "replace-paid": 4, "earn-income": 2 },
      role: { "non-technical": 5, "biz-ops": 3, creator: 2 },
      budget: { "under-50": 3, "50-500": 2 },
      technical: { "no-code": 10, "copy-paste": 2 },
      privacy: { "cloud-ok": 2 },
    },
  },
  {
    slug: "ml-researcher",
    name: "The ML Researcher",
    tagline: "Open weights, free GPUs, papers nightly.",
    identity:
      "You're training, fine-tuning, and benchmarking. Your stack leans heavily on free compute, open-source models, and the rawest tools that let you control every layer.",
    emoji: "🧪",
    accent: "#4fc3f7",
    portraitPrompt:
      "AI researcher in laboratory with GPU servers, neural network visualizations on monitors, blue technical lighting, academic casual clothing, focused contemplative expression",
    sceneKeywords:
      "GPU cluster, neural network visualization, deep blue technical lab",
    scoring: {
      building: { "learn-research": 6, "ship-product": 1 },
      role: { researcher: 5, "solo-dev": 2 },
      budget: { "free-only": 4, "under-50": 2 },
      technical: { "ml-engineer": 8, "full-stack": 3 },
      privacy: { "self-host": 3, "cloud-ok": 1 },
    },
  },
  {
    slug: "ops-automator",
    name: "The Ops Automator",
    tagline: "Replace repetitive work with agents.",
    identity:
      "You look at your team's workflows and see bottlenecks AI can kill. Your stack turns weekly reports, email triage, and data wrangling into silent background jobs.",
    emoji: "🔧",
    accent: "#ff8a65",
    portraitPrompt:
      "professional operations manager with clipboard, surrounded by flowing automation pipelines and gears, warm amber lighting, modern office, pragmatic confident expression",
    sceneKeywords:
      "flowing pipelines, gears, warm office, workflow diagrams",
    scoring: {
      building: { "automate-work": 6, "replace-paid": 2 },
      role: { "biz-ops": 6, creator: 1 },
      budget: { "50-500": 3, "under-50": 3, enterprise: 2 },
      technical: { "copy-paste": 3, "no-code": 3, "full-stack": 2 },
      privacy: { "cloud-ok": 2, "no-train": 2 },
    },
  },
  {
    slug: "free-tier-king",
    name: "The Free Tier King",
    tagline: "Zero budget. Unlimited ambition.",
    identity:
      "You've mapped every free tier across every provider. Your stack stitches together bonuses, trials, and 'free forever' plans into production-grade infrastructure at $0.",
    emoji: "👑",
    accent: "#76ff03",
    portraitPrompt:
      "clever figure wearing crown made of circuit boards, holding stack of credit cards labeled FREE, triumphant pose, green and gold lighting, cyberpunk throne",
    sceneKeywords: "cyberpunk throne, circuit crown, green gold glow",
    scoring: {
      building: { "earn-income": 2, "ship-product": 2, "replace-paid": 3 },
      role: { "solo-dev": 2, creator: 1, "biz-ops": 1 },
      budget: { "free-only": 10 },
      technical: { "copy-paste": 2, "full-stack": 2, "no-code": 2 },
      privacy: { "cloud-ok": 3 },
    },
  },
  {
    slug: "curious-beginner",
    name: "The Curious Beginner",
    tagline: "Learning fast. Tool-agnostic.",
    identity:
      "You're new to AI and want to understand it before committing. Your stack is the friendly, well-documented tools that teach you as you use them.",
    emoji: "🌱",
    accent: "#b388ff",
    portraitPrompt:
      "curious person looking at floating holographic AI tools, sense of wonder, soft purple pastel lighting, warm welcoming atmosphere, hopeful expression",
    sceneKeywords:
      "floating holographic interface, pastel purple, dawn light, wonder",
    scoring: {
      building: { "learn-research": 5, "replace-paid": 2 },
      role: { "non-technical": 4, researcher: 2 },
      budget: { "free-only": 3, "under-50": 2 },
      technical: { "no-code": 4, "copy-paste": 3 },
      privacy: { "cloud-ok": 3 },
    },
  },
];

// Score + rank archetypes against a set of answers.
export function scoreArchetypes(answers) {
  const scored = ARCHETYPES.map((a) => {
    let score = 0;
    for (const [dim, answer] of Object.entries(answers || {})) {
      if (!answer) continue;
      const dimScores = a.scoring[dim] || {};
      score += dimScores[answer] || 0;
    }
    return { archetype: a, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export function getArchetypeBySlug(slug) {
  return ARCHETYPES.find((a) => a.slug === slug) || null;
}

// Human-readable labels for answer keys (for UI + AI prompts).
export const ANSWER_LABELS = {
  building: {
    "ship-product": "Ship an AI product",
    "create-content": "Create content (writing, video, audio)",
    "automate-work": "Automate repetitive work",
    "replace-paid": "Replace paid subscriptions with free alternatives",
    "learn-research": "Learn or do research",
    "earn-income": "Earn income with AI",
  },
  role: {
    "solo-dev": "Solo developer / founder",
    creator: "Creator / marketer",
    "biz-ops": "Business / ops professional",
    researcher: "Researcher / student",
    "non-technical": "Non-technical / just curious",
  },
  budget: {
    "free-only": "$0 always — free tiers only",
    "under-50": "Under $50/mo if it saves me time",
    "50-500": "$50–500/mo for a great tool",
    enterprise: "Enterprise — whatever works",
  },
  technical: {
    "no-code": "I don't code",
    "copy-paste": "I can copy-paste code",
    "full-stack": "I'm a full-stack developer",
    "ml-engineer": "I'm an ML / infra engineer",
  },
  privacy: {
    "cloud-ok": "Cloud is fine",
    "no-train": "Don't train on my data",
    "self-host": "Must be self-hostable / local",
  },
};
