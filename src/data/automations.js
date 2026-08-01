/**
 * Automation templates for the Stack Canvas.
 * Each template is a complete React Flow layout (nodes + edges)
 * that users can load into the canvas and tweak.
 *
 * Phase 2: 12 templates with full metadata for SEO pages.
 */
export const AUTOMATION_TEMPLATES = [
  // ═══════════════════════════════════════════════════════
  // BEGINNER (4)
  // ═══════════════════════════════════════════════════════

  {
    id: "research-assistant",
    slug: "research-assistant",
    name: "AI Research Assistant",
    description:
      "Search the web with Brave Search, summarize with a chat model, and store the result in a notes tool. A clean 3-node pipeline that shows how data flows between tools.",
    category: "Research",
    difficulty: "beginner",
    estimatedCost: "Free",
    timeToSetup: "5 min",
    useCase: "Automate topic research — search → summarize → save",
    tags: ["research", "search", "summarize", "notion"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "Brave Search MCP",
          category: "MCP Servers",
          subcategory: "Search",
          description: "Live web search",
          pricing: "Free",
          toolId: "m7",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: 0 },
        data: {
          label: "Gemini",
          category: "End-User Tools",
          subcategory: "Chatbots",
          description: "Summarize search results",
          pricing: "Free",
          toolId: null,
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Notion MCP",
          category: "MCP Servers",
          subcategory: "Docs",
          description: "Store the summary",
          pricing: "Free",
          toolId: "m18",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "results" },
      { id: "e2", source: "n2", target: "n3", label: "summary" },
    ],
  },

  {
    id: "content-factory",
    slug: "content-factory",
    name: "Blog Post Factory",
    description:
      "Draft with a chat model, polish with Grammarly, and publish to your CMS. A linear 3-node pipeline for content teams.",
    category: "Marketing",
    difficulty: "beginner",
    estimatedCost: "Free",
    timeToSetup: "5 min",
    useCase: "Automate blog post creation — draft → edit → publish",
    tags: ["content", "writing", "blog", "cms"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "ChatGPT",
          category: "End-User Tools",
          subcategory: "Chatbots",
          description: "Draft the blog post",
          pricing: "Free",
          toolId: "e1",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: 0 },
        data: {
          label: "Grammarly",
          category: "End-User Tools",
          subcategory: "Writing",
          description: "Polish tone & grammar",
          pricing: "Free",
          toolId: "e5",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Notion MCP",
          category: "MCP Servers",
          subcategory: "Docs",
          description: "Publish to CMS via Notion",
          pricing: "Free",
          toolId: "m18",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "draft" },
      { id: "e2", source: "n2", target: "n3", label: "edited" },
    ],
  },

  {
    id: "code-review-pipeline",
    slug: "code-review-pipeline",
    name: "Code Review Pipeline",
    description:
      "Review code with a coding assistant, check for issues with an error monitor, and report findings to a chat channel. Ideal for team workflows.",
    category: "DevOps",
    difficulty: "beginner",
    estimatedCost: "Free",
    timeToSetup: "10 min",
    useCase: "Automate PR reviews — code access → AI review → error check",
    tags: ["code", "review", "monitoring", "github"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "GitHub MCP",
          category: "MCP Servers",
          subcategory: "Repos",
          description: "PR + code access",
          pricing: "Free",
          toolId: "m9",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: 0 },
        data: {
          label: "Cursor",
          category: "Developer Tools",
          subcategory: "Coding Assistants",
          description: "AI code review",
          pricing: "Paid",
          toolId: "d3",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Sentry",
          category: "Git Repos",
          subcategory: "Monitoring",
          description: "Error tracking",
          pricing: "Free",
          toolId: "g24",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "diff" },
      { id: "e2", source: "n2", target: "n3", label: "issues" },
    ],
  },

  {
    id: "meeting-notes",
    slug: "meeting-notes",
    name: "Meeting Notes to Action Items",
    description:
      "Record a meeting, transcribe with tl;dv, summarize with AI, and push action items to Notion and Slack.",
    category: "Productivity",
    difficulty: "beginner",
    estimatedCost: "Free",
    timeToSetup: "10 min",
    useCase: "Automate meeting follow-up — record → transcribe → summarize → post",
    tags: ["meeting", "transcribe", "notion", "slack"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "tl;dv",
          category: "End-User Tools",
          subcategory: "Productivity",
          description: "Record & transcribe",
          pricing: "Free",
          toolId: "e17",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: 0 },
        data: {
          label: "Gemini",
          category: "End-User Tools",
          subcategory: "Chatbots",
          description: "Summarize + extract actions",
          pricing: "Free",
          toolId: null,
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 640, y: -80 },
        data: {
          label: "Notion MCP",
          category: "MCP Servers",
          subcategory: "Docs",
          description: "Save meeting notes",
          pricing: "Free",
          toolId: "m18",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 640, y: 80 },
        data: {
          label: "Slack MCP",
          category: "MCP Servers",
          subcategory: "Communication",
          description: "Post action items",
          pricing: "Free",
          toolId: "m21",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "transcript" },
      { id: "e2", source: "n2", target: "n3", label: "notes" },
      { id: "e3", source: "n2", target: "n4", label: "actions" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // INTERMEDIATE (4)
  // ═══════════════════════════════════════════════════════

  {
    id: "content-repurposer",
    slug: "content-repurposer",
    name: "Content Repurposer",
    description:
      "Turn one long article into multiple formats: rewrite with a chat model, generate an image, and schedule on social. Shows branching flows.",
    category: "Marketing",
    difficulty: "intermediate",
    estimatedCost: "~$5/mo",
    timeToSetup: "15 min",
    useCase: "Automate content repurposing — article → rewrite → image → schedule",
    tags: ["content", "social", "image", "scheduling"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "Notion MCP",
          category: "MCP Servers",
          subcategory: "Docs",
          description: "Source article",
          pricing: "Free",
          toolId: "m18",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: -80 },
        data: {
          label: "Gemini",
          category: "End-User Tools",
          subcategory: "Chatbots",
          description: "Rewrite for X/Twitter",
          pricing: "Free",
          toolId: null,
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 320, y: 90 },
        data: {
          label: "Flux / ComfyUI",
          category: "Creative AI",
          subcategory: "Image Gen",
          description: "Hero image from text",
          pricing: "Paid",
          toolId: "g10",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Buffer (Social)",
          category: "Business AI",
          subcategory: "Marketing",
          description: "Schedule posts",
          pricing: "Paid",
          toolId: null,
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "article" },
      { id: "e2", source: "n1", target: "n3", label: "topic" },
      { id: "e3", source: "n2", target: "n4", label: "post" },
      { id: "e4", source: "n3", target: "n4", label: "image" },
    ],
  },

  {
    id: "support-bot",
    slug: "support-bot",
    name: "Customer Support Bot",
    description:
      "Route support tickets to AI for draft replies, enrich with context from memory, and post to Slack for review.",
    category: "Business",
    difficulty: "intermediate",
    estimatedCost: "Free",
    timeToSetup: "15 min",
    useCase: "Automate support replies — ticket → AI draft → context → reply",
    tags: ["support", "chatbot", "memory", "slack"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "Gmail (via Composio)",
          category: "MCP Servers",
          subcategory: "Integration Gateways",
          description: "New ticket trigger",
          pricing: "Free",
          toolId: "m27",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: 0 },
        data: {
          label: "ChatGPT",
          category: "End-User Tools",
          subcategory: "Chatbots",
          description: "Draft reply",
          pricing: "Free",
          toolId: "e1",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 480, y: -80 },
        data: {
          label: "Memory MCP",
          category: "MCP Servers",
          subcategory: "Reference Servers",
          description: "Lookup past context",
          pricing: "Free",
          toolId: "m3",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 480, y: 80 },
        data: {
          label: "Slack MCP",
          category: "MCP Servers",
          subcategory: "Communication",
          description: "Post for review",
          pricing: "Free",
          toolId: "m21",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "ticket" },
      { id: "e2", source: "n2", target: "n3", label: "query" },
      { id: "e3", source: "n3", target: "n2", label: "context" },
      { id: "e4", source: "n2", target: "n4", label: "draft" },
    ],
  },

  {
    id: "data-pipeline",
    slug: "data-pipeline",
    name: "Data Pipeline",
    description:
      "Scrape web pages with Firecrawl, extract structured data with vLLM, and store in Supabase Postgres.",
    category: "Data",
    difficulty: "intermediate",
    estimatedCost: "~$10/mo",
    timeToSetup: "20 min",
    useCase: "Automate data collection — scrape → extract → store",
    tags: ["scraping", "extraction", "database", "postgres"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "Firecrawl MCP",
          category: "MCP Servers",
          subcategory: "Web Data & Scraping",
          description: "Scrape target pages",
          pricing: "Free tier",
          toolId: "m24",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: 0 },
        data: {
          label: "vLLM",
          category: "Git Repos",
          subcategory: "AI & ML",
          description: "Extract structured data",
          pricing: "Free (self-host)",
          toolId: "g13",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Supabase MCP",
          category: "MCP Servers",
          subcategory: "Cloud Platforms",
          description: "Store in Postgres",
          pricing: "Free tier",
          toolId: "m13",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "markdown" },
      { id: "e2", source: "n2", target: "n3", label: "json" },
    ],
  },

  {
    id: "social-scheduler",
    slug: "social-scheduler",
    name: "Social Media Scheduler",
    description:
      "Generate posts with a chat model, create images with AI, and schedule across platforms. Shows parallel fan-out.",
    category: "Marketing",
    difficulty: "intermediate",
    estimatedCost: "~$5/mo",
    timeToSetup: "15 min",
    useCase: "Automate social posting — generate → image → schedule → track",
    tags: ["social", "scheduling", "analytics", "ai-content"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "Gemini",
          category: "End-User Tools",
          subcategory: "Chatbots",
          description: "Generate post copy",
          pricing: "Free",
          toolId: null,
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: -100 },
        data: {
          label: "ElevenLabs",
          category: "Creative AI",
          subcategory: "Voice & TTS",
          description: "Audio for video posts",
          pricing: "Paid",
          toolId: "c10",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 320, y: 100 },
        data: {
          label: "Flux / ComfyUI",
          category: "Creative AI",
          subcategory: "Image Gen",
          description: "Hero images",
          pricing: "Paid",
          toolId: "g10",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Buffer / Hootsuite",
          category: "Business AI",
          subcategory: "Marketing",
          description: "Schedule & track",
          pricing: "Paid",
          toolId: null,
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "script" },
      { id: "e2", source: "n1", target: "n3", label: "prompt" },
      { id: "e3", source: "n2", target: "n4", label: "audio" },
      { id: "e4", source: "n3", target: "n4", label: "image" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // ADVANCED (4)
  // ═══════════════════════════════════════════════════════

  {
    id: "fullstack-ai-app",
    slug: "fullstack-ai-app",
    name: "Full-Stack AI App",
    description:
      "The complete stack: Supabase for data/auth, Gemini API for AI, Vercel for deployment. Push code from the flow.",
    category: "Engineering",
    difficulty: "advanced",
    estimatedCost: "Free",
    timeToSetup: "30 min",
    useCase: "Build & deploy AI apps — DB → AI → Deploy",
    tags: ["fullstack", "deployment", "supabase", "vercel"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "Supabase MCP",
          category: "MCP Servers",
          subcategory: "Cloud Platforms",
          description: "Postgres + Auth + Storage",
          pricing: "Free tier",
          toolId: "m13",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: 0 },
        data: {
          label: "Gemini API",
          category: "Developer Tools",
          subcategory: "APIs & Inference",
          description: "Free AI inference",
          pricing: "Free",
          toolId: "d9",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Vercel MCP",
          category: "MCP Servers",
          subcategory: "Cloud Platforms",
          description: "Deploy & manage",
          pricing: "Free tier",
          toolId: "m17",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 640, y: 100 },
        data: {
          label: "GitHub MCP",
          category: "MCP Servers",
          subcategory: "Repos",
          description: "Push code from flow",
          pricing: "Free",
          toolId: "m9",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "data" },
      { id: "e2", source: "n2", target: "n3", label: "build" },
      { id: "e3", source: "n4", target: "n3", label: "deploy" },
    ],
  },

  {
    id: "rag-knowledge-base",
    slug: "rag-knowledge-base",
    name: "RAG Knowledge Base",
    description:
      "Crawl docs with Firecrawl, embed with Hugging Face, and serve locally with Ollama for private RAG.",
    category: "Data",
    difficulty: "advanced",
    estimatedCost: "Free (self-host)",
    timeToSetup: "30 min",
    useCase: "Private RAG — crawl → embed → local inference",
    tags: ["rag", "embeddings", "local", "privacy"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "Firecrawl MCP",
          category: "MCP Servers",
          subcategory: "Web Data & Scraping",
          description: "Crawl documentation",
          pricing: "Free tier",
          toolId: "m24",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: -80 },
        data: {
          label: "Hugging Face Transformers",
          category: "Git Repos",
          subcategory: "AI & ML",
          description: "Generate embeddings",
          pricing: "Free",
          toolId: "g7",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 320, y: 80 },
        data: {
          label: "Ollama",
          category: "Git Repos",
          subcategory: "AI & ML",
          description: "Local LLM inference",
          pricing: "Free",
          toolId: "g8",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Supabase MCP",
          category: "MCP Servers",
          subcategory: "Cloud Platforms",
          description: "Vector store (pgvector)",
          pricing: "Free tier",
          toolId: "m13",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "docs" },
      { id: "e2", source: "n2", target: "n4", label: "vectors" },
      { id: "e3", source: "n1", target: "n3", label: "raw" },
      { id: "e4", source: "n3", target: "n4", label: "query" },
    ],
  },

  {
    id: "multi-agent-research",
    slug: "multi-agent-research",
    name: "Multi-Agent Research",
    description:
      "Parallel search agents with Perplexity, aggregate with Composio, document in Notion. Shows fan-in/fan-out.",
    category: "Research",
    difficulty: "advanced",
    estimatedCost: "~$20/mo",
    timeToSetup: "25 min",
    useCase: "Deep research — parallel search → aggregate → document",
    tags: ["multi-agent", "research", "parallel", "notion"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: -120 },
        data: {
          label: "Perplexity AI",
          category: "End-User Tools",
          subcategory: "Chatbots",
          description: "Deep Research agent",
          pricing: "Free tier",
          toolId: "e4",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 0, y: 40 },
        data: {
          label: "Exa AI",
          category: "End-User Tools",
          subcategory: "Search",
          description: "Semantic web search",
          pricing: "Free tier",
          toolId: "e9",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 0, y: 200 },
        data: {
          label: "Tavily MCP",
          category: "MCP Servers",
          subcategory: "Web Data & Scraping",
          description: "Agent-optimized search",
          pricing: "Free tier",
          toolId: "m26",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 320, y: 40 },
        data: {
          label: "Composio MCP",
          category: "MCP Servers",
          subcategory: "Integration Gateways",
          description: "Aggregate results",
          pricing: "Free tier",
          toolId: "m27",
        },
      },
      {
        id: "n5",
        type: "tool",
        position: { x: 640, y: 40 },
        data: {
          label: "Notion MCP",
          category: "MCP Servers",
          subcategory: "Docs",
          description: "Document findings",
          pricing: "Free",
          toolId: "m18",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n4", label: "research" },
      { id: "e2", source: "n2", target: "n4", label: "sources" },
      { id: "e3", source: "n3", target: "n4", label: "data" },
      { id: "e4", source: "n4", target: "n5", label: "report" },
    ],
  },

  {
    id: "mcp-orchestrator",
    slug: "mcp-orchestrator",
    name: "MCP Orchestrator",
    description:
      "Code push triggers GitHub MCP, Playwright runs E2E tests, Sentry reports errors. Full CI/CD from the canvas.",
    category: "DevOps",
    difficulty: "advanced",
    estimatedCost: "Free",
    timeToSetup: "20 min",
    useCase: "Automated CI/CD — push → test → error report",
    tags: ["ci-cd", "testing", "monitoring", "github"],
    nodes: [
      {
        id: "n1",
        type: "tool",
        position: { x: 0, y: 0 },
        data: {
          label: "GitHub MCP",
          category: "MCP Servers",
          subcategory: "Repos",
          description: "Watch for pushes",
          pricing: "Free",
          toolId: "m9",
        },
      },
      {
        id: "n2",
        type: "tool",
        position: { x: 320, y: -80 },
        data: {
          label: "Playwright MCP",
          category: "MCP Servers",
          subcategory: "Coding & Dev",
          description: "Run E2E tests",
          pricing: "Free",
          toolId: "m8",
        },
      },
      {
        id: "n3",
        type: "tool",
        position: { x: 320, y: 80 },
        data: {
          label: "Supabase MCP",
          category: "MCP Servers",
          subcategory: "Cloud Platforms",
          description: "Run migrations",
          pricing: "Free",
          toolId: "m13",
        },
      },
      {
        id: "n4",
        type: "tool",
        position: { x: 640, y: 0 },
        data: {
          label: "Sentry",
          category: "Git Repos",
          subcategory: "Monitoring",
          description: "Error reporting",
          pricing: "Free tier",
          toolId: "g24",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "code" },
      { id: "e2", source: "n1", target: "n3", label: "migrate" },
      { id: "e3", source: "n2", target: "n4", label: "results" },
      { id: "e4", source: "n3", target: "n4", label: "status" },
    ],
  },
];

export function getTemplateById(id) {
  return AUTOMATION_TEMPLATES.find((t) => t.id === id) || null;
}

/** Build React Flow nodes/edges for a template. */
export function templateToFlow(t) {
  return {
    nodes: (t.nodes || []).map((n) => ({
      ...n,
      position: { x: n.position.x + 60, y: n.position.y + 60 },
    })),
    edges: t.edges || [],
  };
}