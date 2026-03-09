import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS } from "../data/tools";
import { PAID_TOOLS, BUDGET_BLUEPRINTS, COST_STRATEGIES } from "../data/paid-tools";
import { searchTools } from "../hooks/useSearch";
import { getCategoryById } from "../data/categories";

const TYPEWRITER_PHRASES = [
  "Search 215+ tools...",
  "Try: local llm...",
  "Try: free gpu compute...",
  "Try: I need a cheap GPT-4 alternative...",
  "Try: build a telegram bot...",
  "Try: video generation...",
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

function buildSolverPrompt(desc) {
  const preFiltered = searchTools(TOOLS, desc).slice(0, 40);
  const toolList = preFiltered
    .map((t) => `ID:${t.id} | ${t.name} | ${t.category} | ${t.desc}`)
    .join("\n");

  return `You are a tool recommendation engine for AIArsenal (${TOOLS.length}+ AI tools).

TOOLS (pre-filtered, most relevant):
${toolList}

USER PROBLEM: ${desc}

Respond ONLY with valid JSON (no backticks, no markdown): {"tools":[{"id":"exact_id","reason":"one sentence why this solves the problem"}]}
Suggest 4-8 tools. Only use IDs from the list above.`;
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

function ToolResultCard({ tool, reason, accent, onClick }) {
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
        <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "var(--text-strong)" }}>
          {tool.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
          {reason || tool.desc}
        </div>
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

export default function SmartSearch({ value, onChange, accent, onSelectTool, tools, selected, onSelectStack }) {
  const [placeholder, setPlaceholder] = useState("");
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null); // "instant" | "plan" | "solve"
  const containerRef = useRef(null);

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
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isLong = isDescriptiveQuery(value);

  const runInstant = () => {
    if (!value.trim()) return;
    setError(null);
    setMode("instant");
    const results = instantMatch(value);
    setAiResults({ type: "instant", tools: results });
  };

  const runSolve = async () => {
    if (!value.trim()) return;
    setError(null);
    setMode("solve");
    setLoading(true);
    setAiResults(null);
    try {
      const parsed = await callAI(buildSolverPrompt(value));
      const results = (parsed.tools || [])
        .map(({ id, reason }) => ({ tool: TOOLS.find((t) => t.id === id), reason }))
        .filter((r) => r.tool);
      setAiResults({ type: "solve", tools: results });
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
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      if (isLong) runSolve();
      else runInstant();
    }
  };

  const showDropdown = (isLong && focused && value.trim()) || aiResults || loading || error;

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
            setAiResults(null);
            setMode(null);
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
          aria-label="Search tools or describe your project"
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
              maxHeight: 420,
              overflowY: "auto",
              backdropFilter: "blur(20px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            }}
            className="no-scrollbar"
          >
            {/* AI action buttons — show when query is descriptive */}
            {!loading && !aiResults && !error && isLong && (
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
                  ⚡ Find Tools
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

            {/* Loading */}
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

            {/* Solve / Instant results */}
            {aiResults && (aiResults.type === "solve" || aiResults.type === "instant") && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color: "var(--text-faint)" }}>
                    {aiResults.type === "instant" ? "INSTANT MATCH" : "AI RECOMMENDATIONS"}
                  </span>
                  <span style={{
                    fontSize: 9, fontFamily: "monospace",
                    background: `${accent}12`, color: accent,
                    border: `1px solid ${accent}25`, borderRadius: 3, padding: "0 5px",
                  }}>
                    {aiResults.tools.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {aiResults.tools.map(({ tool, reason }) => (
                    <ToolResultCard
                      key={tool.id}
                      tool={tool}
                      reason={reason}
                      accent={accent}
                      onClick={onSelectTool}
                    />
                  ))}
                </div>
                {aiResults.tools.length === 0 && (
                  <div style={{ textAlign: "center", padding: "12px 0", fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
                    No results found. Try different keywords.
                  </div>
                )}
              </div>
            )}

            {/* Plan results */}
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
                      💡 {aiResults.plan.budget_tip}
                    </p>
                  )}
                  <p style={{ fontFamily: "monospace", fontSize: 10, color: "#76ff03", margin: 0 }}>
                    💰 {aiResults.plan.estimated_monthly_cost}
                  </p>
                </div>

                {aiResults.plan.recommended && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color: "var(--text-faint)" }}>
                        RECOMMENDED STACK
                      </span>
                      <span style={{
                        fontSize: 9, fontFamily: "monospace",
                        background: `${accent}12`, color: accent,
                        border: `1px solid ${accent}25`, borderRadius: 3, padding: "0 5px",
                      }}>
                        {aiResults.plan.recommended.length}
                      </span>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {aiResults.plan.recommended.map(({ id, reason }) => {
                        const tool = TOOLS.find(t => t.id === id);
                        if (!tool) return null;
                        return (
                          <ToolResultCard
                            key={id}
                            tool={tool}
                            reason={reason}
                            accent={accent}
                            onClick={onSelectTool}
                          />
                        );
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
