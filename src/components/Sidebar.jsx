import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "../data/categories";

const SHORTCUTS = [
  { key: "1–9", action: "Jump to category" },
  { key: "⌘K", action: "Command palette" },
  { key: "↑↓", action: "Navigate results" },
  { key: "Enter", action: "Open tool" },
  { key: "Esc", action: "Close / back" },
  { key: "?", action: "Show shortcuts" },
  { key: "O", action: "Toggle OSS filter" },
];

function ShortcutOverlay({ onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--surface-3)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--border-bright)",
            borderRadius: 16,
            padding: "28px 32px",
            minWidth: 340,
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 16 }}>
            KEYBOARD SHORTCUTS
          </div>
          {SHORTCUTS.map(({ key, action }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, background: "var(--surface-2)", border: "1px solid var(--border-bright)", borderRadius: 4, padding: "2px 8px", color: "var(--accent)" }}>
                {key}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{action}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 14, textAlign: "center", fontFamily: "monospace" }}>
            Press Esc or click outside to close
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Sidebar({ activeCat, onSelect, toolCounts }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelect = (id) => {
    onSelect(id);
    if (isMobile) setMobileOpen(false);
  };

  // Keyboard nav: 1–9 for categories, ? for shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "?") { setShowShortcuts(true); return; }
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 1 && n <= 9) {
        const cat = CATEGORIES[n - 1];
        if (cat) onSelect(cat.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSelect]);

  return (
    <>
      {showShortcuts && <ShortcutOverlay onClose={() => setShowShortcuts(false)} />}

      {/* Mobile hamburger button */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 51,
            background: "var(--surface-3)", border: "1px solid var(--border-bright)",
            borderRadius: 8, padding: "8px 10px", cursor: "pointer",
            color: "var(--text-strong)", fontSize: 16, lineHeight: 1,
            backdropFilter: "blur(12px)",
          }}
        >
          ☰
        </button>
      )}

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.nav
        aria-label="Categories"
        animate={{ width: isMobile ? 210 : (collapsed ? 52 : 210) }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className={isMobile ? "sidebar-mobile-overlay" : ""}
        style={{
          flexShrink: 0,
          height: "100vh",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          background: isMobile ? "var(--bg)" : "var(--surface-1)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border)",
          display: isMobile && !mobileOpen ? "none" : "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: isMobile ? 50 : 10,
        }}
      >
        {/* Top bar */}
        <div style={{ padding: "14px 10px 10px", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", borderBottom: "1px solid var(--border)" }}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: 2 }}
            >
              CATEGORIES
            </motion.span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: 6, borderRadius: 6, color: "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-strong)"}
            onMouseLeave={e => e.currentTarget.style.color = ""}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d={collapsed ? "M5 2l5 5-5 5" : "M9 2l-5 5 5 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Category list */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 6px" }} className="no-scrollbar">
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeCat === cat.id;
            const count = toolCounts[cat.id] ?? 0;

            return (
              <motion.button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                title={collapsed ? `${cat.label} (${idx + 1})` : undefined}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: collapsed ? "9px 0" : "8px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: isActive ? `${cat.color}12` : "transparent",
                  border: isActive ? `1px solid ${cat.color}30` : "1px solid transparent",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 2,
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--surface-2)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
                aria-pressed={isActive}
                aria-label={`${cat.label} — ${count} tools`}
              >
                {/* Icon */}
                <span style={{
                  fontSize: 14,
                  color: isActive ? cat.color : "var(--text-muted)",
                  flexShrink: 0,
                  transition: "color 0.15s",
                  fontFamily: "monospace",
                }}>
                  {cat.icon}
                </span>

                {/* Label + count */}
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0 }}
                  >
                    <span style={{
                      fontSize: 11.5,
                      fontFamily: "monospace",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? cat.color : "var(--text-secondary)",
                      transition: "color 0.15s",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {cat.label}
                    </span>
                    <span style={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      color: isActive ? cat.color : "var(--text-faint)",
                      background: isActive ? `${cat.color}15` : "transparent",
                      padding: "1px 5px",
                      borderRadius: 3,
                      flexShrink: 0,
                      marginLeft: 4,
                    }}>
                      {count}
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom: shortcuts hint */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "10px 16px 16px", borderTop: "1px solid var(--border)" }}
          >
            <button
              onClick={() => setShowShortcuts(true)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text-faint)", fontSize: 10,
                fontFamily: "monospace", letterSpacing: 1,
                display: "flex", alignItems: "center", gap: 6,
                padding: 0, transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary)"}
              onMouseLeave={e => e.currentTarget.style.color = ""}
            >
              <span style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)", borderRadius: 3, padding: "1px 5px" }}>?</span>
              SHORTCUTS
            </button>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
}
