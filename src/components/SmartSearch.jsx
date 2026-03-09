import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS } from "../data/tools";
import { PAID_TOOLS, BUDGET_BLUEPRINTS, COST_STRATEGIES } from "../data/paid-tools";
import { searchTools } from "../hooks/useSearch";
import { useSemanticSearch, isSemanticQuery } from "../hooks/useSemanticSearch";
import { CATEGORIES, getCategoryById } from "../data/categories";

// ── Use-Case Cards (#6) ─────────────────────────────────────────────────────
const USE_CASES = [
  { label: "Build a chatbot", query: "chatbot framework free tier", icon: "💬" },
  { label: "Add AI to my app", query: "AI SDK API integration free", icon: "🔌" },
  { label: "Generate images", query: "free image generation AI", icon: "🎨" },
  { label: "Code faster", query: "best free coding assistant", icon: "⚡" },
  { label: "Run LLMs locally", query: "local LLM private offline", icon: "🏠" },
  { label: "Free GPU compute", query: "free GPU compute cloud", icon: "🖥" },
  { label: "AI writing tools", query: "free AI writing assistant", icon: "✍" },
  { label: "Voice & TTS", query: "text to speech voice cloning free", icon: "🎙" },
  { label: "Video generation", query: "AI video generation free", icon: "🎬" },
  { label: "Earn with AI", query: "AI income earning opportunities", icon: "💰" },
];

const TYPEWRITER_PHRASES = [
  "Search 215+ tools...",
  "Try: Cursor vs Copilot",
  "Try: free gpu compute...",
  "Ask: What are alternatives to Gemini?",
  "Ask: best free coding assistant?",
  "Try: open source video tools",
];

const STOP_WORDS = new Set([
  "i","my","a","an","the","to","for","and","or","but","in","on","at","of","with",
  "is","are","can","want","need","use","using","make","build","create","something",
  "some","more","how","help","better","when","also","do","does","have","has","like",
  "cant","dont","its","get","got","was","were","they","them","that","this","what",
  "which","who","not","no","so","if","then","than","just","about","up","out","from",
]);

function isDescriptiveQuery(q) {
  const words = q.trim().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));
  return words.length >= 3 || q.length >= 30;
}

// ── Natural Language Filter Detection (#3) ──────────────────────────────────

const CATEGORY_KEYWORDS = {
  "Developer Tools": ["developer","coding","code","api","sdk","framework","dev","programming"],
  "End-User Tools": ["chatbot","writing","search","productivity","user"],
  "Creative AI": ["image","video","music","voice","tts","creative","art","design","3d","audio"],
  "Open-Source Models": ["open source","opensource","oss","open-source","huggingface"],
  "Infrastructure": ["gpu","compute","cloud","server","hosting","vector","database","infra"],
  "Research & Education": ["research","education","course","paper","dataset","learn","benchmark"],
  "Automation & Agents": ["agent","automation","workflow","no-code","nocode","automate"],
  "Business AI": ["business","analytics","crm","customer","enterprise","saas"],
  "Safety & Ethics": ["safety","ethics","bias","guardrail","responsible"],
  "Token Economy": ["credits","token","startup","airdrop","depin","staking"],
  "AI Income": ["income","earn","money","rlhf","bounty","grant"],
  "Cost Optimization": ["cost","cheap","save","budget","optimize","caching"],
  "Personal AI Systems": ["personal","second brain","daemon","private"],
};

function parseNLFilters(query) {
  const q = query.toLowerCase();
  const filters = { oss: false, category: null, detected: [] };

  // OSS detection
  if (/\b(open[- ]?source|oss|foss)\b/i.test(q)) {
    filters.oss = true;
    filters.detected.push("Open Source");
  }

  // Category detection
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (q.includes(kw)) {
        filters.category = catId;
        filters.detected.push(CATEGORIES.find(c => c.id === catId)?.label || catId);
        break;
      }
    }
    if (filters.category) break;
  }

  return filters;
}

// ── Comparison Detection (#4) ────────────────────────────────────────────────

const VS_PATTERN = /^(.+?)\s+(?:vs\.?|versus|or|compared?\s+(?:to|with))\s+(.+?)$/i;

function detectComparison(query) {
  const match = query.trim().match(VS_PATTERN);
  if (!match) return null;

  const nameA = match[1].trim().toLowerCase();
  const nameB = match[2].trim().toLowerCase();

  const findTool = (name) =>
    TOOLS.find(t => t.name.toLowerCase() === name) ||
    TOOLS.find(t => t.name.toLowerCase().includes(name)) ||
    TOOLS.find(t => t.tags?.some(tag => tag.toLowerCase() === name));

  const toolA = findTool(nameA);
  const toolB = findTool(nameB);

  if (toolA && toolB) return { toolA, toolB };
  return null;
}

// ── Prompts ──────────────────────────────────────────────────────────────────

function buildPlannerPrompt(description) {
  const toolList = TOOLS
    .map((t) => `ID:${t.id} | ${t.name} | ${t.category} > ${t.subcategory} | ${t.desc}. Free: ${t.free}`)
    .join("\n");

  const paidContext = PAID_TOOLS
    .map(p => `${p.name} (${p.category}): ${p.pricing.tiers.map(t => t.name + " " + t.price).join(", ")}. Break: ${p.freeBreakpoint}`)
    .join("\n");

  const budgetInfo = Object.entries(BUDGET_BLUEPRINTS)
    .map(([k, v]) => `${v.name} (${v.monthlyBudget}): ${v.stack.join(", ")}`)
    .join("\n");

  return `You are an AI stack planner for AIArsenal (${TOOLS.length}+ tools directory).

AVAILABLE FREE TOOLS:
${toolList}

PAID TOOL PRICING (for budget context):
${paidContext}

BUDGET BLUEPRINTS:
${budgetInfo}

COST STRATEGIES:
${COST_STRATEGIES.map(s => `- ${s.name}: ${s.description} (${s.expectedSavings})`).join("\n")}

USER REQUEST: ${description}

Respond ONLY with valid JSON (no backticks, no markdown):
{
  "summary": "One-line project classification",
  "recommended": [{ "id": "exact tool id from list", "reason": "Why this fits (1 sentence)" }],
  "stack_notes": "2-3 sentences on how these work together",
  "budget_tip": "Cost optimization advice based on the paid tools data",
  "estimated_monthly_cost": "Estimated cost using free tiers"
}

Recommend 5-12 tools. Prioritize free tiers. Include cost optimization tools when relevant. Only use tool IDs from the list.`;
}

function buildSolverPrompt(desc, semanticHints) {
  let preFiltered;
  if (semanticHints && semanticHints.length > 0) {
    const hintIds = new Set(semanticHints.map((h) => h.tool.id));
    const fromSemantic = semanticHints.map((h) => h.tool);
    const fromKeyword = searchTools(TOOLS, desc).filter((t) => !hintIds.has(t.id));
    preFiltered = [...fromSemantic, ...fromKeyword].slice(0, 40);
  } else {
    preFiltered = searchTools(TOOLS, desc).slice(0, 40);
  }

  const toolList = preFiltered
    .map((t) => `ID:${t.id} | ${t.name} | ${t.category} | ${t.desc}. Free: ${t.free}`)
    .join("\n");

  return `You are a tool recommendation engine for AIArsenal (${TOOLS.length}+ AI tools).

TOOLS (pre-filtered, most relevant):
${toolList}

USER QUESTION: ${desc}

Respond ONLY with valid JSON (no backticks, no markdown):
{"answer":"A direct 2-3 sentence answer to the user's question","tools":[{"id":"exact_id","reason":"one sentence why this fits"}]}
Answer the question first, then suggest 4-8 relevant tools. Only use IDs from the list above.`;
}

function instantMatch(query) {
  const keywords = query
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (!keywords.length) return [];
  return searchTools(TOOLS, keywords.join(" "))
    .slice(0, 6)
    .map((tool) => ({ tool, reason: null }));
}

async function callAI(prompt) {
  const res = await fetch("/api/planner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  let text = data.text || "";
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid AI response");
  return JSON.parse(match[0]);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 60 ? "#10b981" : pct >= 40 ? "#eab308" : "var(--text-faint)";
  return (
    <span style={{
      fontSize: 8, fontFamily: "monospace", color,
      border: `1px solid ${color}30`, borderRadius: 3,
      padding: "0 4px", whiteSpace: "nowrap",
    }}>
      {pct}%
    </span>
  );
}

function ToolResultCard({ tool, reason, accent, onClick, score }) {
  const cat = getCategoryById(tool.category);
  const color = cat?.color || accent;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(tool)}
      style={{
        display: "flex", gap: 10, padding: "10px 12px",
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.background = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--surface-1)";
      }}
    >
      <span style={{ color, fontFamily: "monospace", flexShrink: 0, marginTop: 1 }}>◈</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "var(--text-strong)" }}>
            {tool.name}
          </span>
          {score != null && <ScoreBadge score={score} />}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
          {reason || tool.desc}
        </div>
        {tool.free && (
          <div style={{ fontSize: 10, color: "#10b981", marginTop: 3, fontFamily: "monospace" }}>
            {tool.free}
          </div>
        )}
      </div>
      <span style={{
        fontSize: 9, color, border: `1px solid ${color}25`,
        borderRadius: 3, padding: "1px 6px", alignSelf: "center",
        fontFamily: "monospace", flexShrink: 0,
      }}>
        {tool.category.split(" ")[0]}
      </span>
    </motion.div>
  );
}

// ── Comparison Card (#4) ─────────────────────────────────────────────────────

function ComparisonCard({ toolA, toolB, accent }) {
  const rows = [
    { label: "Free Tier", a: toolA.free, b: toolB.free },
    { label: "Category", a: toolA.subcategory || toolA.category, b: toolB.subcategory || toolB.category },
    { label: "Company", a: toolA.company, b: toolB.company },
    { label: "Open Source", a: toolA.oss ? "Yes" : "No", b: toolB.oss ? "Yes" : "No" },
    { label: "Privacy", a: toolA.privacy, b: toolB.privacy },
  ];

  const catA = getCategoryById(toolA.category);
  const catB = getCategoryById(toolB.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 10 }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
      }}>
        <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color: "#a855f7" }}>
          COMPARISON
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* Tool names */}
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 0, marginBottom: 2 }}>
        <div />
        <div style={{
          fontFamily: "monospace", fontWeight: 700, fontSize: 13,
          color: catA?.color || accent, padding: "6px 10px",
          background: `${catA?.color || accent}08`, borderRadius: "8px 0 0 0",
          borderBottom: `2px solid ${catA?.color || accent}30`,
        }}>
          {toolA.name}
        </div>
        <div style={{
          fontFamily: "monospace", fontWeight: 700, fontSize: 13,
          color: catB?.color || accent, padding: "6px 10px",
          background: `${catB?.color || accent}08`, borderRadius: "0 8px 0 0",
          borderBottom: `2px solid ${catB?.color || accent}30`,
        }}>
          {toolB.name}
        </div>
      </div>

      {/* Comparison rows */}
      {rows.map(({ label, a, b }, i) => (
        <div
          key={label}
          style={{
            display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 0,
            background: i % 2 === 0 ? "var(--surface-1)" : "transparent",
            borderRadius: i === rows.length - 1 ? "0 0 8px 8px" : 0,
          }}
        >
          <div style={{
            fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)",
            padding: "6px 8px", letterSpacing: 0.5, alignSelf: "center",
          }}>
            {label}
          </div>
          <div style={{
            fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)",
            padding: "6px 10px", lineHeight: 1.4, borderLeft: "1px solid var(--border)",
          }}>
            {a || "—"}
          </div>
          <div style={{
            fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)",
            padding: "6px 10px", lineHeight: 1.4, borderLeft: "1px solid var(--border)",
          }}>
            {b || "—"}
          </div>
        </div>
      ))}

      {/* Descriptions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <div style={{
          fontSize: 10, color: "var(--text-faint)", lineHeight: 1.5,
          padding: "8px 10px", background: "var(--surface-1)", borderRadius: 8,
        }}>
          {toolA.desc}
        </div>
        <div style={{
          fontSize: 10, color: "var(--text-faint)", lineHeight: 1.5,
          padding: "8px 10px", background: "var(--surface-1)", borderRadius: 8,
        }}>
          {toolB.desc}
        </div>
      </div>
    </motion.div>
  );
}

// ── NL Filter Pills (#3) ────────────────────────────────────────────────────

function FilterPills({ filters, onApply, accent }) {
  if (filters.detected.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      style={{
        display: "flex", gap: 6, alignItems: "center",
        marginBottom: 8, flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)" }}>
        Detected:
      </span>
      {filters.detected.map((label) => (
        <span
          key={label}
          style={{
            fontSize: 9, fontFamily: "monospace",
            background: `${accent}15`, color: accent,
            border: `1px solid ${accent}30`,
            borderRadius: 4, padding: "2px 8px",
          }}
        >
          {label}
        </span>
      ))}
      <button
        onClick={onApply}
        style={{
          fontSize: 9, fontFamily: "monospace", cursor: "pointer",
          background: `${accent}20`, color: accent,
          border: `1px solid ${accent}40`,
          borderRadius: 4, padding: "2px 8px",
          transition: "all 0.15s",
        }}
      >
        Apply filters
      </button>
    </motion.div>
  );
}

// ── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ label, count, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color }}>
        {label}
      </span>
      {count != null && (
        <span style={{
          fontSize: 9, fontFamily: "monospace",
          background: `${color}18`, color,
          border: `1px solid ${color}30`, borderRadius: 3, padding: "0 5px",
        }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SmartSearch({
  value, onChange, accent, onSelectTool, tools, selected, onSelectStack,
  filterOSS, onToggleOSS, onSelectCategory, // New props for NL filters (#3)
}) {
  const [placeholder, setPlaceholder] = useState("");
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Hybrid results for auto-suggest (#1)
  const [instantResults, setInstantResults] = useState([]);
  const [semanticResults, setSemanticResults] = useState([]);
  const [semanticLoading, setSemanticLoading] = useState(false);

  // Semantic search hook
  const { search: semanticSearch, status: semanticStatus } = useSemanticSearch();

  // Comparison detection (#4)
  const comparison = useMemo(() => {
    if (!value.trim()) return null;
    return detectComparison(value);
  }, [value]);

  // NL filter detection (#3)
  const nlFilters = useMemo(() => {
    if (!value.trim()) return { oss: false, category: null, detected: [] };
    return parseNLFilters(value);
  }, [value]);

  // Typewriter
  useEffect(() => {
    if (value) return;
    const tick = () => {
      const phrase = TYPEWRITER_PHRASES[phraseIdx.current];
      if (!deleting.current) {
        if (charIdx.current < phrase.length) {
          charIdx.current++;
          setPlaceholder(phrase.slice(0, charIdx.current));
          return setTimeout(tick, 55);
        }
        deleting.current = true;
        return setTimeout(tick, 1800);
      } else {
        if (charIdx.current > 0) {
          charIdx.current--;
          setPlaceholder(phrase.slice(0, charIdx.current));
          return setTimeout(tick, 30);
        }
        deleting.current = false;
        phraseIdx.current = (phraseIdx.current + 1) % TYPEWRITER_PHRASES.length;
        return setTimeout(tick, 400);
      }
    };
    const t = setTimeout(tick, 800);
    return () => clearTimeout(t);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAiResults(null);
        setMode(null);
        setError(null);
        setInstantResults([]);
        setSemanticResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── #1: Hybrid auto-suggest (instant + semantic in parallel) ──────────────
  useEffect(() => {
    if (!value.trim() || mode === "solve" || mode === "plan") {
      setInstantResults([]);
      setSemanticResults([]);
      return;
    }

    // Instant results — always, immediately
    const instant = instantMatch(value);
    setInstantResults(instant);

    // Semantic results — debounced, in parallel
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isSemanticQuery(value) && semanticStatus === "ready") {
      setSemanticLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const { results } = await semanticSearch(value, { topK: 6, minScore: 0.2 });
          // Dedupe against instant results
          const instantIds = new Set(instant.map(r => r.tool.id));
          const unique = results
            .filter(r => !instantIds.has(r.tool.id))
            .map(({ tool, score }) => ({ tool, score, reason: tool.free || tool.desc }));
          setSemanticResults(unique);
        } catch {
          // Silently fail — instant results still show
        } finally {
          setSemanticLoading(false);
        }
      }, 250);
    } else {
      setSemanticResults([]);
      setSemanticLoading(false);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, semanticStatus, semanticSearch, mode]);

  const isLong = isDescriptiveQuery(value);
  const isSemantic = isSemanticQuery(value);
  const hasAutoResults = instantResults.length > 0 || semanticResults.length > 0;

  // ── Apply NL filters (#3) ────────────────────────────────────────────────
  const applyNLFilters = useCallback(() => {
    if (nlFilters.oss && onToggleOSS && !filterOSS) {
      onToggleOSS();
    }
    if (nlFilters.category && onSelectCategory) {
      onSelectCategory(nlFilters.category);
    }
  }, [nlFilters, onToggleOSS, onSelectCategory, filterOSS]);

  // ── AI modes ──────────────────────────────────────────────────────────────

  const runSolve = async () => {
    if (!value.trim()) return;
    setError(null);
    setMode("solve");
    setLoading(true);
    setAiResults(null);
    setInstantResults([]);
    setSemanticResults([]);
    try {
      const hints = semanticResults.length > 0 ? semanticResults : [];
      const parsed = await callAI(buildSolverPrompt(value, hints));
      const results = (parsed.tools || [])
        .map(({ id, reason }) => ({ tool: TOOLS.find((t) => t.id === id), reason }))
        .filter((r) => r.tool);
      setAiResults({ type: "solve", tools: results, answer: parsed.answer });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runPlan = async () => {
    if (!value.trim()) return;
    setError(null);
    setMode("plan");
    setLoading(true);
    setAiResults(null);
    setInstantResults([]);
    setSemanticResults([]);
    try {
      const parsed = await callAI(buildPlannerPrompt(value));
      setAiResults({ type: "plan", plan: parsed });
      if (parsed.recommended && onSelectStack) {
        parsed.recommended.forEach((r) => onSelectStack(r.id, true));
      }
    } catch (e) {
      setError(e.message.includes("JSON") ? "AI returned invalid JSON. Try again." : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.metaKey || e.ctrlKey) {
        runSolve();
      }
    }
  };

  // ── Use-case card click (#6) ──────────────────────────────────────────────
  const handleUseCaseClick = (query) => {
    onChange(query);
    setMode(null);
    setAiResults(null);
    setError(null);
  };

  const showDropdown =
    focused && (
      !value.trim() || // Empty = show use-case cards
      hasAutoResults || comparison || aiResults || loading || error ||
      (value.trim() && (isLong || isSemantic))
    );

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1 }}>
      {/* Search input */}
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          fontSize: 13, color: accent, opacity: 0.5,
        }}>⌕</span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (mode === "solve" || mode === "plan") {
              setAiResults(null);
              setMode(null);
            }
            setError(null);
          }}
          onFocus={(e) => {
            setFocused(true);
            e.target.style.borderColor = `${accent}40`;
            e.target.style.boxShadow = `0 0 0 3px ${accent}10`;
          }}
          onBlur={(e) => {
            setFocused(false);
            e.target.style.borderColor = "var(--border-bright)";
            e.target.style.boxShadow = "none";
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search tools or ask a question"
          role="searchbox"
          style={{
            width: "100%", padding: "10px 14px 10px 36px",
            background: "var(--surface-1)",
            border: "1px solid var(--border-bright)",
            borderRadius: showDropdown ? "10px 10px 0 0" : 10,
            color: "var(--text-strong)", fontSize: 13,
            fontFamily: "monospace", outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s, border-radius 0.15s",
            boxSizing: "border-box",
          }}
        />
        {/* Status indicators */}
        {semanticStatus === "loading" && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)",
          }}>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
              loading model...
            </motion.span>
          </span>
        )}
        {semanticStatus === "ready" && isSemantic && !showDropdown && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 9, fontFamily: "monospace", color: "#10b981",
          }}>
            semantic
          </span>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "var(--surface-3)",
              border: "1px solid var(--border-bright)",
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              padding: "10px 12px",
              zIndex: 50,
              maxHeight: 520,
              overflowY: "auto",
              backdropFilter: "blur(20px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            }}
            className="no-scrollbar"
          >
            {/* ── #6: Use-case cards (empty state) ───────────────────────── */}
            {!value.trim() && (
              <div>
                <SectionHeader label="EXPLORE BY USE CASE" color="var(--text-faint)" />
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                }}>
                  {USE_CASES.map(({ label, query, icon }) => (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUseCaseClick(query)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 10px", background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        borderRadius: 8, cursor: "pointer",
                        fontFamily: "monospace", fontSize: 11,
                        color: "var(--text-secondary)",
                        transition: "all 0.15s", textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${accent}40`;
                        e.currentTarget.style.color = accent;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ── #3: NL filter pills ──────────────────────────────────── */}
            {value.trim() && nlFilters.detected.length > 0 && !aiResults && (
              <FilterPills filters={nlFilters} onApply={applyNLFilters} accent={accent} />
            )}

            {/* ── #4: Comparison card ──────────────────────────────────── */}
            {value.trim() && comparison && !aiResults && (
              <ComparisonCard toolA={comparison.toolA} toolB={comparison.toolB} accent={accent} />
            )}

            {/* ── Action buttons ───────────────────────────────────────── */}
            {value.trim() && !loading && !error && !aiResults && isLong && (
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                  onClick={runSolve}
                  style={{
                    fontFamily: "monospace", fontSize: 10, padding: "6px 12px",
                    background: `${accent}15`, border: `1px solid ${accent}35`,
                    borderRadius: 6, cursor: "pointer", color: accent,
                    transition: "all 0.15s", flex: 1,
                  }}
                >
                  ⚡ AI Deep Dive
                </button>
                <button
                  onClick={runPlan}
                  style={{
                    fontFamily: "monospace", fontSize: 10, padding: "6px 12px",
                    background: `${accent}15`, border: `1px solid ${accent}35`,
                    borderRadius: 6, cursor: "pointer", color: accent,
                    transition: "all 0.15s", flex: 1,
                  }}
                >
                  ◈ Plan Stack
                </button>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", alignSelf: "center" }}>
                  ⌘↵
                </span>
              </div>
            )}

            {/* ── #1: Hybrid auto-suggest ──────────────────────────────── */}
            {value.trim() && !aiResults && !loading && (
              <>
                {/* Instant results */}
                {instantResults.length > 0 && (
                  <div style={{ marginBottom: semanticResults.length > 0 ? 10 : 0 }}>
                    <SectionHeader label="INSTANT" count={instantResults.length} color="var(--text-faint)" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {instantResults.map(({ tool }) => (
                        <ToolResultCard
                          key={tool.id}
                          tool={tool}
                          accent={accent}
                          onClick={onSelectTool}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Semantic results (fade in) */}
                {semanticLoading && (
                  <div style={{ textAlign: "center", padding: "8px 0", fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)" }}>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>
                      finding similar...
                    </motion.span>
                  </div>
                )}
                {semanticResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SectionHeader label="SEMANTIC" count={semanticResults.length} color="#10b981" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {semanticResults.map(({ tool, reason, score }) => (
                        <ToolResultCard
                          key={tool.id}
                          tool={tool}
                          reason={reason}
                          score={score}
                          accent={accent}
                          onClick={onSelectTool}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* No results at all */}
                {instantResults.length === 0 && semanticResults.length === 0 && !semanticLoading && !comparison && value.trim().length > 2 && (
                  <div style={{ textAlign: "center", padding: "12px 0", fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
                    No matches found. Press ⌘↵ for AI-powered search.
                  </div>
                )}
              </>
            )}

            {/* ── Loading (AI modes) ───────────────────────────────────── */}
            {loading && (
              <div style={{ textAlign: "center", padding: "16px 0", fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  {mode === "plan" ? "Planning stack..." : "Finding tools..."}
                </motion.span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 11, fontFamily: "monospace", color: "#f87171" }}>
                {error}
              </div>
            )}

            {/* ── Solve results (AI) ───────────────────────────────────── */}
            {aiResults && aiResults.type === "solve" && (
              <div>
                {aiResults.answer && (
                  <div style={{
                    padding: "10px 12px", marginBottom: 10,
                    background: `${accent}08`, border: `1px solid ${accent}20`,
                    borderRadius: 8,
                  }}>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--text-strong)", fontFamily: "monospace" }}>
                      {aiResults.answer}
                    </p>
                  </div>
                )}
                <SectionHeader label="AI RECOMMENDATIONS" count={aiResults.tools.length} color={accent} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {aiResults.tools.map(({ tool, reason }) => (
                    <ToolResultCard key={tool.id} tool={tool} reason={reason} accent={accent} onClick={onSelectTool} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Plan results ─────────────────────────────────────────── */}
            {aiResults && aiResults.type === "plan" && aiResults.plan && (
              <div>
                <div style={{
                  padding: 12,
                  background: `${accent}08`, border: `1px solid ${accent}20`,
                  borderRadius: 8, marginBottom: 10,
                }}>
                  <p style={{ fontFamily: "monospace", fontSize: 11, color: accent, margin: "0 0 6px", fontWeight: 700 }}>
                    {aiResults.plan.summary}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 6px", lineHeight: 1.5 }}>
                    {aiResults.plan.stack_notes}
                  </p>
                  {aiResults.plan.budget_tip && (
                    <p style={{ fontSize: 10, color: "#eab308", margin: "0 0 4px", fontFamily: "monospace" }}>
                      {aiResults.plan.budget_tip}
                    </p>
                  )}
                  <p style={{ fontFamily: "monospace", fontSize: 10, color: "#76ff03", margin: 0 }}>
                    {aiResults.plan.estimated_monthly_cost}
                  </p>
                </div>
                {aiResults.plan.recommended && (
                  <>
                    <SectionHeader label="RECOMMENDED STACK" count={aiResults.plan.recommended.length} color={accent} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {aiResults.plan.recommended.map(({ id, reason }) => {
                        const tool = TOOLS.find(t => t.id === id);
                        if (!tool) return null;
                        return <ToolResultCard key={id} tool={tool} reason={reason} accent={accent} onClick={onSelectTool} />;
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
