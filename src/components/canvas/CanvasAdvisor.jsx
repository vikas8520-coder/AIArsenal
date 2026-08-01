"use client";
import { useMemo, useState } from "react";
import { GOALS, analyzeCanvas, getGoal, toolNameById, toolCategoryById } from "@/src/data/goals";

const TYPE_STYLE = {
  ok: { color: "#22c55e", icon: "✓", bg: "#22c55e10" },
  info: { color: "#3b82f6", icon: "ℹ", bg: "#3b82f610" },
  warn: { color: "#f59e0b", icon: "!", bg: "#f59e0b10" },
  tip: { color: "#a78bfa", icon: "→", bg: "#a78bfa10" },
};

/**
 * Canvas advisor: pick a goal to load a starter stack, and get
 * live suggestions about what's missing / redundant / worth adding.
 */
export default function CanvasAdvisor({ nodes, edges, onApplyGoal, onAddTool, activeGoal, setActiveGoal }) {
  const [view, setView] = useState("goals"); // "goals" | "advice"

  const suggestions = useMemo(
    () => analyzeCanvas(nodes, activeGoal),
    [nodes, activeGoal]
  );

  const appliedToolIds = useMemo(
    () => new Set(nodes.map((n) => n.data?.toolId).filter(Boolean)),
    [nodes]
  );

  const applyGoal = (goal) => {
    onApplyGoal(goal);
    setActiveGoal(goal.id);
  };

  const activeGoalObj = activeGoal ? getGoal(activeGoal) : null;

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        background: "var(--surface-1)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Panel tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setView("goals")}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: view === "goals" ? "var(--text-strong)" : "var(--text-faint)",
            borderBottom: view === "goals" ? "2px solid var(--accent, #00f0ff)" : "2px solid transparent",
          }}
        >
          🎯 Goals
        </button>
        <button
          onClick={() => setView("advice")}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: view === "advice" ? "var(--text-strong)" : "var(--text-faint)",
            borderBottom: view === "advice" ? "2px solid var(--accent, #00f0ff)" : "2px solid transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          💡 Advice
          {suggestions.length > 0 && (
            <span
              style={{
                background: "#a78bfa20",
                color: "#a78bfa",
                fontSize: 8.5,
                padding: "0 5px",
                borderRadius: 8,
              }}
            >
              {suggestions.length}
            </span>
          )}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {view === "goals" ? (
          <div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", lineHeight: 1.4, marginBottom: 8, padding: "0 2px" }}>
              What are you trying to build? Pick a goal — we'll lay out the right stack and suggest upgrades.
            </div>
            {GOALS.map((g) => {
              const active = activeGoal === g.id;
              const hasStack = g.stack.every((id) => appliedToolIds.has(id));
              return (
                <button
                  key={g.id}
                  onClick={() => applyGoal(g)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: active ? "var(--surface-3)" : "var(--surface-2)",
                    border: active ? "1px solid var(--accent, #00f0ff)" : "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "9px 10px",
                    marginBottom: 6,
                    cursor: "pointer",
                    transition: "border-color 0.12s, background 0.12s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{g.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "var(--text-strong)" }}>
                        {g.title}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 1, lineHeight: 1.35 }}>
                        {g.tagline}
                      </div>
                    </div>
                    {hasStack ? (
                      <span style={{ fontSize: 9, color: "#22c55e", flexShrink: 0 }}>✓ on canvas</span>
                    ) : (
                      <span style={{ fontSize: 9, color: "var(--text-faint)", flexShrink: 0 }}>{g.stack.length} tools</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", lineHeight: 1.4, marginBottom: 8, padding: "0 2px" }}>
              Live analysis of your canvas. {activeGoalObj ? `Goal: ${activeGoalObj.title}.` : "Pick a goal to get goal-specific advice."}
            </div>
            {suggestions.map((s, i) => {
              const st = TYPE_STYLE[s.type] || TYPE_STYLE.info;
              return (
                <div
                  key={i}
                  style={{
                    background: st.bg,
                    border: "1px solid var(--border)",
                    borderLeft: `2px solid ${st.color}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    marginBottom: 6,
                    fontSize: 10,
                    color: "var(--text-mid)",
                    lineHeight: 1.45,
                  }}
                >
                  <span style={{ color: st.color, fontWeight: 700, marginRight: 4 }}>{st.icon}</span>
                  {s.text}
                  {s.toolId && (
                    <button
                      onClick={() => onAddTool(s.toolId)}
                      style={{
                        display: "block",
                        marginTop: 6,
                        background: "var(--surface-2)",
                        color: "var(--text-strong)",
                        border: "1px solid var(--border-bright)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: 9.5,
                        fontFamily: "monospace",
                        cursor: "pointer",
                      }}
                    >
                      + Add {toolNameById[s.toolId] || "tool"}
                    </button>
                  )}
                </div>
              );
            })}
            {suggestions.length === 0 && (
              <div style={{ fontSize: 10, color: "var(--text-faint)", textAlign: "center", padding: 20 }}>
                Add tools to your canvas to get suggestions.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
