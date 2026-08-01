/**
 * Automation templates for the Stack Canvas.
 * Each template is a complete React Flow layout (nodes + edges)
 * that users can load into the canvas and tweak.
 *
 * Phase 1 ships 3 starter templates; the gallery page (Phase 2)
 * will add full metadata (difficulty, cost, use case, SEO pages).
 */
export const AUTOMATION_TEMPLATES = [
  {
    id: "research-assistant",
    slug: "research-assistant",
    name: "AI Research Assistant",
    description:
      "Search the web with Brave Search, summarize with a chat model, and store the result in a notes tool. A clean 3-node pipeline that shows how data flows between tools.",
    category: "Research",
    difficulty: "beginner",
    tags: ["research", "search", "summarize"],
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
    id: "code-review-pipeline",
    slug: "code-review-pipeline",
    name: "Code Review Pipeline",
    description:
      "Review code with a coding assistant, check for issues with an error monitor, and report findings to a chat channel. Ideal for team workflows.",
    category: "DevOps",
    difficulty: "beginner",
    tags: ["code", "review", "monitoring"],
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
    id: "content-factory",
    slug: "content-factory",
    name: "Content Repurposer",
    description:
      "Turn one long article into multiple formats: rewrite with a chat model, generate an image, and schedule on social. Shows branching flows.",
    category: "Marketing",
    difficulty: "intermediate",
    tags: ["content", "social", "image"],
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
