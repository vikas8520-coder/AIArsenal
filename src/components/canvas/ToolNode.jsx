"use client";
import { Handle, Position } from "@xyflow/react";
import { getCategoryById } from "@/src/data/categories";

/**
 * Custom React Flow node representing an AI tool from the directory.
 * Shows tool name, category icon, and color accent.
 */
export default function ToolNode({ data, selected }) {
  const cat = getCategoryById(data.category);
  const color = cat?.color || "#6b7280";

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: `1.5px solid ${selected ? color : "var(--border)"}`,
        borderRadius: 12,
        padding: "10px 14px",
        minWidth: 160,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 0 2px ${color}30, 0 8px 24px rgba(0,0,0,0.2)`
          : "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "grab",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: color,
          border: "2px solid var(--surface-2)",
          borderRadius: "50%",
        }}
      />

      {/* Category icon + color accent bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            background: `${color}18`,
            fontSize: 12,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {cat?.icon || "◈"}
        </span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "monospace",
            color: "var(--text-faint)",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data.subcategory || cat?.label || "Tool"}
        </span>
      </div>

      {/* Tool name */}
      <div
        style={{
          fontSize: 12,
          fontFamily: "monospace",
          fontWeight: 600,
          color: "var(--text-strong)",
          lineHeight: 1.3,
          marginBottom: 2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {data.label}
      </div>

      {/* Short description */}
      {data.description && (
        <div
          style={{
            fontSize: 10,
            color: "var(--text-faint)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {data.description}
        </div>
      )}

      {/* Free/Paid badge */}
      {data.pricing && (
        <div
          style={{
            marginTop: 6,
            fontSize: 9,
            fontFamily: "monospace",
            fontWeight: 600,
            color: data.pricing === "Free" ? "#22c55e" : "#f59e0b",
            background: data.pricing === "Free" ? "#22c55e12" : "#f59e0b12",
            padding: "2px 6px",
            borderRadius: 4,
            display: "inline-block",
          }}
        >
          {data.pricing}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: color,
          border: "2px solid var(--surface-2)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
