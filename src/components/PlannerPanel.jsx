"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function buildPrompt(description, tools) {
  const toolList = tools
    .map((t) => `- ${t.name} [${t.category} > ${t.subcategory}]: ${t.desc}. Free: ${t.free}`)
    .join("\n");
  return `You are an AI project planning assistant for the AI Intelligence Nexus. A user describes their project and you recommend the best tools from the available arsenal.

AVAILABLE TOOLS:
${toolList}

USER PROJECT:
${description}

Respond ONLY with valid JSON (no backticks, no markdown). Use this exact structure:
{
  "summary": "One-line project classification",
  "recommended": [{ "id": "tool id exactly as listed", "reason": "Why this tool fits (1 sentence)" }],
  "stack_notes": "2-3 sentences on how these tools work together",
  "estimated_monthly_cost": "Estimated monthly cost using free tiers"
}

Recommend 8-15 tools covering the full stack needed. Prioritize free tiers and open-source. Include tools from Token Economy, AI Income, or Cost Optimization when relevant. Only use tool IDs that exist in the list.`;
}

export default function PlannerPanel({
  tools, selected, onSelect, plannerMode, accent,
}) {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showStack, setShowStack] = useState(false);

  const selectedTools = tools.filter((t) => selected.has(t.id));

  const runAI = async () => {
    if (!desc.trim()) { setError("Describe your project first."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(desc, tools) }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      let raw = data.text || "";
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const parsed = JSON.parse(raw);
      setResult(parsed);
      if (parsed.recommended) {
        parsed.recommended.forEach((r) => onSelect(r.id, true));
      }
    } catch (e) {
      setError(e.message.includes("JSON") ? "AI returned invalid JSON. Try again." : e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportStack = () => {
    const lines = [
      `# AI Stack — AI Intelligence Nexus\n`,
      `## Project\n${desc}\n`,
      ...selectedTools.map(
        (t) => `### ${t.name}\n- **Category:** ${t.category} › ${t.subcategory}\n- **Free Tier:** ${t.free}\n- **URL:** https://${t.url}\n`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-stack.md";
    a.click();
  };

  if (!plannerMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        margin: "0 0 20px",
        background: "var(--surface-1)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${accent}25`,
        borderRadius: 14,
        padding: 18,
        boxShadow: `0 0 40px ${accent}06`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: accent, letterSpacing: 2 }}>◈ AI STACK PLANNER</span>
        <div style={{ flex: 1, height: 1, background: `${accent}20` }} />
        <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)" }}>
          {selected.size} selected
        </span>
      </div>

      {/* Description */}
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe your project... e.g. 'Personal AI assistant with Telegram interface, Obsidian vault, trend monitoring, and local-first memory'"
        rows={3}
        style={{
          width: "100%", padding: "10px 12px", marginBottom: 10,
          background: "var(--surface-1)", border: "1px solid var(--border)",
          borderRadius: 8, color: "var(--text-strong)", fontSize: 12,
          fontFamily: "monospace", outline: "none", resize: "vertical",
          lineHeight: 1.5, boxSizing: "border-box",
        }}
      />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={runAI}
          disabled={loading}
          style={{
            fontFamily: "monospace", fontSize: 11,
            background: loading ? "var(--surface-2)" : `${accent}20`,
            border: `1px solid ${accent}35`, borderRadius: 7,
            padding: "8px 16px", cursor: loading ? "not-allowed" : "pointer",
            color: loading ? "var(--text-faint)" : accent,
            transition: "all 0.15s",
          }}
        >
          {loading ? "Thinking…" : "◈ Recommend Stack"}
        </button>

        {selectedTools.length > 0 && (
          <>
            <button
              onClick={() => setShowStack(!showStack)}
              style={{
                fontFamily: "monospace", fontSize: 11,
                background: "var(--surface-1)", border: "1px solid var(--border-bright)",
                borderRadius: 7, padding: "8px 14px", cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              {showStack ? "Hide" : "Show"} Stack ({selectedTools.length})
            </button>
            <button
              onClick={exportStack}
              style={{
                fontFamily: "monospace", fontSize: 11,
                background: "var(--surface-1)", border: "1px solid var(--border-bright)",
                borderRadius: 7, padding: "8px 14px", cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              Export .md
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: 11, color: "#ef5350", fontFamily: "monospace", marginTop: 10, margin: "10px 0 0" }}>
          ⚠ {error}
        </p>
      )}

      {/* AI Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 14, padding: 14,
              background: `${accent}08`, border: `1px solid ${accent}20`,
              borderRadius: 10,
            }}
          >
            <p style={{ fontFamily: "monospace", fontSize: 11, color: accent, margin: "0 0 8px", fontWeight: 700 }}>
              {result.summary}
            </p>
            <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>
              {result.stack_notes}
            </p>
            <p style={{ fontFamily: "monospace", fontSize: 10, color: "#76ff03", margin: 0 }}>
              💰 {result.estimated_monthly_cost}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected stack list */}
      <AnimatePresence>
        {showStack && selectedTools.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", marginTop: 12 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {selectedTools.map((t) => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 10px", background: "var(--surface-1)",
                  borderRadius: 6, fontSize: 11, fontFamily: "monospace",
                }}>
                  <span style={{ color: "var(--text-default)" }}>{t.name}</span>
                  <button
                    onClick={() => onSelect(t.id, false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 12 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
