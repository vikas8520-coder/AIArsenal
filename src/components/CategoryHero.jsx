"use client";
import { motion } from "framer-motion";
import { TOOLS } from "../data/tools";
import { CATEGORIES } from "../data/categories";

export default function CategoryHero({ cat, filteredCount }) {
  const isAll = cat.id === "all";
  const ossCount = isAll
    ? TOOLS.filter((t) => t.oss).length
    : TOOLS.filter((t) => t.category === cat.id && t.oss).length;
  const totalCount = isAll
    ? TOOLS.length
    : TOOLS.filter((t) => t.category === cat.id).length;

  return (
    <motion.div
      key={cat.id}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        marginBottom: 24,
        padding: "20px 22px",
        background: `linear-gradient(135deg, ${cat.color}08 0%, transparent 60%)`,
        border: `1px solid ${cat.color}18`,
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent blob */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: cat.color, opacity: 0.04, filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 20, fontFamily: "monospace", color: cat.color }}>{cat.icon}</span>
            <h1 style={{ margin: 0, fontFamily: "monospace", fontWeight: 700, fontSize: 17, color: "var(--text-strong)" }}>
              {cat.label}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 500 }}>
            {cat.desc}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          <Stat label="TOTAL" value={filteredCount} color={cat.color} />
          <Stat label="OSS" value={ossCount} color="#00ff88" />
          {isAll && <Stat label="CATEGORIES" value={CATEGORIES.length} color="#b388ff" />}
        </div>
      </div>

      {/* Mood chip */}
      <div style={{ marginTop: 12, display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{
          fontSize: 9, fontFamily: "monospace", letterSpacing: 1,
          background: `${cat.color}15`, color: cat.color,
          border: `1px solid ${cat.color}25`,
          borderRadius: 4, padding: "2px 8px",
        }}>
          {cat.mood}
        </span>
        {filteredCount !== totalCount && (
          <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace" }}>
            {filteredCount} of {totalCount} shown
          </span>
        )}
      </div>
    </motion.div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 18, color }}>{value}</div>
      <div style={{ fontFamily: "monospace", fontSize: 8, color: "var(--text-faint)", letterSpacing: 1, marginTop: 2 }}>{label}</div>
    </div>
  );
}
