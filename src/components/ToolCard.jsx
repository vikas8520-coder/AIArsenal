import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryById } from "../data/categories";

export function SkeletonCard() {
  return (
    <div style={{
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "13px 15px",
      marginBottom: 6,
    }}>
      <div className="skeleton" style={{ width: "55%", height: 12, marginBottom: 7 }} />
      <div className="skeleton" style={{ width: "85%", height: 10 }} />
    </div>
  );
}

function getToolUrl(tool) {
  if (tool.affiliate) {
    const url = new URL(tool.affiliate);
    url.searchParams.set("utm_source", "aiarsenal");
    url.searchParams.set("utm_medium", "directory");
    url.searchParams.set("utm_campaign", "tools");
    return url.toString();
  }
  return `https://${tool.url}`;
}

function trackClick(tool) {
  if (window.plausible) {
    window.plausible(tool.affiliate ? "Affiliate Click" : "Tool Click", {
      props: { tool: tool.name, category: tool.category },
    });
  }
}

export default function ToolCard({ tool, selected, onToggle, plannerMode }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const cat = getCategoryById(tool.category);
  const accent = cat?.color || "#00f0ff";

  // Mouse-glow effect
  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  const isPrivacyWarning = tool.privacy.includes("⚠️");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
      {/* Planner checkbox */}
      {plannerMode && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggle(tool.id); }}
          whileTap={{ scale: 0.9 }}
          style={{
            flexShrink: 0, width: 28, height: 28, marginTop: 11,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: selected ? `${accent}20` : "transparent",
            border: `1.5px solid ${selected ? accent : "var(--border-bright)"}`,
            borderRadius: 6, cursor: "pointer",
            color: selected ? accent : "rgba(255,255,255,0.2)",
            fontSize: 13, transition: "all 0.15s",
          }}
          aria-label={selected ? `Deselect ${tool.name}` : `Select ${tool.name}`}
          aria-pressed={selected}
        >
          {selected && "✓"}
        </motion.button>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className="card-glow-container"
        onClick={() => setExpanded(!expanded)}
        onMouseMove={handleMouseMove}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
        style={{
          flex: 1,
          position: "relative",
          background: selected
            ? `${accent}08`
            : expanded
            ? "var(--surface-2)"
            : "var(--surface-1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${
            selected ? `${accent}40` : expanded ? `${accent}25` : "var(--border)"
          }`,
          borderLeft: tool.sponsored ? "2px solid #eab308" : undefined,
          borderRadius: 14,
          padding: "13px 15px",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (!expanded && !selected) {
            e.currentTarget.style.borderColor = `${accent}20`;
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!expanded && !selected) {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--surface-1)";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {/* Mouse glow overlay */}
        <div
          className="card-glow"
          style={{ "--accent-rgb": hexToRgb(accent) }}
        />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12.5, color: "var(--text-strong)" }}>
                {tool.name}
              </span>
              {tool.sponsored && (
                <span style={{
                  fontSize: 8, padding: "1.5px 5px",
                  background: "rgba(234,179,8,0.1)", color: "#eab308",
                  borderRadius: 3, fontFamily: "monospace", fontWeight: 700,
                  border: "1px solid rgba(234,179,8,0.2)",
                  display: "inline-block",
                }}>
                  {tool.sponsorLabel || "Sponsored"}
                </span>
              )}
              {tool.oss && (
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span className="oss-ring" style={{ position: "absolute" }} />
                  <span style={{
                    fontSize: 8, padding: "1.5px 5px",
                    background: "rgba(0,255,136,0.1)", color: "#00ff88",
                    borderRadius: 3, fontFamily: "monospace", fontWeight: 700,
                    border: "1px solid rgba(0,255,136,0.2)",
                    display: "inline-block",
                  }}>
                    OSS
                  </span>
                </span>
              )}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: "3px 0 0", lineHeight: 1.4 }}>
              {tool.desc}
            </p>
          </div>
          <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace", marginTop: 1, flexShrink: 0 }}>
            {expanded ? "−" : "+"}
          </span>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingTop: 10, marginTop: 8, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", fontSize: 11.5 }}>
                  <div>
                    <span style={{ color: "var(--text-faint)", fontSize: 8.5, fontFamily: "monospace", letterSpacing: 1 }}>FREE TIER</span>
                    <p style={{ color: "var(--text-default)", margin: "2px 0 0", lineHeight: 1.4 }}>{tool.free}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-faint)", fontSize: 8.5, fontFamily: "monospace", letterSpacing: 1 }}>COMPANY</span>
                    <p style={{ color: "var(--text-default)", margin: "2px 0 0" }}>{tool.company}</p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "var(--text-faint)", fontSize: 8.5, fontFamily: "monospace", letterSpacing: 1 }}>PRIVACY</span>
                    <p style={{ color: isPrivacyWarning ? "#ffab40" : "var(--text-default)", margin: "2px 0 0", lineHeight: 1.4 }}>
                      {tool.privacy}
                    </p>
                  </div>
                </div>

                {/* Tags + subcategory */}
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 9, padding: "2px 7px",
                    background: `${accent}15`, color: accent,
                    borderRadius: 4, fontFamily: "monospace",
                    border: `1px solid ${accent}25`,
                  }}>
                    {tool.subcategory}
                  </span>
                  {tool.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: 9, padding: "2px 6px",
                      background: "var(--surface-2)",
                      color: "var(--text-muted)",
                      borderRadius: 3, fontFamily: "monospace",
                      border: "1px solid var(--border)",
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Link */}
                <a
                  href={getToolUrl(tool)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { e.stopPropagation(); trackClick(tool); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    marginTop: 10, fontSize: 10, fontFamily: "monospace",
                    color: accent, textDecoration: "none",
                    padding: "4px 10px",
                    background: `${accent}10`,
                    border: `1px solid ${accent}25`,
                    borderRadius: 5, transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${accent}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${accent}10`; }}
                >
                  {tool.url} ↗
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
