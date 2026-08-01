"use client";
import { Handle, Position } from "@xyflow/react";

/**
 * Trigger Node — starts a workflow (cron, webhook, manual)
 */
export default function TriggerNode({ data, selected }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: `1.5px solid ${selected ? "#3b82f6" : "var(--border)"}`,
        borderRadius: 12,
        padding: "10px 14px",
        minWidth: 160,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 0 2px #3b82f630, 0 8px 24px rgba(0,0,0,0.2)`
          : "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "grab",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: "#3b82f6",
          border: "2px solid var(--surface-2)",
          borderRadius: "50%",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "#3b82f618",
            fontSize: 12,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ⚡
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
          {data.subcategory || "Trigger"}
        </span>
      </div>

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

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: "#3b82f6",
          border: "2px solid var(--surface-2)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}