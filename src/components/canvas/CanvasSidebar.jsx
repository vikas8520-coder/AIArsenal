"use client";
import { useState, useMemo } from "react";
import { TOOLS } from "@/src/data/tools";
import { CATEGORIES } from "@/src/data/categories";

/** Flow control node types for the canvas palette */
const FLOW_NODES = [
  {
    type: "trigger",
    label: "Trigger",
    subcategory: "Start workflow",
    desc: "Start workflow — cron, webhook, or manual",
    icon: "⚡",
    color: "#3b82f6",
  },
  {
    type: "condition",
    label: "Condition",
    subcategory: "If / else branch",
    desc: "Branch flow based on condition",
    icon: "⌘",
    color: "#f59e0b",
  },
  {
    type: "action",
    label: "Action",
    subcategory: "Perform action",
    desc: "Perform action — API call, send email, run script",
    icon: "➤",
    color: "#22c55e",
  },
  {
    type: "output",
    label: "Output",
    subcategory: "Final output",
    desc: "Final output — email, file, notification, webhook",
    icon: "📤",
    color: "#a855f7",
  },
];

/**
 * Left sidebar of the canvas: searchable, draggable tool palette
 * grouped by category. Items use the native HTML5 drag API —
 * the canvas reads the tool id from the drag event dataTransfer.
 */
export default function CanvasSidebar({ onClose }) {
  const [search, setSearch] = useState("");
  const [collapsedCats, setCollapsedCats] = useState(new Set());

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.desc || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q)
    ).slice(0, 20);
  }, [search]);

  const toggleCat = (id) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onDragStart = (e, item) => {
    // Handle both TOOLS (with tool.id) and FLOW_NODES (with item.type)
    const payload = item.type && !item.id
      ? {
          nodeType: item.type,
          name: item.label,
          subcategory: item.subcategory,
          description: item.desc,
          pricing: "Free",
          color: item.color,
        }
      : {
          toolId: item.id,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          description: (item.desc || "").slice(0, 80),
          pricing: item.free && /free/i.test(item.free) ? "Free" : "Paid",
          url: item.url,
        };
    e.dataTransfer.setData("application/aiarsenal-tool", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const renderItem = (tool) => {
    const cat = CATEGORIES.find((c) => c.id === tool.category);
    return (
      <div
        key={tool.id}
        draggable
        onDragStart={(e) => onDragStart(e, tool)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 8px",
          borderRadius: 8,
          cursor: "grab",
          userSelect: "none",
          background: "transparent",
          border: "1px solid transparent",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--surface-3)";
          e.currentTarget.style.border = "1px solid var(--border)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.border = "1px solid transparent";
        }}
        title={`Drag onto canvas — ${tool.desc || ""}`}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            background: `${cat?.color || "#666"}18`,
            color: cat?.color || "#888",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            flexShrink: 0,
          }}
        >
          {cat?.icon || "◈"}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10.5,
              fontFamily: "monospace",
              fontWeight: 600,
              color: "var(--text-strong)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tool.name}
          </div>
          <div
            style={{
              fontSize: 8.5,
              color: "var(--text-faint)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tool.subcategory || tool.category}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: "var(--surface-1)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 12px 8px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "var(--text-strong)", letterSpacing: 0.6, textTransform: "uppercase" }}>
            Tool Palette
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close palette"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 14 }}
            >
              ✕
            </button>
          )}
        </div>
        <div style={{ marginTop: 4, fontSize: 9.5, color: "var(--text-faint)", lineHeight: 1.4 }}>
          Drag tools onto the canvas, then connect them.
        </div>
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools…"
          style={{
            width: "100%",
            marginTop: 8,
            padding: "6px 8px",
            fontSize: 11,
            fontFamily: "monospace",
            background: "var(--surface-2)",
            color: "var(--text-strong)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            outline: "none",
          }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 20px" }}>
        {results ? (
          <div>
            <div style={{ fontSize: 9.5, color: "var(--text-faint)", padding: "4px 8px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Results ({results.length})
            </div>
            {results.length === 0 && (
              <div style={{ padding: 16, fontSize: 10, color: "var(--text-faint)", textAlign: "center" }}>
                No tools match "{search}"
              </div>
            )}
            {results.map(renderItem)}
          </div>
        ) : (
          <div>
            {/* Flow Control nodes */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9.5, color: "var(--text-faint)", padding: "4px 8px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Flow Control
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {FLOW_NODES.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 8px",
                      borderRadius: 8,
                      cursor: "grab",
                      userSelect: "none",
                      background: "transparent",
                      border: "1px solid transparent",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--surface-3)";
                      e.currentTarget.style.border = "1px solid var(--border)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                    }}
                    title={`Drag onto canvas — ${node.desc}`}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        background: `${node.color}18`,
                        color: node.color,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        flexShrink: 0,
                      }}
                    >
                      {node.icon}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "var(--text-strong)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {node.label}
                      </div>
                      <div
                        style={{
                          fontSize: 8.5,
                          color: "var(--text-faint)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {node.subcategory}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Tool Categories */}
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const tools = TOOLS.filter((t) => t.category === cat.id);
              if (tools.length === 0) return null;
              const isCollapsed = collapsedCats.has(cat.id);
              return (
                <div key={cat.id} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 8px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 6,
                      color: "var(--text-mid)",
                      fontSize: 9.5,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ color: cat.color, fontSize: 10 }}>{cat.icon}</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cat.label}
                    </span>
                    <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>{isCollapsed ? "▸" : "▾"}</span>
                  </button>
                  {isCollapsed ? null : tools.slice(0, 8).map(renderItem)}
                  {!isCollapsed && tools.length > 8 && (
                    <div style={{ padding: "2px 8px", fontSize: 8.5, color: "var(--text-faint)" }}>
                      +{tools.length - 8} more — search above
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}