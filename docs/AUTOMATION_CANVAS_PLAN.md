# AIArsenal Automation Canvas — Architecture Plan

## Research Summary

### What We Evaluated

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Self-host n8n** | Full workflow engine, 400+ integrations | Can't embed editor in iframe (separate React app), needs 2-4GB RAM VPS ($20-50/mo), heavy for Vercel | ❌ Overkill, can't embed |
| **Activepieces** | MIT license, simpler than n8n | Same iframe problem, still needs separate server | ❌ Same issue |
| **Flowise** | AI-focused workflows | Requires separate backend, LangChain dependency | ❌ Too opinionated |
| **Custom with React Flow** | Full control, embeddable, Next.js native, 35K+ stars, MIT | Need to build execution layer ourselves | ✅ **Best fit** |
| **Workflow Builder SDK** (paid) | Production-ready, schema-driven | $49/mo, vendor lock-in | ⚠️ Consider later |

### Key Decision: Build Custom with React Flow

**React Flow (@xyflow/react)** is the clear winner:
- 35K+ GitHub stars, battle-tested
- Official Next.js App Router examples
- Custom nodes = each AI tool becomes a visual node
- ELK auto-layout, pan/zoom, minimap
- MIT licensed, zero cost
- Vercel has a Workflow Builder template we can reference

**We are NOT building n8n.** We're building something more focused:
a **Stack Canvas** — where users visually connect AI tools from the directory
into workflows, see data flow, and export/share automation recipes.

---

## Product Vision

### What It Is
A visual canvas where users:
1. Drag AI tools from the directory onto a canvas
2. Connect them with edges (data flows)
3. See pre-built automation templates (recipes)
4. Export workflows as n8n JSON, Python scripts, or shareable URLs
5. Get AI suggestions for tool combinations

### What It Is NOT
- NOT a full workflow execution engine (no server-side runs)
- NOT n8n or Zapier clone
- NOT a replacement for the existing tool directory

### The Differentiator
No existing product combines an **AI tool directory** with a **visual automation builder**.
This makes AIArsenal the first place developers go to both **discover** and **compose** AI tools.

---

## Architecture

### New Pages & Routes

```
/automations              → Template gallery (browsable, searchable)
/automations/[slug]       → Individual template detail + "Open in Canvas"
/canvas                   → Main visual canvas (full-screen React Flow)
/canvas/[id]              → Saved user canvas (localStorage or DB)
```

### Why Separate Pages (Not Modals/Drawers)

1. **Canvas needs full viewport** — React Flow is immersive, needs 100vw × 100vh
2. **Templates need browsing UX** — grid of cards, filtering, search
3. **Clean separation of concerns** — discovery vs. composition
4. **Better SEO** — `/automations` gets indexed, templates get their own pages
5. **Mobile handling** — canvas is desktop-first; templates work on mobile

### Navigation Integration

The existing sidebar gets a new section divider:

```
── CATEGORIES ──
  All Tools (315)
  Developer Tools (45)
  ...
  MCP Servers (28)
  Git Repos (28)

── COMPOSE ──
  ⚡ Automations        → /automations
  ◈ Stack Canvas        → /canvas
```

The header also gets an "AUTOMATE" link next to "STACK".

---

## Data Model

### Automation Template

```typescript
interface AutomationTemplate {
  id: string;
  slug: string;
  name: string;                    // "Content Creation Pipeline"
  description: string;
  category: string;                // "Marketing", "DevOps", "Research"
  difficulty: "beginner" | "intermediate" | "advanced";
  tools: string[];                 // tool IDs from TOOLS array
  nodes: CanvasNode[];             // React Flow nodes
  edges: CanvasEdge[];             // React Flow edges
  estimatedCost: string;           // "Free", "< $5/mo", "$10-50/mo"
  timeToSetup: string;             // "5 min", "30 min"
  useCase: string;                 // "Automate blog post creation"
  tags: string[];
}
```

### Canvas Node (extends React Flow Node)

```typescript
interface CanvasNode {
  id: string;
  type: "tool" | "trigger" | "action" | "condition" | "output";
  position: { x: number; y: number };
  data: {
    toolId?: string;               // Reference to TOOLS entry
    label: string;
    description?: string;
    config?: Record<string, any>;  // Tool-specific settings
    icon?: string;                 // Category icon
    color?: string;                // Category color
  };
}
```

### Canvas Edge (extends React Flow Edge)

```typescript
interface CanvasEdge {
  id: string;
  source: string;                  // Source node ID
  target: string;                  // Target node ID
  label?: string;                  // "data", "trigger", "response"
  type?: "default" | "animated" | "conditional";
  data?: {
    dataType?: string;             // "text", "image", "json", "file"
    condition?: string;            // "if status == success"
  };
}
```

### Storage

- **Templates**: Hardcoded in `src/data/automations.js` (like TOOLS)
- **User Canvases**: localStorage initially (no auth needed)
  - Later: Supabase when auth is added
- **Export Format**: JSON (React Flow serialize) + n8n-compatible JSON

---

## Component Architecture

```
src/
  components/
    canvas/
      CanvasEditor.jsx         — Main React Flow wrapper (full-screen)
      CanvasToolbar.jsx        — Top toolbar: save, export, templates, undo
      CanvasSidebar.jsx        — Left panel: tool palette (drag source)
      CanvasProperties.jsx     — Right panel: selected node config
      ToolNode.jsx             — Custom React Flow node for AI tools
      TriggerNode.jsx          — Custom node for triggers (cron, webhook)
      ActionNode.jsx           — Custom node for actions (API calls)
      ConditionNode.jsx        — Custom node for if/else branching
      OutputNode.jsx           — Custom node for outputs (email, file)
      MiniMap.jsx              — Built-in React Flow minimap
      ConnectionLine.jsx       — Custom animated connection line
    automations/
      AutomationGallery.jsx    — Grid of template cards
      AutomationCard.jsx       — Individual template preview
      AutomationDetail.jsx     — Full template view + "Open in Canvas"
      AutomationFilter.jsx     — Category/difficulty/cost filters
      AutomationHero.jsx       — Hero section for /automations
```

---

## Pre-Built Templates (Launch Set — 12 Templates)

### Beginner (4)
1. **AI Research Assistant** — Perplexity → NotebookLM → Obsidian
   - Tools: Perplexity AI, Google NotebookLM, Obsidian
   - Flow: Search → Summarize → Store

2. **Blog Post Factory** — Gemini → Grammarly → WordPress
   - Tools: Google Gemini, Grammarly, (WordPress placeholder)
   - Flow: Draft → Edit → Publish

3. **Code Review Pipeline** — GitHub Copilot → Cursor → Sentry
   - Tools: GitHub Copilot, Cursor, Sentry
   - Flow: PR created → AI review → Error check

4. **Meeting Notes to Action Items** — tl;dv → Notion → Slack
   - Tools: tl;dv, Notion, Slack MCP
   - Flow: Record → Transcribe → Summarize → Post

### Intermediate (4)
5. **AI Content Repurposer** — Gemini → ElevenLabs → Canva
   - Tools: Google Gemini, (TTS), (Design)
   - Flow: Article → Rewrite → Voice → Social graphics

6. **Customer Support Bot** — ChatGPT → Memory MCP → Slack
   - Tools: ChatGPT, Memory MCP, Slack MCP
   - Flow: Ticket → AI draft → Context lookup → Reply

7. **Data Pipeline** — Firecrawl → vLLM → Supabase
   - Tools: Firecrawl MCP, vLLM, Supabase MCP
   - Flow: Scrape → Process/extract → Store

8. **Social Media Scheduler** — Gemini → Buffer → Analytics
   - Tools: Google Gemini, (Social API), (Analytics)
   - Flow: Generate posts → Schedule → Track

### Advanced (4)
9. **Full-Stack AI App** — Supabase → Gemini → Vercel
   - Tools: Supabase MCP, Google Gemini API, Vercel MCP
   - Flow: DB → AI processing → Deploy

10. **RAG Knowledge Base** — Firecrawl → HuggingFace → Ollama
    - Tools: Firecrawl MCP, Hugging Face Transformers, Ollama
    - Flow: Crawl docs → Embed → Local inference

11. **Multi-Agent Research** — Perplexity → Composio → Notion
    - Tools: Perplexity AI, Composio MCP, Notion MCP
    - Flow: Parallel search → Aggregate → Document

12. **MCP Orchestrator** — GitHub → Playwright → Sentry
    - Tools: GitHub MCP, Playwright MCP, Sentry MCP
    - Flow: Code push → E2E test → Error report

---

## Visual Design

### Canvas Editor Layout
```
┌─────────────────────────────────────────────────────────┐
│  ◈ CANVAS    [Templates] [Export] [Share] [Undo] [Redo]│  ← CanvasToolbar
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│  TOOL    │      REACT FLOW CANVAS       │  PROPERTIES   │
│  PALETTE │      (pan, zoom, drag)       │  PANEL        │
│          │                              │               │
│  □ Chat  │   ┌──────┐    ┌──────┐      │  Tool: Gemini │
│  □ Image │   │ Gemini├────┤Sentry│      │  Config: ...  │
│  □ Search│   └──┬───┘    └──────┘      │               │
│  □ Code  │      │                       │               │
│  □ DB    │   ┌──┴───┐                   │               │
│          │   │ Supabase                 │               │
│          │   └──────┘                   │               │
├──────────┴──────────────────────────────┴───────────────┤
│  Zoom: 100%   |   Nodes: 3   |   Auto-save: On         │  ← Status bar
└─────────────────────────────────────────────────────────┘
```

### Template Gallery Layout
```
┌──────────────────────────────────────────────────────┐
│  ⚡ AUTOMATIONS                                       │
│  Pre-built workflows connecting AI tools.            │
│  Pick a template or build your own on the canvas.    │
│                                                      │
│  [All] [Beginner] [Intermediate] [Advanced]          │
│  [Free] [Marketing] [DevOps] [Research]              │
├──────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ 🔍 Research │ │ ✍️ Blog    │ │ 🔄 Content  │       │
│  │ Assistant  │ │ Factory   │ │ Repurpose  │       │
│  │ ★ Beginner │ │ ★ Beginner│ │ ★ Intermed │       │
│  │ Free       │ │ Free      │ │ ~$5/mo     │       │
│  │ 3 tools    │ │ 3 tools   │ │ 4 tools    │       │
│  └────────────┘ └────────────┘ └────────────┘       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ 📊 Data    │ │ 🤖 Multi-  │ │ 🏗️ Full    │       │
│  │ Pipeline   │ │ Agent     │ │ Stack App  │       │
│  │ ★ Intermed │ │ ★ Advanced│ │ ★ Advanced │       │
│  │ ~$10/mo    │ │ ~$20/mo   │ │ Free       │       │
│  │ 3 tools    │ │ 3 tools   │ │ 3 tools    │       │
│  └────────────┘ └────────────┘ └────────────┘       │
└──────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Install React Flow (`@xyflow/react`)
- [ ] Create `/canvas` page with basic React Flow canvas
- [ ] Build `ToolNode` custom node (displays tool name, icon, category color)
- [ ] Build `CanvasSidebar` — draggable tool palette grouped by category
- [ ] Basic pan/zoom/connect — user can drag tools and connect them
- [ ] localStorage save/load

### Phase 2: Templates (Week 2)
- [ ] Create `src/data/automations.js` with 12 templates
- [ ] Build `/automations` gallery page
- [ ] Build template detail view
- [ ] "Open in Canvas" — loads template into canvas
- [ ] Template filtering (category, difficulty, cost)

### Phase 3: Canvas Polish (Week 3)
- [ ] `CanvasProperties` panel — configure selected tool node
- [ ] Additional node types: Trigger, Action, Condition, Output
- [ ] Export as JSON (React Flow) + shareable URL (base64 encoded)
- [ ] Export as n8n workflow JSON (mapping our nodes to n8n format)
- [ ] Undo/redo
- [ ] Auto-layout with ELK.js

### Phase 4: Intelligence (Week 4)
- [ ] "Suggest connections" — AI recommends next tool based on current canvas
- [ ] "Similar automations" — show related templates based on tools in canvas
- [ ] Cost calculator integration — estimated monthly cost for the stack
- [ ] "Open in n8n" — generate n8n-importable JSON

### Phase 5: Social & Persistence (Later)
- [ ] User auth (Supabase)
- [ ] Save canvases to cloud
- [ ] Share canvases via URL
- [ ] Community templates gallery
- [ ] "Fork" someone else's automation

---

## Tech Stack Additions

| Package | Purpose | Cost |
|---------|---------|------|
| `@xyflow/react` | Visual canvas foundation | Free (MIT) |
| `@xyflow/core` | Core utilities | Free (MIT) |
| `elkjs` | Auto-layout algorithm | Free (EPL-2.0) |
| `dagre` | Alternative auto-layout | Free (MIT) |

No new backend needed for Phase 1-4. All client-side.
Phase 5 adds Supabase (already in Vikas's stack).

---

## SEO Strategy

- `/automations` — "AI Tool Automation Templates" (high-intent keyword)
- `/automations/[slug]` — Individual template pages with JSON-LD
- Each template page targets long-tail: "how to automate [use case] with AI"
- Internal linking from tool pages → "See automations using this tool"

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| React Flow too complex for users | Pre-built templates reduce cognitive load; start with "Use Template" not "Build from Scratch" |
| Canvas doesn't work on mobile | Canvas is desktop-first; templates are mobile-friendly; show "Open on Desktop" CTA |
| No execution engine | Focus on composition and export, not execution; link to n8n/Make for actual runs |
| Performance with many nodes | React Flow handles 500+ nodes; use virtualization if needed |
| Vercel serverless limits | Canvas is 100% client-side; no server needed |
