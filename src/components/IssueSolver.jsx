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

async function askClaude(desc, apiKey) {
  const preFiltered = searchTools(TOOLS, desc).slice(0, 40);
  const toolList = preFiltered
    .map((t) => `ID:${t.id} | ${t.name} | ${t.category} | ${t.desc}`)
    .join("\n");

  const prompt = `You are a tool recommendation engine for AIArsenal (216+ AI tools).

TOOLS (pre-filtered, most relevant):
${toolList}

USER PROBLEM: ${desc}

Respond ONLY with valid JSON: {"tools":[{"id":"exact_id","reason":"one sentence why this solves the problem"}]}
Suggest 4-8 tools. Only use IDs from the list above.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid response from Claude");
  const parsed = JSON.parse(match[0]);

  return (parsed.tools || [])
    .map(({ id, reason }) => ({ tool: TOOLS.find((t) => t.id === id), reason }))
    .filter((r) => r.tool);
}

async function exaSearch(desc, exaKey) {
  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "x-api-key": exaKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `AI tools to help: ${desc}`,
      type: "auto",
      num_results: 6,
      contents: {
        highlights: { max_characters: 200, num_sentences: 2 },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Exa API error ${res.status}`);
  }

  const data = await res.json();
  return data.results || [];
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

function WebResultCard({ result }) {
  const hostname = (() => {
    try { return new URL(result.url).hostname.replace("www.", ""); } catch { return result.url; }
  })();
  return (
    <motion.a
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", flexDirection: "column", gap: 3, padding: "9px 12px",
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: 8, textDecoration: "none", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)";
        e.currentTarget.style.background = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--surface-1)";
      }}
    >
      <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-strong)", fontWeight: 600 }}>
        {result.title} ↗
      </div>
      <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace" }}>{hostname}</div>
      {result.highlights?.[0] && (
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
          {result.highlights[0].text}
        </div>
      )}
    </motion.a>
  );
}

function ApiKeyInput({ label, value, onChange, onSave, placeholder }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: "hidden" }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", alignSelf: "center", flexShrink: 0 }}>
          {label}
        </span>
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-bright)",
            borderRadius: 6, color: "var(--text-strong)", fontSize: 11,
            fontFamily: "monospace", padding: "5px 10px", outline: "none",
          }}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
        />
        <button
          onClick={onSave}
          style={{
            fontSize: 10, fontFamily: "monospace", padding: "5px 12px",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 6, color: "#818cf8", cursor: "pointer", flexShrink: 0,
          }}
        >
          Save
        </button>
      </div>
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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("nexus-api-key") || "");
  const [exaKey, setExaKey] = useState(() => localStorage.getItem("nexus-exa-key") || "");
  const [showClaudeKeyInput, setShowClaudeKeyInput] = useState(false);
  const [showExaKeyInput, setShowExaKeyInput] = useState(false);

  const saveClaudeKey = () => {
    if (!apiKey.trim()) return;
    try { localStorage.setItem("nexus-api-key", apiKey.trim()); } catch {}
    setShowClaudeKeyInput(false);
  };

  const saveExaKey = () => {
    if (!exaKey.trim()) return;
    try { localStorage.setItem("nexus-exa-key", exaKey.trim()); } catch {}
    setShowExaKeyInput(false);
  };

  const runInstant = () => {
    if (!desc.trim()) return;
    setError(null);
    setWebResults([]);
    setActiveMode("instant");
    const results = instantMatch(desc);
    setToolResults(results);
  };

  const runClaude = async () => {
    if (!desc.trim()) return;
    const key = apiKey.trim();
    if (!key) { setShowClaudeKeyInput(true); return; }
    setError(null);
    setWebResults([]);
    setActiveMode("claude");
    setLoading(true);
    setToolResults([]);
    try {
      const results = await askClaude(desc, key);
      setToolResults(results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runExa = async () => {
    if (!desc.trim()) return;
    const key = exaKey.trim();
    if (!key) { setShowExaKeyInput(true); return; }
    setError(null);
    setActiveMode("exa");
    setLoading(true);
    setToolResults([]);
    setWebResults([]);
    try {
      const [tools, web] = await Promise.all([
        Promise.resolve(instantMatch(desc)),
        exaSearch(desc, key),
      ]);
      setToolResults(tools);
      setWebResults(web);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = toolResults.length > 0 || webResults.length > 0;

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

      {/* API key inputs (conditional) */}
      <AnimatePresence>
        {showClaudeKeyInput && (
          <ApiKeyInput
            label="Anthropic key:"
            value={apiKey}
            onChange={setApiKey}
            onSave={saveClaudeKey}
            placeholder="sk-ant-..."
          />
        )}
        {showExaKeyInput && (
          <ApiKeyInput
            label="Exa key:"
            value={exaKey}
            onChange={setExaKey}
            onSave={saveExaKey}
            placeholder="your-exa-api-key"
          />
        )}
      </AnimatePresence>

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
          onClick={runClaude}
          disabled={!desc.trim() || loading}
          style={{
            fontFamily: "monospace", fontSize: 10, padding: "7px 14px",
            background: activeMode === "claude" ? "rgba(99,102,241,0.15)" : "var(--surface-2)",
            border: `1px solid ${activeMode === "claude" ? "rgba(99,102,241,0.4)" : "var(--border-bright)"}`,
            borderRadius: 7, cursor: desc.trim() ? "pointer" : "not-allowed",
            color: activeMode === "claude" ? "#818cf8" : "var(--text-secondary)",
            transition: "all 0.15s",
          }}
        >
          ✦ Ask Claude
        </button>

        <button
          onClick={runExa}
          disabled={!desc.trim() || loading}
          style={{
            fontFamily: "monospace", fontSize: 10, padding: "7px 14px",
            background: activeMode === "exa" ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
            border: `1px solid ${activeMode === "exa" ? "rgba(16,185,129,0.35)" : "var(--border-bright)"}`,
            borderRadius: 7, cursor: desc.trim() ? "pointer" : "not-allowed",
            color: activeMode === "exa" ? "#10b981" : "var(--text-secondary)",
            transition: "all 0.15s",
          }}
        >
          🔍 Web Search
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
            {activeMode === "claude" ? "Asking Claude…" : "Searching the web…"}
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

          {/* Web resources */}
          {webResults.length > 0 && (
            <div style={{ marginTop: toolResults.length > 0 ? 16 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color: "var(--text-faint)" }}>
                  WEB RESOURCES
                </span>
                <span style={{
                  fontSize: 9, fontFamily: "monospace",
                  background: "rgba(16,185,129,0.1)", color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.2)", borderRadius: 3, padding: "0 5px",
                }}>
                  {webResults.length}
                </span>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)" }}>
                  via Exa
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {webResults.map((result, i) => (
                  <WebResultCard key={result.url || i} result={result} />
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
