"use client";
import { useMemo, useState } from "react";
import { GOALS, analyzeCanvas, getGoal, toolNameById, toolCategoryById } from "@/src/data/goals";
import { analyzeArchitecture } from "./ArchitectureAnalyzer";
import MermaidDiagram from "./MermaidDiagram";

const TYPE_STYLE = {
  ok: { color: "#16a34a", icon: "✓", bg: "#dcfce7" },   // dark green on light green
  info: { color: "#1d4ed8", icon: "ℹ", bg: "#dbeafe" },  // dark blue on light blue
  warn: { color: "#b45309", icon: "!", bg: "#fef3c7" },  // dark amber on light amber
  tip: { color: "#7c3aed", icon: "→", bg: "#ede9fe" },   // dark purple on light purple
};

/**
 * Canvas advisor: pick a goal to load a starter stack, and get
 * live suggestions about what's missing / redundant / worth adding.
 */
export default function CanvasAdvisor({ nodes, edges, onApplyGoal, onAddTool, activeGoal, setActiveGoal }) {
  const [view, setView] = useState("goals"); // "goals" | "advice" | "architecture"

  const suggestions = useMemo(
    () => {
      try {
        return analyzeCanvas(nodes, activeGoal);
      } catch (err) {
        console.error("Canvas analysis error:", err);
        return [];
      }
    },
    [nodes, activeGoal]
  );

  const architecture = useMemo(
    () => {
      try {
        return analyzeArchitecture(nodes, edges);
      } catch (err) {
        console.error("Architecture analysis error:", err);
        return { nodeRoles: {}, issues: [], corrected: { appType: "Custom AI Stack", layers: [], mermaid: "", recommendations: [] }, summary: {} };
      }
    },
    [nodes, edges]
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
        <button
          onClick={() => setView("architecture")}
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
            color: view === "architecture" ? "var(--text-strong)" : "var(--text-faint)",
            borderBottom: view === "architecture" ? "2px solid var(--accent, #00f0ff)" : "2px solid transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          🏗 Architecture
          {architecture.issues.length > 0 && (
            <span
              style={{
                background: "#ef444420",
                color: "#ef4444",
                fontSize: 8.5,
                padding: "0 5px",
                borderRadius: 8,
              }}
            >
              {architecture.issues.length}
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
                      <span style={{ fontSize: 9, color: "#16a34a", flexShrink: 0 }}>✓ on canvas</span>
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
        {view === "architecture" && (
          <div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", lineHeight: 1.4, marginBottom: 8, padding: "0 2px" }}>
              Architecture analysis of your canvas. {architecture.issues.length > 0 ? `${architecture.issues.length} issue${architecture.issues.length !== 1 ? "s" : ""} detected.` : "No major issues found."}
            </div>
            
            {/* Issues */}
            {architecture.issues.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Issues Detected
                </div>
                {architecture.issues.map((issue, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#ef444410",
                      border: "1px solid #ef444430",
                      borderLeft: "3px solid #ef4444",
                      borderRadius: 8,
                      padding: "8px 10px",
                      marginBottom: 6,
                      fontSize: 9.5,
                      color: "var(--text-mid)",
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#ef4444", marginBottom: 3 }}>{issue.name}</div>
                    <div style={{ marginBottom: 4 }}>{issue.description}</div>
                    <div style={{ fontSize: 8.5, color: "#a78bfa", fontFamily: "monospace" }}>
                      Fix: {issue.fix}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Corrected Architecture */}
            <div>
              <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Corrected Architecture ({architecture.corrected.appType})
              </div>
              
              {/* Layers */}
              <div style={{ marginBottom: 12 }}>
                {architecture.corrected.layers.map((layer, li) => (
                  <div key={li} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-strong)" }}>{layer.name}</span>
                      {layer.recommended && (
                        <span style={{ fontSize: 7.5, background: "#f59e0b20", color: "#f59e0b", padding: "0 4px", borderRadius: 3, fontFamily: "monospace" }}>recommended</span>
                      )}
                      {layer.parallel && (
                        <span style={{ fontSize: 7.5, background: "#3b82f620", color: "#3b82f6", padding: "0 4px", borderRadius: 3, fontFamily: "monospace" }}>parallel</span>
                      )}
                    </div>
                    <div style={{ fontSize: 8.5, color: "var(--text-faint)", marginBottom: 4 }}>
                      {layer.description}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {layer.tools.map((tool, ti) => (
                        <span
                          key={ti}
                          style={{
                            fontSize: 8.5,
                            background: "var(--surface-2)",
                            color: "var(--text-strong)",
                            border: "1px solid var(--border)",
                            borderRadius: 4,
                            padding: "2px 6px",
                            fontFamily: "monospace",
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Recommendations */}
              {architecture.corrected.recommendations.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Recommendations
                  </div>
                  {architecture.corrected.recommendations.map((rec, ri) => (
                    <div
                      key={ri}
                      style={{
                        background: rec.type === 'fix' ? "#ef444410" : rec.type === 'add' ? "#3b82f610" : "#a78bfa10",
                        border: rec.type === 'fix' ? "1px solid #ef444430" : rec.type === 'add' ? "1px solid #3b82f630" : "1px solid #a78bfa30",
                        borderLeft: rec.type === 'fix' ? "3px solid #ef4444" : rec.type === 'add' ? "3px solid #3b82f6" : "3px solid #a78bfa",
                        borderRadius: 8,
                        padding: "8px 10px",
                        marginBottom: 4,
                        fontSize: 9.5,
                        color: "var(--text-mid)",
                        lineHeight: 1.45,
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>
                        {rec.type === 'fix' ? '🔧 Fix: ' : rec.type === 'add' ? '➕ Add: ' : '💡 '}
                        {rec.title}
                      </div>
                      <div style={{ fontSize: 8.5, color: "var(--text-faint)" }}>{rec.description}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Mermaid Diagram */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Architecture Diagram
                </div>
                <MermaidDiagram mermaidCode={architecture.corrected.mermaid} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
