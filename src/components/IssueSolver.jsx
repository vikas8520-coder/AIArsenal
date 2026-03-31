"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS } from "../data/tools";
import { searchTools } from "../hooks/useSearch";
import { getCategoryById } from "../data/categories";

const STOP_WORDS = new Set([
  "i","my","a","an","the","to","for","and","or","but","in","on","at","of","with",
  "is","are","can","want","need","use","using","make","build","create","something",
  "some","more","how","help","better","when","also","do","does","have","has","like",
  "cant","dont","its","get","got","was","were","they","them","that","this","what",
  "which","who","not","no","so","if","then","than","just","about","up","out","from",
]);

function instantMatch(desc) {
  const keywords = desc
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (!keywords.length) return [];
  return searchTools(TOOLS, keywords.join(" "))
    .slice(0, 6)
    .map((tool) => ({ tool, reason: null }));
}

async function askAI(desc) {
  const preFiltered = searchTools(TOOLS, desc).slice(0, 40);
  const toolList = preFiltered
    .map((t) => `ID:${t.id} | ${t.name} | ${t.category} | ${t.desc}`)
    .join("\n");

  const prompt = `You are a tool recommendation engine for AIArsenal (216+ AI tools).

TOOLS (pre-filtered, most relevant):
${toolList}

USER PROBLEM: ${desc}

Respond ONLY with valid JSON (no backticks, no markdown): {"tools":[{"id":"exact_id","reason":"one sentence why this solves the problem"}]}
Suggest 4-8 tools. Only use IDs from the list above.`;

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
  const parsed = JSON.parse(match[0]);

  return (parsed.tools || [])
    .map(({ id, reason }) => ({ tool: TOOLS.find((t) => t.id === id), reason }))
    .filter((r) => r.tool);
}

function ToolResultCard({ tool, reason, accent, onSelect }) {
  const cat = getCategoryById(tool.category);
  const color = cat?.color || accent;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(tool)}
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


export default function IssueSolver({ accent, onSelectTool }) {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolResults, setToolResults] = useState([]);
  const [webResults, setWebResults] = useState([]);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState(null);

  const runInstant = () => {
    if (!desc.trim()) return;
    setError(null);
    setWebResults([]);
    setActiveMode("instant");
    const results = instantMatch(desc);
    setToolResults(results);
  };

  const runAI = async () => {
    if (!desc.trim()) return;
    setError(null);
    setWebResults([]);
    setActiveMode("ai");
    setLoading(true);
    setToolResults([]);
    try {
      const results = await askAI(desc);
      setToolResults(results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = toolResults.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-bright)",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 20,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ color: accent, fontFamily: "monospace", fontSize: 12 }}>◈</span>
        <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "var(--text-faint)" }}>
          ISSUE SOLVER
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe your problem or goal… e.g. 'I can't afford GPT-4 and need cheaper text processing'"
        rows={2}
        style={{
          width: "100%", background: "var(--surface-2)",
          border: "1px solid var(--border-bright)",
          borderRadius: 8, color: "var(--text-strong)", fontSize: 12,
          fontFamily: "monospace", padding: "10px 12px", outline: "none",
          resize: "vertical", boxSizing: "border-box", lineHeight: 1.5,
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = `${accent}50`; }}
        onBlur={(e) => { e.target.style.borderColor = ""; }}
        onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) runInstant(); }}
      />

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button
          onClick={runInstant}
          disabled={!desc.trim() || loading}
          style={{
            fontFamily: "monospace", fontSize: 10, padding: "7px 14px",
            background: activeMode === "instant" ? `${accent}20` : "var(--surface-2)",
            border: `1px solid ${activeMode === "instant" ? accent + "50" : "var(--border-bright)"}`,
            borderRadius: 7, cursor: desc.trim() ? "pointer" : "not-allowed",
            color: activeMode === "instant" ? accent : "var(--text-secondary)",
            transition: "all 0.15s",
          }}
        >
          ⚡ Instant
        </button>

        <button
          onClick={runAI}
          disabled={!desc.trim() || loading}
          style={{
            fontFamily: "monospace", fontSize: 10, padding: "7px 14px",
            background: activeMode === "ai" ? `${accent}20` : "var(--surface-2)",
            border: `1px solid ${activeMode === "ai" ? accent + "50" : "var(--border-bright)"}`,
            borderRadius: 7, cursor: desc.trim() ? "pointer" : "not-allowed",
            color: activeMode === "ai" ? accent : "var(--text-secondary)",
            transition: "all 0.15s",
          }}
        >
          ✦ AI Recommend
        </button>

        <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", alignSelf: "center", marginLeft: 4 }}>
          ⌘↵ for instant
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px 0", fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            Thinking…
          </motion.span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 11, fontFamily: "monospace", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div style={{ marginTop: 14 }}>
          {/* Tool suggestions */}
          {toolResults.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color: "var(--text-faint)" }}>
                  SUGGESTED TOOLS
                </span>
                <span style={{
                  fontSize: 9, fontFamily: "monospace",
                  background: `${accent}12`, color: accent,
                  border: `1px solid ${accent}25`, borderRadius: 3, padding: "0 5px",
                }}>
                  {toolResults.length}
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {toolResults.map(({ tool, reason }) => (
                  <ToolResultCard
                    key={tool.id}
                    tool={tool}
                    reason={reason}
                    accent={accent}
                    onSelect={onSelectTool}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Empty state after search */}
      {!loading && !hasResults && activeMode && !error && (
        <div style={{ marginTop: 14, textAlign: "center", padding: "16px 0", fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
          No results found. Try different keywords.
        </div>
      )}
    </motion.div>
  );
}
