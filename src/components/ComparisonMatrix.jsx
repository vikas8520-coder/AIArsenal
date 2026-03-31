"use client";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS } from "../data/tools";
import { getCategoryById } from "../data/categories";

const ROWS = [
  { key: "category", label: "CATEGORY" },
  { key: "subcategory", label: "SUBCATEGORY" },
  { key: "free", label: "FREE TIER" },
  { key: "company", label: "COMPANY" },
  { key: "oss", label: "OPEN SOURCE" },
  { key: "privacy", label: "PRIVACY" },
  { key: "tags", label: "TAGS" },
  { key: "desc", label: "DESCRIPTION" },
];

export default function ComparisonMatrix({ open, onClose, compareIds, accent = "#00f0ff" }) {
  const tools = compareIds.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 61,
              width: Math.min(tools.length * 220 + 140, 960),
              maxWidth: "95vw", maxHeight: "85vh",
              borderRadius: 14,
              background: "var(--surface-3)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--border-bright)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderBottom: "1px solid var(--border)",
            }}>
              <span style={{
                fontFamily: "monospace", fontSize: 11, fontWeight: 600,
                color: accent, letterSpacing: 1.5,
              }}>
                COMPARE ({tools.length} TOOLS)
              </span>
              <button
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "monospace", fontSize: 14, color: "var(--text-faint)",
                  padding: "2px 6px", lineHeight: 1,
                }}
              >
                x
              </button>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: "0" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontFamily: "monospace", fontSize: 11,
              }}>
                {/* Tool names header */}
                <thead>
                  <tr>
                    <th style={{
                      textAlign: "left", padding: "12px 14px",
                      color: "var(--text-faint)", fontSize: 9,
                      letterSpacing: 1, borderBottom: "1px solid var(--border)",
                      position: "sticky", top: 0, background: "var(--surface-3)",
                    }}>
                    </th>
                    {tools.map((tool) => {
                      const cat = getCategoryById(tool.category);
                      return (
                        <th key={tool.id} style={{
                          textAlign: "left", padding: "12px 14px",
                          borderBottom: "1px solid var(--border)",
                          position: "sticky", top: 0, background: "var(--surface-3)",
                        }}>
                          <div style={{ color: cat?.color || accent, fontWeight: 700, fontSize: 12 }}>
                            {tool.name}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key}>
                      <td style={{
                        padding: "10px 14px",
                        color: "var(--text-faint)", fontSize: 9,
                        letterSpacing: 1, fontWeight: 600,
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap", verticalAlign: "top",
                      }}>
                        {row.label}
                      </td>
                      {tools.map((tool) => {
                        let value = tool[row.key];
                        if (row.key === "oss") value = value ? "Yes ✓" : "No";
                        if (row.key === "tags") value = (value || []).map((t) => `#${t}`).join(", ");
                        return (
                          <td key={tool.id} style={{
                            padding: "10px 14px",
                            color: row.key === "oss" && tool.oss ? "#00ff88" : "var(--text-secondary)",
                            borderBottom: "1px solid var(--border)",
                            lineHeight: 1.5, verticalAlign: "top",
                            maxWidth: 220,
                          }}>
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
