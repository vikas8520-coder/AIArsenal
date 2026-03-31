"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS } from "../data/tools";
import { CATEGORIES, getCategoryById } from "../data/categories";
import { searchTools } from "../hooks/useSearch";

// Max 5 recent searches stored in localStorage
const RECENTS_KEY = "nexus-recent-searches";
function loadRecents() {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]"); } catch { return []; }
}
function saveRecent(term) {
  if (!term.trim()) return;
  try {
    const prev = loadRecents().filter((r) => r !== term);
    localStorage.setItem(RECENTS_KEY, JSON.stringify([term, ...prev].slice(0, 5)));
  } catch {}
}

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(0,240,255,0.2)", color: "var(--accent)", borderRadius: 2, padding: 0 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function CommandPalette({ open, onClose, onSelectCategory, onSelectTool }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [recents, setRecents] = useState(loadRecents);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const q = query.trim().toLowerCase();

  // Category shortcuts — "/" prefix
  const matchedCats = q.startsWith("/")
    ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(q.slice(1)))
    : [];

  // Tool results — use shared ranked search
  const matchedTools = q && !q.startsWith("/")
    ? searchTools(TOOLS, query).slice(0, 18)
    : TOOLS.slice(0, 12);

  const allResults = q.startsWith("/") ? matchedCats : matchedTools;
  const isCategory = q.startsWith("/");

  // Reset on open, reload recents in case they changed
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setRecents(loadRecents());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = allResults[selected];
        if (!item) return;
        if (isCategory) {
          onSelectCategory(item.id);
        } else {
          saveRecent(query.trim());
          setRecents(loadRecents());
          onSelectTool(item);
        }
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selected, allResults, isCategory, query, onSelectCategory, onSelectTool, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selected];
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  // Reset selected on query change
  useEffect(() => setSelected(0), [query]);

  const accentForTool = (tool) => getCategoryById(tool.category)?.color || "#00f0ff";

  const handleSelect = (item) => {
    if (isCategory) {
      onSelectCategory(item.id);
    } else {
      saveRecent(query.trim());
      setRecents(loadRecents());
      onSelectTool(item);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              zIndex: 100,
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed",
              top: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(640px, 92vw)",
              zIndex: 101,
              borderRadius: 16,
              overflow: "hidden",
              background: "var(--surface-3)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--border-bright)",
              boxShadow: "0 0 0 1px rgba(0,240,255,0.1), 0 40px 100px rgba(0,0,0,0.4)",
            }}
          >
            {/* Search input */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 15, color: "var(--text-faint)" }}>⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, or type / for categories…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "var(--text-strong)", fontSize: 14, fontFamily: "monospace",
                  caretColor: "var(--accent)",
                }}
                aria-label="Search tools"
                role="combobox"
                aria-expanded={true}
                aria-autocomplete="list"
              />
              <kbd style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border-bright)", borderRadius: 4, padding: "2px 6px" }}>
                ESC
              </kbd>
            </div>

            {/* Hint chips + recent searches (shown when empty) */}
            {!q && (
              <div style={{ borderBottom: "1px solid var(--border)" }}>
                {/* Category shortcut chips */}
                <div style={{ display: "flex", gap: 6, padding: "8px 18px 6px", flexWrap: "wrap", alignItems: "center" }}>
                  {["/dev", "/creative", "/income", "/agents"].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setQuery(chip)}
                      style={{
                        fontSize: 10, fontFamily: "monospace",
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: 4, color: "var(--text-muted)",
                        padding: "3px 8px", cursor: "pointer", transition: "all 0.12s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "rgba(0,240,255,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                    >
                      {chip}
                    </button>
                  ))}
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", padding: "3px 0" }}>
                    / for categories · multi-word search supported
                  </span>
                </div>

                {/* Recent searches */}
                {recents.length > 0 && (
                  <div style={{ padding: "4px 18px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", letterSpacing: 1 }}>
                        RECENT
                      </span>
                      <button
                        onClick={() => {
                          try { localStorage.removeItem(RECENTS_KEY); } catch {}
                          setRecents([]);
                        }}
                        style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-faint)"}
                      >
                        clear
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {recents.map((r) => (
                        <button
                          key={r}
                          onClick={() => setQuery(r)}
                          style={{
                            fontSize: 10, fontFamily: "monospace",
                            background: "var(--surface-1)", border: "1px solid var(--border)",
                            borderRadius: 4, color: "var(--text-secondary)",
                            padding: "3px 9px", cursor: "pointer", transition: "all 0.12s",
                            display: "flex", alignItems: "center", gap: 4,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "rgba(0,240,255,0.25)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                        >
                          <span style={{ opacity: 0.5 }}>↺</span> {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            <div
              ref={listRef}
              role="listbox"
              style={{ maxHeight: 360, overflowY: "auto" }}
              className="no-scrollbar"
            >
              {allResults.length === 0 && q && (
                <div style={{ padding: "28px 18px", textAlign: "center", color: "var(--text-faint)", fontFamily: "monospace", fontSize: 12 }}>
                  No results for "{q}"
                </div>
              )}

              {allResults.map((item, i) => {
                const isCat = isCategory;
                const accent = isCat ? item.color : accentForTool(item);
                // Show first matching term for the "matched in" badge
                const firstTerm = q.split(/\s+/)[0] || "";

                return (
                  <motion.button
                    key={item.id}
                    role="option"
                    aria-selected={i === selected}
                    onClick={() => handleSelect(item)}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.2) }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 18px", background: i === selected ? "var(--surface-2)" : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    {/* Icon */}
                    <span style={{ fontSize: 13, fontFamily: "monospace", color: accent, flexShrink: 0 }}>
                      {isCat ? item.icon : "◈"}
                    </span>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontFamily: "monospace", fontWeight: 600, color: "var(--text-strong)", marginBottom: 2 }}>
                        {highlightMatch(isCat ? item.label : item.name, isCat ? q.slice(1) : firstTerm)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isCat ? item.desc : item.desc}
                      </div>
                    </div>

                    {/* Right badges */}
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      {!isCat && (
                        <span style={{
                          fontSize: 9, fontFamily: "monospace",
                          background: `${accent}15`, color: accent,
                          border: `1px solid ${accent}25`,
                          borderRadius: 3, padding: "1px 6px",
                        }}>
                          {item.category.split(" ")[0]}
                        </span>
                      )}
                      {!isCat && item.oss && (
                        <span style={{
                          fontSize: 9, fontFamily: "monospace",
                          background: "rgba(0,255,136,0.1)", color: "#00ff88",
                          border: "1px solid rgba(0,255,136,0.2)",
                          borderRadius: 3, padding: "1px 6px",
                        }}>
                          OSS
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: "8px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)" }}>
                {q ? `${allResults.length} result${allResults.length !== 1 ? "s" : ""}` : "216 tools"}
              </span>
              <div style={{ display: "flex", gap: 10, fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)" }}>
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
