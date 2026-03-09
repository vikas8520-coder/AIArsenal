import { motion, AnimatePresence } from "framer-motion";
import { getCategoryById } from "../data/categories";

export default function MyStack({ open, onClose, bookmarkedTools, onToggleBookmark, onExport, onClear, accent = "#00f0ff" }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              zIndex: 61,
              width: 380, maxWidth: "90vw",
              background: "var(--surface-3)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--border-bright)",
              borderRight: "none",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column",
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
                MY STACK ({bookmarkedTools.length})
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

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              {bookmarkedTools.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>☆</div>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
                    No tools bookmarked yet.
                  </span>
                  <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-ghost)", marginTop: 6 }}>
                    Click the star on any tool card to add it here.
                  </p>
                </div>
              ) : (
                bookmarkedTools.map((tool) => {
                  const cat = getCategoryById(tool.category);
                  const toolAccent = cat?.color || "#00f0ff";
                  return (
                    <motion.div
                      key={tool.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", marginBottom: 6,
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            fontFamily: "monospace", fontWeight: 700, fontSize: 11.5,
                            color: "var(--text-strong)",
                          }}>
                            {tool.name}
                          </span>
                          <span style={{
                            fontSize: 8, padding: "1px 5px",
                            background: `${toolAccent}15`, color: toolAccent,
                            borderRadius: 3, fontFamily: "monospace",
                            border: `1px solid ${toolAccent}25`,
                          }}>
                            {tool.subcategory}
                          </span>
                        </div>
                        <p style={{
                          fontSize: 10, color: "var(--text-faint)", margin: "2px 0 0",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {tool.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => onToggleBookmark(tool.id)}
                        title="Remove from stack"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 14, color: "#eab308", padding: "2px 4px",
                          flexShrink: 0,
                        }}
                      >
                        ★
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {bookmarkedTools.length > 0 && (
              <div style={{
                display: "flex", gap: 8, padding: "12px 16px",
                borderTop: "1px solid var(--border)",
              }}>
                <button
                  onClick={() => {
                    const md = onExport();
                    navigator.clipboard.writeText(md).catch(() => {});
                  }}
                  style={{
                    flex: 1, fontFamily: "monospace", fontSize: 10,
                    background: `${accent}20`, color: accent,
                    border: `1px solid ${accent}35`,
                    borderRadius: 7, padding: "8px 12px", cursor: "pointer",
                  }}
                >
                  Export Markdown
                </button>
                <button
                  onClick={onClear}
                  style={{
                    fontFamily: "monospace", fontSize: 10,
                    background: "rgba(255,107,107,0.1)", color: "#ff6b6b",
                    border: "1px solid rgba(255,107,107,0.25)",
                    borderRadius: 7, padding: "8px 12px", cursor: "pointer",
                  }}
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
