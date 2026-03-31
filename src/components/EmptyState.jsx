"use client";
import { motion } from "framer-motion";
import EmailCapture from "./EmailCapture";

const SUGGESTIONS = ["local llm", "free gpu", "image gen", "agents", "rlhf income", "obsidian", "memory", "telegram"];

export default function EmptyState({ query, onClear, accent = "#00f0ff" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", padding: "60px 24px" }}
    >
      <div style={{ fontFamily: "monospace", fontSize: 28, color: accent, opacity: 0.4, marginBottom: 16 }}>◈</div>
      <h3 style={{ fontFamily: "monospace", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 6px" }}>
        No tools found for "{query}"
      </h3>
      <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "0 0 20px" }}>
        Try a different search or browse by category
      </p>

      <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
        {SUGGESTIONS.map((s) => (
          <span
            key={s}
            style={{
              fontSize: 10, fontFamily: "monospace",
              background: "var(--surface-1)", border: "1px solid var(--border)",
              borderRadius: 4, color: "var(--text-muted)", padding: "3px 9px",
              cursor: "default",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <button
        onClick={onClear}
        style={{
          fontFamily: "monospace", fontSize: 11,
          background: `${accent}15`, color: accent,
          border: `1px solid ${accent}30`,
          borderRadius: 6, padding: "7px 18px",
          cursor: "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${accent}25`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${accent}15`; }}
      >
        Clear search
      </button>

      <EmailCapture accent={accent} compact />
    </motion.div>
  );
}
