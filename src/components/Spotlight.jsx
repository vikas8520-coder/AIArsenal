import { useState } from "react";
import { motion } from "framer-motion";
import { TOOLS } from "../data/tools";
import { getCategoryById } from "../data/categories";

// Curated spotlight tools
const SPOTLIGHT_IDS = ["d24", "a5", "p9", "x1", "t10"];

export default function Spotlight({ onToolSelect }) {
  const spotlights = SPOTLIGHT_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: 2 }}>
          ✦ SPOTLIGHT PICKS
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {spotlights.map((tool, i) => (
          <SpotlightCard key={tool.id} tool={tool} index={i} onClick={() => onToolSelect(tool)} />
        ))}
      </div>
    </div>
  );
}

function SpotlightCard({ tool, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const cat = getCategoryById(tool.category);
  const accent = cat?.color || "#00f0ff";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="gradient-border"
      style={{
        "--orb1": accent,
        "--orb2": cat?.orb2 || accent,
        padding: "14px 16px",
        borderRadius: 12,
        cursor: "pointer",
        background: `linear-gradient(135deg, ${accent}06, var(--surface-1))`,
        backdropFilter: "blur(16px)",
        transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 32px ${accent}15` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent glow top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 1, background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
        <span style={{ fontFamily: "monospace", fontSize: 13, color: accent }}>{cat?.icon}</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)" }}>
          {tool.subcategory}
        </span>
      </div>

      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "var(--text-strong)", marginBottom: 5 }}>
        {tool.name}
      </div>
      <p style={{ fontSize: 10.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
        {tool.desc.slice(0, 70)}{tool.desc.length > 70 ? "…" : ""}
      </p>

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 9, fontFamily: "monospace",
          background: `${accent}15`, color: accent,
          border: `1px solid ${accent}25`, borderRadius: 3, padding: "1px 6px",
        }}>
          {tool.oss ? "OSS" : "FREE TIER"}
        </span>
        <span style={{ fontSize: 10, color: accent, opacity: 0.6 }}>→</span>
      </div>
    </motion.div>
  );
}
