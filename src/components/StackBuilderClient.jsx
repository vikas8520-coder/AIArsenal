"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { TOOLS } from "../data/tools";
import { CATEGORIES, getCategoryById } from "../data/categories";
import { getToolSlug } from "../lib/tools";
import { encodeCustomStack, decodeCustomStack } from "../utils/customStack";

const ACCENT = "#00f0ff";

const DEFAULT_ROLES = [
  "Coding assistant",
  "LLM API",
  "Chatbot",
  "Image generation",
  "Video generation",
  "Voice / TTS",
  "Vector database",
  "Agent framework",
  "Automation",
  "Observability",
  "Local runtime",
  "Custom role",
];

function getTool(id) {
  return TOOLS.find((t) => t.id === id) || null;
}

function ToolPicker({ onPick, excludedIds }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (excludedIds.has(t.id)) return false;
      if (activeCat !== "all" && t.category !== activeCat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }).slice(0, 30);
  }, [query, activeCat, excludedIds]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 206+ tools..."
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-bright)",
            borderRadius: 8,
            color: "var(--text-strong)",
            fontFamily: "monospace",
            fontSize: 12,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 10,
        }}
      >
        <CategoryPill
          id="all"
          label="All"
          active={activeCat === "all"}
          onClick={() => setActiveCat("all")}
        />
        {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
          <CategoryPill
            key={c.id}
            id={c.id}
            label={c.label}
            color={c.color}
            active={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
          />
        ))}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingRight: 4,
        }}
        className="no-scrollbar"
      >
        {filtered.length === 0 && (
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "var(--text-faint)",
              padding: 20,
              textAlign: "center",
            }}
          >
            No matches.
          </div>
        )}
        {filtered.map((tool) => {
          const cat = getCategoryById(tool.category);
          const color = cat?.color || ACCENT;
          return (
            <button
              key={tool.id}
              onClick={() => onPick(tool)}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--surface-1)";
              }}
            >
              <span
                style={{
                  color,
                  fontFamily: "monospace",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ◈
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--text-strong)",
                  }}
                >
                  {tool.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {tool.desc}
                </div>
              </div>
              <span
                style={{
                  fontSize: 16,
                  color,
                  alignSelf: "center",
                  fontFamily: "monospace",
                }}
              >
                +
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick, color = ACCENT }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "monospace",
        fontSize: 10,
        padding: "4px 9px",
        background: active ? `${color}18` : "var(--surface-1)",
        border: `1px solid ${active ? `${color}50` : "var(--border)"}`,
        color: active ? color : "var(--text-faint)",
        borderRadius: 4,
        cursor: "pointer",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </button>
  );
}

function RoleRow({ role, index, onEdit, onRemove, onMove, total }) {
  const tool = getTool(role.toolId);
  if (!tool) return null;
  const cat = getCategoryById(tool.category);
  const color = cat?.color || ACCENT;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "var(--text-faint)",
          flexShrink: 0,
          marginTop: 3,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          type="text"
          value={role.label}
          placeholder="Role (e.g. Coding assistant)"
          onChange={(e) => onEdit({ label: e.target.value })}
          list="role-labels"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            color: color,
            letterSpacing: 0.5,
            marginBottom: 2,
            padding: 0,
          }}
        />
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 12.5,
            color: "var(--text-strong)",
            fontWeight: 700,
          }}
        >
          {tool.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#10b981",
            fontFamily: "monospace",
            marginTop: 2,
          }}
        >
          {tool.free}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          title="Move up"
          style={{
            ...iconBtn,
            opacity: index === 0 ? 0.3 : 1,
            cursor: index === 0 ? "not-allowed" : "pointer",
          }}
        >
          ↑
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          title="Move down"
          style={{
            ...iconBtn,
            opacity: index === total - 1 ? 0.3 : 1,
            cursor: index === total - 1 ? "not-allowed" : "pointer",
          }}
        >
          ↓
        </button>
        <button
          onClick={onRemove}
          title="Remove"
          style={{
            ...iconBtn,
            color: "#f87171",
          }}
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

const iconBtn = {
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--text-faint)",
  borderRadius: 4,
  width: 22,
  height: 20,
  fontSize: 11,
  fontFamily: "monospace",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

export default function StackBuilderClient({ readOnly = false, initialEncoded = "" }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stack, setStack] = useState({
    name: "",
    description: "",
    roles: [],
  });
  const [savedStacks, setSavedStacks] = useState([]);
  const [copied, setCopied] = useState(null); // "share" | "embed" | null
  const [savedNote, setSavedNote] = useState(null);

  // Load from URL param on mount
  useEffect(() => {
    const fromProp = initialEncoded;
    const fromParam = searchParams?.get("s");
    const encoded = fromProp || fromParam;
    if (encoded) {
      const decoded = decodeCustomStack(encoded);
      if (decoded) setStack(decoded);
    }
  }, [initialEncoded, searchParams]);

  // Load saved stacks from localStorage
  useEffect(() => {
    if (readOnly) return;
    try {
      const raw = localStorage.getItem("aiarsenal-custom-stacks");
      if (raw) setSavedStacks(JSON.parse(raw));
    } catch {}
  }, [readOnly]);

  const addTool = useCallback((tool) => {
    setStack((s) => ({
      ...s,
      roles: [...s.roles, { label: "", toolId: tool.id }],
    }));
  }, []);

  const editRole = useCallback((index, updates) => {
    setStack((s) => ({
      ...s,
      roles: s.roles.map((r, i) => (i === index ? { ...r, ...updates } : r)),
    }));
  }, []);

  const removeRole = useCallback((index) => {
    setStack((s) => ({ ...s, roles: s.roles.filter((_, i) => i !== index) }));
  }, []);

  const moveRole = useCallback((index, delta) => {
    setStack((s) => {
      const next = [...s.roles];
      const target = index + delta;
      if (target < 0 || target >= next.length) return s;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...s, roles: next };
    });
  }, []);

  const excludedIds = useMemo(
    () => new Set(stack.roles.map((r) => r.toolId)),
    [stack.roles]
  );

  const encoded = useMemo(() => encodeCustomStack(stack), [stack]);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/build/view?s=${encoded}`
      : `/build/view?s=${encoded}`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied("share");
      setTimeout(() => setCopied(null), 1800);
      if (window.plausible) {
        window.plausible("Stack Shared", { props: { tools: stack.roles.length } });
      }
    });
  };

  const saveLocal = () => {
    if (!stack.name.trim() || stack.roles.length === 0) {
      setSavedNote("Name + at least one tool required");
      setTimeout(() => setSavedNote(null), 2500);
      return;
    }
    try {
      const filtered = savedStacks.filter((s) => s.name !== stack.name);
      const next = [
        { ...stack, savedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, 20);
      localStorage.setItem("aiarsenal-custom-stacks", JSON.stringify(next));
      setSavedStacks(next);
      setSavedNote(`Saved "${stack.name}"`);
      setTimeout(() => setSavedNote(null), 2500);
    } catch {
      setSavedNote("Save failed");
      setTimeout(() => setSavedNote(null), 2500);
    }
  };

  const loadSaved = (s) => {
    setStack(s);
  };

  const deleteSaved = (name) => {
    try {
      const next = savedStacks.filter((s) => s.name !== name);
      localStorage.setItem("aiarsenal-custom-stacks", JSON.stringify(next));
      setSavedStacks(next);
    } catch {}
  };

  const newStack = () => {
    setStack({ name: "", description: "", roles: [] });
  };

  if (readOnly) {
    return <ReadOnlyView stack={stack} />;
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <datalist id="role-labels">
        {DEFAULT_ROLES.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          flexShrink: 0,
        }}
      >
        <div>
          <Link
            href="/"
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "var(--text-faint)",
              textDecoration: "none",
            }}
          >
            ← AIArsenal
          </Link>
          <h1
            style={{
              margin: "4px 0 0",
              fontFamily: "monospace",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-strong)",
              letterSpacing: -0.3,
            }}
          >
            Build a <span style={{ color: ACCENT }}>custom stack</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={newStack}
            style={pillBtn("var(--text-faint)")}
          >
            NEW
          </button>
          <button
            onClick={saveLocal}
            disabled={!stack.name.trim() || stack.roles.length === 0}
            style={{
              ...pillBtn("#10b981"),
              opacity:
                !stack.name.trim() || stack.roles.length === 0 ? 0.5 : 1,
              cursor:
                !stack.name.trim() || stack.roles.length === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            ★ SAVE
          </button>
          <button
            onClick={copyShare}
            disabled={stack.roles.length === 0}
            style={{
              ...pillBtn(ACCENT, true),
              opacity: stack.roles.length === 0 ? 0.5 : 1,
              cursor: stack.roles.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {copied === "share" ? "✓ LINK COPIED" : "↗ SHARE"}
          </button>
          {stack.roles.length > 0 && (
            <a
              href={`/scaffold?s=${encoded}`}
              style={{
                ...pillBtn("#a855f7", true),
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              ⚡ SCAFFOLD
            </a>
          )}
        </div>
      </div>
      {savedNote && (
        <div
          style={{
            marginBottom: 10,
            padding: "6px 12px",
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--text-secondary)",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          {savedNote}
        </div>
      )}

      {/* Two-column layout */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
        }}
        className="builder-grid"
      >
        {/* LEFT — the stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            padding: 14,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}
        >
          <input
            type="text"
            value={stack.name}
            onChange={(e) => setStack((s) => ({ ...s, name: e.target.value }))}
            placeholder="Stack name (e.g. 'My AI writing stack')"
            style={{
              width: "100%",
              padding: "8px 0",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--border)",
              outline: "none",
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-strong)",
              boxSizing: "border-box",
              marginBottom: 6,
            }}
          />
          <input
            type="text"
            value={stack.description}
            onChange={(e) =>
              setStack((s) => ({ ...s, description: e.target.value }))
            }
            placeholder="One-line description (optional)"
            style={{
              width: "100%",
              padding: "6px 0",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "monospace",
              fontSize: 12,
              color: "var(--text-secondary)",
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />

          {stack.roles.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text-faint)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              <div>
                Pick tools from the right →
                <br />
                <span style={{ fontSize: 10 }}>
                  Each becomes a role in your stack
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minHeight: 0,
              }}
              className="no-scrollbar"
            >
              <AnimatePresence>
                {stack.roles.map((role, i) => (
                  <RoleRow
                    key={`${role.toolId}-${i}`}
                    role={role}
                    index={i}
                    total={stack.roles.length}
                    onEdit={(updates) => editRole(i, updates)}
                    onRemove={() => removeRole(i)}
                    onMove={(delta) => moveRole(i, delta)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Saved stacks */}
          {savedStacks.length > 0 && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 1.5,
                  color: "var(--text-faint)",
                  marginBottom: 6,
                }}
              >
                SAVED STACKS
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                {savedStacks.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                    }}
                  >
                    <button
                      onClick={() => loadSaved(s)}
                      style={{
                        padding: "4px 10px",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-secondary)",
                        fontFamily: "monospace",
                        fontSize: 10,
                        cursor: "pointer",
                      }}
                    >
                      {s.name}
                    </button>
                    <button
                      onClick={() => deleteSaved(s.name)}
                      style={{
                        padding: "4px 8px",
                        background: "transparent",
                        border: "none",
                        borderLeft: "1px solid var(--border)",
                        color: "#f87171",
                        fontFamily: "monospace",
                        fontSize: 10,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — tool picker */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            padding: 14,
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              letterSpacing: 1.5,
              color: "var(--text-faint)",
              marginBottom: 8,
            }}
          >
            ADD A TOOL
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ToolPicker onPick={addTool} excludedIds={excludedIds} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          .builder-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function pillBtn(color, primary = false) {
  return {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    padding: "8px 14px",
    background: primary ? color : "var(--surface-1)",
    color: primary ? "#000" : color,
    border: `1px solid ${color}${primary ? "" : "40"}`,
    borderRadius: 8,
    cursor: "pointer",
  };
}

function ReadOnlyView({ stack }) {
  if (!stack || stack.roles.length === 0) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "60px auto",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "monospace",
            fontSize: 22,
            color: "var(--text-strong)",
            margin: "0 0 12px",
          }}
        >
          Stack not found
        </h1>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          The shared link may be expired or malformed.
        </p>
        <Link
          href="/build"
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "10px 18px",
            background: ACCENT,
            color: "#000",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          BUILD YOUR OWN →
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "32px 24px 60px",
      }}
    >
      <Link
        href="/build"
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 20,
        }}
      >
        ← Build your own
      </Link>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: ACCENT,
            marginBottom: 8,
          }}
        >
          SHARED STACK
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -0.5,
          }}
        >
          {stack.name || "Untitled stack"}
        </h1>
        {stack.description && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.55,
            }}
          >
            {stack.description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stack.roles.map((role, i) => {
          const tool = getTool(role.toolId);
          if (!tool) {
            return (
              <div
                key={i}
                style={{
                  padding: 14,
                  border: "1px dashed var(--border)",
                  borderRadius: 10,
                  color: "var(--text-faint)",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              >
                {role.label || "Role"}: (tool no longer in catalog)
              </div>
            );
          }
          const cat = getCategoryById(tool.category);
          const color = cat?.color || ACCENT;
          return (
            <Link
              key={i}
              href={`/tools/${getToolSlug(tool)}`}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 16px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${color}`,
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "var(--text-faint)",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {role.label && (
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                      letterSpacing: 0.5,
                      marginBottom: 3,
                    }}
                  >
                    {role.label.toUpperCase()}
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-strong)",
                  }}
                >
                  {tool.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {tool.desc}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#10b981",
                    fontFamily: "monospace",
                    marginTop: 4,
                  }}
                >
                  {tool.free}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 32,
          padding: "20px 24px",
          background: `${ACCENT}08`,
          border: `1px solid ${ACCENT}25`,
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            fontFamily: "monospace",
            fontSize: 16,
            color: "var(--text-strong)",
          }}
        >
          Build your own stack
        </h2>
        <p
          style={{
            margin: "0 auto 14px",
            maxWidth: 480,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          Remix this stack or start from scratch. All 206+ tools at your
          fingertips.
        </p>
        <Link
          href={`/build?s=${encodeCustomStack(stack)}`}
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: ACCENT,
            color: "#000",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          REMIX THIS STACK →
        </Link>
      </div>
    </div>
  );
}
