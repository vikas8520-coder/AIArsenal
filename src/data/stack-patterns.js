// Canonical "shapes" of a complete stack for a given goal.
// Used by the /build gap detector to suggest what's missing.
// Each pattern has required roles with category/subcategory filters + ranked tool hints.

export const STACK_PATTERNS = [
  {
    slug: "ai-saas",
    label: "AI SaaS",
    description: "Ship a paid AI product",
    // Match signal: any tool from these categories is a strong hint this is an AI SaaS build
    matchSignal: ["Developer Tools", "Infrastructure", "Cost Optimization"],
    requiredRoles: [
      {
        key: "coding-assistant",
        label: "Coding assistant",
        matches: { subcategory: "Coding Assistants" },
        suggest: ["d3", "d41", "d1", "d42"],
      },
      {
        key: "llm-api",
        label: "LLM API",
        matches: { subcategory: "APIs & Inference" },
        suggest: ["d9", "d10", "d12", "d18"],
      },
      {
        key: "app-framework",
        label: "App framework",
        matches: { subcategory: "App Frameworks" },
        suggest: ["d21", "d22", "d28"],
      },
      {
        key: "observability",
        label: "LLM observability",
        matches: { subcategory: "Observability" },
        suggest: ["x7", "x8", "x9"],
      },
    ],
  },
  {
    slug: "content-stack",
    label: "Content creator stack",
    description: "Ship writing, images, video, or audio at scale",
    matchSignal: ["Creative AI", "End-User Tools"],
    requiredRoles: [
      {
        key: "chatbot",
        label: "Writing / ideation chatbot",
        matches: { subcategory: "Chatbots" },
        suggest: ["e2", "e1", "e3"],
      },
      {
        key: "image",
        label: "Image generator",
        matches: { subcategory: "Image Generation" },
        suggest: ["c1", "c3", "c16"],
      },
      {
        key: "voice",
        label: "Voice / TTS",
        matches: { subcategory: "Voice & TTS" },
        suggest: ["c10", "c11"],
      },
      {
        key: "video",
        label: "Video (optional)",
        matches: { subcategory: "Video Generation" },
        suggest: ["c15", "c6", "c7"],
        optional: true,
      },
    ],
  },
  {
    slug: "agent-automation",
    label: "Agent automation stack",
    description: "Autonomous agents doing repetitive work",
    matchSignal: ["Automation & Agents"],
    requiredRoles: [
      {
        key: "agent-framework",
        label: "Agent framework",
        matches: { subcategory: "Agent Frameworks" },
        suggest: ["a2", "a1", "a3", "d26"],
      },
      {
        key: "automation",
        label: "Workflow automation",
        matches: { subcategory: "Workflow Automation" },
        suggest: ["a7", "a8", "a9"],
      },
      {
        key: "llm-api",
        label: "LLM backend",
        matches: { subcategory: "APIs & Inference" },
        suggest: ["d12", "d9", "d10"],
      },
      {
        key: "memory",
        label: "Agent memory",
        matches: { subcategory: "App Frameworks", tagHints: ["memory"] },
        suggest: ["d27"],
      },
    ],
  },
  {
    slug: "rag-bot",
    label: "RAG / knowledge bot",
    description: "AI chatting over your own documents",
    matchSignal: ["Developer Tools", "Infrastructure"],
    requiredRoles: [
      {
        key: "agent-framework",
        label: "Agent framework",
        matches: { subcategory: "Agent Frameworks" },
        suggest: ["d26", "a2"],
      },
      {
        key: "vector-db",
        label: "Vector database",
        matches: { subcategory: "Vector Databases" },
        suggest: ["i6", "i7", "i9"],
      },
      {
        key: "llm-api",
        label: "LLM API",
        matches: { subcategory: "APIs & Inference" },
        suggest: ["d9", "d18"],
      },
      {
        key: "observability",
        label: "Tracing",
        matches: { subcategory: "Observability" },
        suggest: ["x8", "x7"],
      },
    ],
  },
  {
    slug: "local-private",
    label: "Local & private stack",
    description: "AI that never hits the cloud",
    matchSignal: ["Open-Source Models", "Personal AI Systems"],
    requiredRoles: [
      {
        key: "local-runtime",
        label: "Local LLM runtime",
        matches: { tagHints: ["local"] },
        suggest: ["d24"],
      },
      {
        key: "open-llm",
        label: "Open-weight LLM",
        matches: { category: "Open-Source Models" },
        suggest: ["o1", "o2", "o3"],
      },
      {
        key: "coding-agent",
        label: "Local coding agent",
        matches: { subcategory: "Coding Assistants", ossOnly: true },
        suggest: ["d2", "d42"],
      },
    ],
  },
];

/**
 * Given a user's current stack (array of toolIds) + the TOOLS catalog,
 * identify the best-matching pattern and return missing roles.
 */
export function detectStackGaps(toolIds, tools) {
  if (!toolIds || toolIds.length === 0) return null;
  const currentTools = toolIds
    .map((id) => tools.find((t) => t.id === id))
    .filter(Boolean);

  // Score each pattern by signal match
  const scored = STACK_PATTERNS.map((p) => {
    let sig = 0;
    for (const t of currentTools) {
      if (p.matchSignal.includes(t.category)) sig++;
    }
    return { pattern: p, signal: sig };
  }).sort((a, b) => b.signal - a.signal);

  const best = scored[0];
  if (!best || best.signal === 0) return null;

  // For the winning pattern, check which required roles are filled
  const filled = new Set();
  const missing = [];

  for (const role of best.pattern.requiredRoles) {
    let hasMatch = false;
    for (const t of currentTools) {
      if (matchesRole(t, role)) {
        hasMatch = true;
        filled.add(role.key);
        break;
      }
    }
    if (!hasMatch && !role.optional) {
      // Suggestions filtered to tools not already in the stack
      const suggestedIds = (role.suggest || []).filter(
        (id) => !toolIds.includes(id)
      );
      missing.push({
        key: role.key,
        label: role.label,
        suggestIds: suggestedIds.slice(0, 3),
      });
    }
  }

  // If everything's filled, return null (no gaps)
  if (missing.length === 0) return null;

  return {
    pattern: best.pattern,
    signal: best.signal,
    filledCount: filled.size,
    totalCount: best.pattern.requiredRoles.filter((r) => !r.optional).length,
    missing,
  };
}

function matchesRole(tool, role) {
  const m = role.matches || {};
  if (m.category && tool.category !== m.category) return false;
  if (m.subcategory && tool.subcategory !== m.subcategory) return false;
  if (m.ossOnly && !tool.oss) return false;
  if (m.tagHints) {
    const tags = (tool.tags || []).map((t) => t.toLowerCase());
    const hit = m.tagHints.some((h) => tags.includes(h.toLowerCase()));
    if (!hit) return false;
  }
  return true;
}
