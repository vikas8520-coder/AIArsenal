/**
 * Goal recipes + canvas advisor knowledge base.
 *
 * Each goal maps to a recommended stack (input → process → output)
 * built from real tool IDs in tools.js. The advisor uses:
 *   - GOAL_RECIPES  → what to build for a goal
 *   - COMPLEMENTS   → tool id / category → what pairs well with it
 *   - LAYERS        → how to classify a node's role in a pipeline
 */

export const LAYERS = {
  input: {
    label: "Input",
    hint: "Where data comes from",
    categories: ["Search", "Scraping", "Web Data & Scraping", "Reference Servers"],
    tools: ["m7", "m24", "m25", "m26", "e10", "e4"],
  },
  process: {
    label: "Process",
    hint: "Where the thinking happens",
    categories: ["Chatbots", "Coding Assistants", "Coding Agents", "APIs & Inference", "ML Frameworks", "Coding & Dev", "LLM Runners"],
    tools: ["e1", "e2", "e3", "e4", "d1", "d3", "d8", "d9", "o11", "d24", "g8", "g11", "g12", "g13"],
  },
  output: {
    label: "Output",
    hint: "Where results land",
    categories: ["Productivity", "Docs", "Marketing", "Image Generation", "Voice & TTS"],
    tools: ["m18", "e12", "m21", "c4", "c10", "c20"],
  },
  storage: {
    label: "Storage",
    hint: "Where data is saved",
    categories: ["Cloud Platforms", "Databases"],
    tools: ["m13", "m19", "m20", "g21", "g17"],
  },
  automation: {
    label: "Automation",
    hint: "What runs it on a schedule",
    categories: ["Workflow Automation", "Integration Gateways"],
    tools: ["a7", "a9", "m28", "g22"],
  },
  memory: {
    label: "Memory",
    hint: "Context that persists",
    tools: ["m3"],
  },
};

/** Role of a tool on the canvas, by id then category/subcategory. */
export function roleOf(tool) {
  if (!tool) return null;
  for (const [role, def] of Object.entries(LAYERS)) {
    if (def.tools && def.tools.includes(tool.toolId)) return role;
    const sub = (tool.subcategory || "").toLowerCase();
    const cat = (tool.category || "").toLowerCase();
    if (
      def.categories &&
      def.categories.some((c) => sub.includes(c.toLowerCase()) || cat.includes(c.toLowerCase()))
    )
      return role;
  }
  return null;
}

/**
 * Goal recipes. `stack` = tool ids in recommended order.
 * `why` = one-line reasoning per tool id (shown in the advisor).
 */
export const GOALS = [
  {
    id: "research",
    emoji: "🔍",
    title: "Research anything",
    tagline: "Search → summarize → save. Never lose a finding again.",
    stack: ["m7", "e3", "m18", "m3"],
    why: {
      m7: "Live web search from your agent",
      e3: "Free tier summarizes the results",
      m18: "Summaries land in Notion, searchable forever",
      m3: "Memory MCP keeps context across sessions",
    },
    notes: "Add Firecrawl MCP for deeper page extraction.",
    extraTools: ["m24", "m26"],
  },
  {
    id: "content",
    emoji: "✍️",
    title: "Create content faster",
    tagline: "Draft → polish → publish. One pipeline, endless output.",
    stack: ["e1", "e5", "m18"],
    why: {
      e1: "ChatGPT drafts the first version",
      e5: "Grammarly polishes tone and grammar",
      m18: "Finished pieces organized in Notion",
    },
    notes: "Add n8n to schedule posting on a calendar.",
    extraTools: ["a7", "m21"],
  },
  {
    id: "code",
    emoji: "⌨️",
    title: "Ship code with AI",
    tagline: "Pair-program with the best assistants, catch bugs early.",
    stack: ["d3", "d1", "g24", "m9", "m8"],
    why: {
      d3: "Cursor — AI-first editor with the best completions",
      d1: "Free Copilot fills in boilerplate",
      g24: "Sentry catches the errors before users do",
      m9: "GitHub MCP reads your repos",
      m8: "Playwright MCP adds E2E tests",
    },
    notes: "Connect GitHub MCP to let the flow read your repos.",
    extraTools: ["m12", "d8"],
  },
  {
    id: "images",
    emoji: "🎨",
    title: "Generate AI images",
    tagline: "From prompt to polished visual, no design skills needed.",
    stack: ["g10", "c4", "c20", "e3"],
    why: {
      g10: "ComfyUI — node-based control over every step",
      c4: "Stable Diffusion — the open workhorse",
      c20: "Midjourney for the highest quality output",
      e3: "Gemini writes better prompts",
    },
    notes: "Pair with a chatbot to write better prompts.",
    extraTools: ["m18", "c10"],
  },
  {
    id: "voice",
    emoji: "🎙️",
    title: "Transcribe & voice",
    tagline: "Audio in, text out — or the other way around.",
    stack: ["o7", "c10", "m18", "d24"],
    why: {
      o7: "Whisper transcribes anything locally",
      c10: "ElevenLabs turns text into natural speech",
      m18: "Transcripts and drafts filed in Notion",
      d24: "Ollama runs Whisper locally",
    },
    notes: "Runs 100% local if you use the Ollama route.",
    extraTools: ["m3", "c4"],
  },
  {
    id: "data",
    emoji: "📊",
    title: "Scrape & process data",
    tagline: "Pull the web apart, extract what matters, store it.",
    stack: ["m24", "m26", "m13", "g13", "o11"],
    why: {
      m24: "Firecrawl turns any page into clean markdown",
      m26: "Tavily finds the right sources to scrape",
      m13: "Supabase stores everything in Postgres",
      g13: "vLLM runs extraction models on your GPU",
      o11: "LangChain chains it all together",
    },
    notes: "vLLM can run extraction models on your own GPU.",
    extraTools: ["m25", "g21"],
  },
  {
    id: "agents",
    emoji: "🤖",
    title: "Build AI agents",
    tagline: "Give an agent tools, memory, and a schedule.",
    stack: ["a7", "o11", "m3", "m21", "m28"],
    why: {
      a7: "n8n — 400+ integrations to act on",
      o11: "LangChain — the agent framework",
      m3: "Memory MCP gives it persistent context",
      m21: "Slack MCP reports to your team",
      m28: "Zapier MCP reaches 7,000+ apps",
    },
    notes: "Slack MCP lets the agent report into your team chat.",
    extraTools: ["a9", "m9"],
  },
  {
    id: "local",
    emoji: "🏠",
    title: "Run AI privately",
    tagline: "100% local, 100% private, zero API bills.",
    stack: ["d24", "g13", "g17", "o7", "o11"],
    why: {
      d24: "Ollama — one command to run any open model",
      g13: "vLLM serves it fast when you scale up",
      g17: "PocketBase — backend that lives in one file",
      o7: "Whisper runs locally",
      o11: "LangChain chains local models",
    },
    notes: "Everything stays on your machine.",
    extraTools: ["g10", "g21"],
  },
  {
    id: "app",
    emoji: "🏗️",
    title: "Build an AI app",
    tagline: "The full stack: data, model, deployment.",
    stack: ["m13", "d9", "m17", "m9", "m24"],
    why: {
      m13: "Supabase — Postgres, auth, storage in one",
      d9: "Gemini API — free tier to start shipping",
      m17: "Vercel MCP — deploy & manage",
      m9: "GitHub MCP — push code straight from the flow",
      m24: "Firecrawl if your app ingests web content",
    },
    notes: "Add Firecrawl if your app ingests web content.",
    extraTools: ["a7", "m21"],
  },
];

export const getGoal = (id) => GOALS.find((g) => g.id === id) || null;

/**
 * Compatibility suggestions: given a tool on the canvas, what
 * complements it? Keyed by tool id (fallback: category match).
 */
export const COMPLEMENTS = {
  // Search tools → summarize + store
  m7: [{ id: "e3", why: "Summarize search results with a free chat model" }, { id: "m18", why: "Save findings to Notion before you forget" }],
  m26: [{ id: "e4", why: "Perplexity combines search + answer in one step" }, { id: "m13", why: "Store extracted data in Postgres" }],
  m24: [{ id: "o11", why: "Feed scraped pages into a LangChain RAG pipeline" }, { id: "m13", why: "Persist scraped data in Supabase" }],
  e10: [{ id: "e3", why: "Pair Brave results with a summarizer" }, { id: "m18", why: "Archive research into Notion" }],
  // Chatbots → memory + storage + automation
  e3: [{ id: "m3", why: "Memory MCP gives Gemini persistent context" }, { id: "m18", why: "Send outputs to Notion automatically" }],
  e1: [{ id: "m3", why: "Give ChatGPT a persistent memory layer" }, { id: "a7", why: "Automate posting ChatGPT output via n8n" }],
  e2: [{ id: "m18", why: "File Claude's answers into Notion" }, { id: "d9", why: "Drop to the Gemini API for programmatic calls" }],
  e4: [{ id: "m18", why: "Save Perplexity deep-dives into Notion" }, { id: "m3", why: "Keep research context across sessions" }],
  // Coding → repo + monitoring
  d3: [{ id: "m9", why: "Let Cursor's flow read and commit to GitHub" }, { id: "g24", why: "Sentry watches production for you" }],
  d1: [{ id: "m9", why: "Connect GitHub so Copilot works in context" }, { id: "d8", why: "Claude Code handles the big refactors" }],
  d8: [{ id: "m9", why: "Claude Code pushes PRs to GitHub directly" }, { id: "m8", why: "Playwright MCP adds end-to-end tests" }],
  // Image gen → prompt + output
  g10: [{ id: "e3", why: "Use Gemini to generate better ComfyUI prompts" }, { id: "m18", why: "Store final images & workflows in Notion" }],
  c4: [{ id: "d20", why: "Hugging Face hosts the best SD fine-tunes" }, { id: "c10", why: "Add voiceover to your visuals with ElevenLabs" }],
  c20: [{ id: "e3", why: "Write sharper Midjourney prompts with AI" }, { id: "m18", why: "Archive your favorite generations" }],
  // LLM runners → framework + storage
  d24: [{ id: "o11", why: "LangChain turns local Ollama into real apps" }, { id: "g17", why: "PocketBase gives local models a backend" }],
  g13: [{ id: "o11", why: "Serve models via LangChain for structured apps" }, { id: "m13", why: "Scale out with Supabase storage" }],
  g8: [{ id: "o11", why: "Build apps on your local models with LangChain" }, { id: "g17", why: "Add a one-file backend for local data" }],
  // Automation → connect everything
  a7: [{ id: "m28", why: "Zapier MCP extends n8n to 7,000+ more apps" }, { id: "m21", why: "Send workflow results to Slack" }],
  a9: [{ id: "m18", why: "Log every automation run to Notion" }, { id: "e3", why: "Let AI draft the next automation step" }],
  // Storage → AI layer
  m13: [{ id: "d9", why: "Query your Supabase data with the Gemini API" }, { id: "o11", why: "Build RAG on your Postgres with LangChain" }],
  m18: [{ id: "e3", why: "Ask questions across your Notion notes" }, { id: "m3", why: "Keep note context in memory" }],
  m21: [{ id: "e1", why: "Summarize Slack threads with ChatGPT" }, { id: "a7", why: "Turn Slack messages into n8n actions" }],
  g24: [{ id: "d3", why: "Cursor sees Sentry errors while you code" }, { id: "m21", why: "Push error alerts into Slack" }],
};

/** Fallback category-based complements. */
export const CATEGORY_COMPLEMENTS = {
  "End-User Tools": [{ id: "m18", why: "Every end-user flow benefits from Notion storage" }],
  "MCP Servers": [{ id: "e3", why: "Add a chat model to make sense of server outputs" }],
  "Developer Tools": [{ id: "g24", why: "Add Sentry to know when it breaks" }],
  "Creative AI": [{ id: "m18", why: "Archive creative output in Notion" }],
  "Automation & Agents": [{ id: "m21", why: "Route automation results into Slack" }],
  "Open-Source Models": [{ id: "o11", why: "Wrap open models in a LangChain app" }],
  "Git Repos": [{ id: "e3", why: "Pair with a chat model for guided use" }],
};

export function complementsFor(tool) {
  if (!tool) return [];
  if (COMPLEMENTS[tool.toolId]) return COMPLEMENTS[tool.toolId];
  if (CATEGORY_COMPLEMENTS[tool.category]) return CATEGORY_COMPLEMENTS[tool.category];
  return [];
}

/**
 * Analyze a canvas and return human-readable suggestions.
 * Rules: layer gaps, redundancy, opportunities.
 */
export function analyzeCanvas(nodes, goalId) {
  const suggestions = [];
  const tools = nodes
    .map((n) => n.data)
    .filter((d) => d && d.label);

  if (tools.length === 0) {
    return [{ type: "info", text: "Your canvas is empty — pick a goal below to get a starter stack." }];
  }

  // ── Layer gaps ──
  const roles = new Set(tools.map((t) => roleOf(t)).filter(Boolean));
  const has = (r) => roles.has(r);
  if (!has("input") && !has("process")) {
    suggestions.push({ type: "warn", text: "No input or brain yet — add a search tool (Brave MCP) or a chat model (Gemini)." });
  }
  if (has("process") && !has("output")) {
    suggestions.push({ type: "warn", text: "You have a brain but no output — add Notion MCP or Slack MCP to land the results." });
  }
  if (has("input") && !has("process")) {
    suggestions.push({ type: "warn", text: "You're collecting data but nothing processes it — add a chat model like Gemini." });
  }
  if ((has("input") || has("process")) && !has("output") && !has("storage")) {
    suggestions.push({ type: "info", text: "Consider a storage layer (Supabase MCP) so your data survives the session." });
  }

  // ── Redundancy ──
  const bySub = {};
  tools.forEach((t) => {
    const key = t.subcategory || t.category || "other";
    (bySub[key] = bySub[key] || []).push(t);
  });
  Object.entries(bySub).forEach(([sub, list]) => {
    if (list.length > 1) {
      suggestions.push({
        type: "warn",
        text: `${list.length} tools in "${sub}" — ${list.map((t) => t.label).join(" and ")} overlap. Keep the one that fits your goal best.`,
      });
    }
  });

  // ── Goal fit ──
  if (goalId) {
    const goal = getGoal(goalId);
    if (goal) {
      const goalIds = new Set(goal.stack);
      const onCanvas = tools.filter((t) => t.toolId && goalIds.has(t.toolId));
      if (onCanvas.length < goal.stack.length) {
        const missing = goal.stack.filter((id) => !tools.some((t) => t.toolId === id));
        suggestions.push({
          type: "info",
          text: `For "${goal.title}" you're missing ${missing.length} of ${goal.stack.length} recommended tools. ${goal.notes}`,
        });
      }
      const extras = goal.extraTools || [];
      const missingExtras = extras.filter((id) => !tools.some((t) => t.toolId === id));
      if (missingExtras.length > 0 && onCanvas.length >= 2) {
        suggestions.push({
          type: "tip",
          text: `Level up "${goal.title}": add ${missingExtras
            .map((id) => goal.why[id]?.split("—")[0].trim() || id)
            .join(" or ")}.`,
        });
      }
    }
  }

  // ── Complement opportunities ──
  const suggested = new Set();
  for (const t of tools.slice(0, 6)) {
    for (const comp of complementsFor(t)) {
      if (suggested.has(comp.id)) continue;
      const already = tools.some((x) => x.toolId === comp.id);
      if (already) continue;
      suggested.add(comp.id);
      suggestions.push({
        type: "tip",
        text: `${t.label} → ${comp.why}.`,
        toolId: comp.id,
      });
    }
    if (suggested.size >= 3) break;
  }

  if (suggestions.length === 0) {
    suggestions.push({ type: "ok", text: "Looks like a solid stack. Try adding an automation layer (n8n) to run it on autopilot." });
  }

  return suggestions.slice(0, 6);
}

/** Build React Flow nodes/edges for a goal's recommended stack. */
export function goalToFlow(goal) {
  const nodes = goal.stack.map((toolId, i) => ({
    id: `g-${toolId}-${i}`,
    type: "tool",
    position: { x: i * 280 + 80, y: 100 },
    data: {
      label: toolNameById[toolId] || toolId,
      toolId,
      category: toolCategoryById[toolId] || "End-User Tools",
      subcategory: "",
      description: toolWhyById[toolId]?.[0] || "",
      pricing: "Free",
    },
  }));
  const edges = nodes.slice(1).map((n, i) => ({
    id: `ge-${i}`,
    source: nodes[i].id,
    target: n.id,
    label: "data",
  }));
  return { nodes, edges };
}

// ── id → metadata lookup (populated by the canvas at runtime) ──
export const toolNameById = {};
export const toolCategoryById = {};
export const toolWhyById = {};

/** Register directory tool info so goalToFlow can build real nodes. */
export function registerToolInfo(tool) {
  toolNameById[tool.id] = tool.name;
  toolCategoryById[tool.id] = tool.category;
  toolWhyById[tool.id] = [tool.desc || ""];
}
