"use client";
import Link from "next/link";

/**
 * Top toolbar of the canvas editor.
 * Left: title + breadcrumb back link. Right: actions.
 */
export default function CanvasToolbar({
  nodeCount,
  edgeCount,
  onClear,
  onExport,
  onExportN8n,
  onSave,
  onLoadTemplate,
  onFitView,
  onAutoLayout,
  onToggleAdvisor,
  onUndo,
  onRedo,
  onShare,
  advisorOpen,
  canUndo,
  canRedo,
  saveState = "idle",
  totalCost = 0,
  paidToolCount = 0,
}) {
  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save";

  const costColor = totalCost === 0 ? "#22c55e" : totalCost <= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "var(--surface-1)",
        borderBottom: "1px solid var(--border)",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Link
          href="/"
          style={{
            color: "var(--text-faint)",
            fontSize: 12,
            textDecoration: "none",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
          }}
        >
          ← Directory
        </Link>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "var(--text-strong)", whiteSpace: "nowrap" }}>
          ◈ STACK CANVAS
        </div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
          {nodeCount} nodes · {edgeCount} links
        </div>
        {totalCost > 0 && (
          <div
            style={{
              background: `${costColor}18`,
              color: costColor,
              border: `1px solid ${costColor}40`,
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 10,
              fontFamily: "monospace",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            title={`${paidToolCount} paid tool${paidToolCount !== 1 ? "s" : ""}`}
          >
            💰 ${totalCost}/mo
          </div>
        )}
        {totalCost === 0 && nodeCount > 0 && (
          <div
            style={{
              background: "#22c55e18",
              color: "#22c55e",
              border: "1px solid #22c55e40",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 10,
              fontFamily: "monospace",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            💰 Free
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <button
          onClick={onLoadTemplate}
          title="Load a starter automation"
          style={btnStyle}
        >
          ⚡ Templates
        </button>
        <button onClick={onAutoLayout} title="Auto-arrange nodes" style={btnStyle}>
          ⬜ Auto-layout
        </button>
        <button onClick={onFitView} title="Zoom to fit all nodes" style={btnStyle}>
          ⌖ Fit
        </button>
        <button onClick={onExport} title="Export canvas as JSON" style={btnStyle}>
          ⇩ Export
        </button>
        <button onClick={onExportN8n} title="Export as n8n workflow" style={btnStyle}>
          ⤷ n8n
        </button>
        <button onClick={onShare} title="Share canvas (copies URL)" style={btnStyle}>
          ⧉ Share
        </button>
        <button onClick={onToggleAdvisor} title="Toggle advisor panel" style={{ ...btnStyle, ...(advisorOpen ? { color: "var(--accent, #00f0ff)" } : {}) }}>
          💡 Advisor
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          style={{ ...btnStyle, opacity: canUndo ? 1 : 0.35, cursor: canUndo ? "pointer" : "not-allowed" }}
        >
          ↶ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          style={{ ...btnStyle, opacity: canRedo ? 1 : 0.35, cursor: canRedo ? "pointer" : "not-allowed" }}
        >
          ↷ Redo
        </button>
        <button onClick={onSave} style={{ ...btnStyle, ...(saveState === "saved" ? { color: "#22c55e" } : {}) }}>
          {saveLabel}
        </button>
        <button
          onClick={onClear}
          title="Clear the canvas"
          style={{ ...btnStyle, color: "var(--danger, #ef4444)" }}
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "var(--surface-2)",
  color: "var(--text-mid)",
  border: "1px solid var(--border)",
  borderRadius: 7,
  padding: "6px 12px",
  fontSize: 10.5,
  fontFamily: "monospace",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.12s, border-color 0.12s",
  whiteSpace: "nowrap",
};