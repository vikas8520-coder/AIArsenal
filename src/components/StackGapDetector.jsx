"use client";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectStackGaps } from "../data/stack-patterns";
import { TOOLS } from "../data/tools";
import { getCategoryById } from "../data/categories";

const ACCENT = "#eab308";

/**
 * Dismissible banner inside /build that analyzes the current stack
 * composition and surfaces likely missing roles.
 */
export default function StackGapDetector({ stack, onPickTool }) {
  const [dismissedKey, setDismissedKey] = useState(null);

  const toolIds = useMemo(
    () => (stack?.roles || []).map((r) => r.toolId).filter(Boolean),
    [stack]
  );

  const gaps = useMemo(() => detectStackGaps(toolIds, TOOLS), [toolIds]);

  // Dismissal persists across the session per unique pattern+gap set.
  const gapKey = useMemo(() => {
    if (!gaps) return null;
    return (
      gaps.pattern.slug +
      ":" +
      gaps.missing.map((m) => m.key).join(",")
    );
  }, [gaps]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const d = sessionStorage.getItem("aiarsenal-gap-dismissed");
      if (d) setDismissedKey(d);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setDismissedKey(gapKey);
    try {
      sessionStorage.setItem("aiarsenal-gap-dismissed", gapKey || "");
    } catch {}
  };

  if (!gaps) return null;
  if (gapKey === dismissedKey) return null;
  if (toolIds.length < 2) return null; // need minimum signal

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3 }}
        style={{
          marginBottom: 12,
          padding: "12px 14px",
          background: `${ACCENT}08`,
          border: `1px solid ${ACCENT}30`,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1.5,
                color: ACCENT,
                marginBottom: 4,
              }}
            >
              ◈ SMART DETECTION · {gaps.filledCount}/{gaps.totalCount} ROLES FILLED
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 12.5,
                color: "var(--text-strong)",
                fontWeight: 700,
              }}
            >
              Looks like a {gaps.pattern.label} build
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "var(--text-secondary)",
                marginTop: 2,
                lineHeight: 1.5,
              }}
            >
              {gaps.missing.length === 1
                ? `Consider adding a ${gaps.missing[0].label.toLowerCase()}.`
                : `Consider adding: ${gaps.missing.map((m) => m.label.toLowerCase()).join(", ")}.`}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-faint)",
              fontSize: 14,
              cursor: "pointer",
              lineHeight: 1,
              padding: "2px 6px",
            }}
          >
            ×
          </button>
        </div>

        {/* Missing role + suggestions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {gaps.missing.slice(0, 2).map((role) => (
            <div key={role.key}>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  color: "var(--text-faint)",
                  marginBottom: 4,
                }}
              >
                MISSING · {role.label.toUpperCase()}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {role.suggestIds.map((id) => {
                  const tool = TOOLS.find((t) => t.id === id);
                  if (!tool) return null;
                  const cat = getCategoryById(tool.category);
                  const color = cat?.color || ACCENT;
                  return (
                    <button
                      key={id}
                      onClick={() => onPickTool?.(tool, role.label)}
                      style={{
                        fontSize: 10.5,
                        fontFamily: "monospace",
                        padding: "4px 10px",
                        background: "var(--surface-1)",
                        border: `1px solid ${color}35`,
                        color,
                        borderRadius: 5,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      + {tool.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
