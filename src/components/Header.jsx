import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { STATS } from "../data/tools";

const TYPEWRITER_PHRASES = [
  "Search 215+ tools...",
  "Try: local llm...",
  "Try: free gpu compute...",
  "Try: rlhf income...",
  "Try: personal ai daemon...",
  "Try: vector database...",
];

function AnimatedCounter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <>{val}</>;
}

function TypewriterSearch({ value, onChange, accent }) {
  const [placeholder, setPlaceholder] = useState("");
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    if (value) return; // Don't animate when user is typing

    const tick = () => {
      const phrase = TYPEWRITER_PHRASES[phraseIdx.current];
      if (!deleting.current) {
        if (charIdx.current < phrase.length) {
          charIdx.current++;
          setPlaceholder(phrase.slice(0, charIdx.current));
          return setTimeout(tick, 55);
        }
        deleting.current = true;
        return setTimeout(tick, 1800);
      } else {
        if (charIdx.current > 0) {
          charIdx.current--;
          setPlaceholder(phrase.slice(0, charIdx.current));
          return setTimeout(tick, 30);
        }
        deleting.current = false;
        phraseIdx.current = (phraseIdx.current + 1) % TYPEWRITER_PHRASES.length;
        return setTimeout(tick, 400);
      }
    };
    const t = setTimeout(tick, 800);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <span style={{
        position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
        fontSize: 13, color: accent, opacity: 0.5,
      }}>⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tools"
        role="searchbox"
        style={{
          width: "100%", padding: "10px 14px 10px 36px",
          background: "var(--surface-1)",
          border: "1px solid var(--border-bright)",
          borderRadius: 10, color: "var(--text-strong)", fontSize: 13,
          fontFamily: "monospace", outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxSizing: "border-box",
        }}
        onFocus={e => {
          e.target.style.borderColor = `${accent}40`;
          e.target.style.boxShadow = `0 0 0 3px ${accent}10`;
        }}
        onBlur={e => {
          e.target.style.borderColor = "var(--border-bright)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export default function Header({
  search, onSearch, filterOSS, onToggleOSS,
  sortBy, onSort, plannerMode, onTogglePlanner,
  issueMode, onToggleIssue, onToggleSubmit,
  accent, onOpenPalette, resultCount, theme, onToggleTheme,
}) {
  const [booted, setBooted] = useState(() => {
    try { return !!localStorage.getItem("nexus-booted"); } catch { return false; }
  });
  const [showTitle, setShowTitle] = useState(booted);
  const [showStats, setShowStats] = useState(booted);

  useEffect(() => {
    if (booted) return;
    const t1 = setTimeout(() => setShowTitle(true), 200);
    const t2 = setTimeout(() => {
      setShowStats(true);
      try { localStorage.setItem("nexus-booted", "1"); } catch {}
    }, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <header style={{
      padding: "18px 24px 14px",
      borderBottom: "1px solid var(--border)",
      background: theme === "light" ? "rgba(240,244,248,0.8)" : "rgba(10,10,10,0.7)",
      backdropFilter: "blur(20px)",
      position: "sticky", top: 0, zIndex: 20,
    }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        {showTitle && (
          <motion.div
            initial={booted ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", alignItems: "baseline", gap: 10 }}
          >
            <h1 style={{
              margin: 0, fontFamily: "monospace", fontWeight: 700,
              fontSize: "clamp(16px, 2.5vw, 22px)", color: "var(--text-strong)",
              letterSpacing: -0.5,
            }}>
              AI<span style={{ color: accent }}>Arsenal</span>
            </h1>
            <span style={{
              fontSize: 9, fontFamily: "monospace",
              color: "var(--text-faint)", letterSpacing: 1,
              border: "1px solid var(--border)",
              borderRadius: 3, padding: "1px 6px",
            }}>
              v2.0
            </span>
          </motion.div>
        )}

        {/* Stats bar */}
        {showStats && (
          <motion.div
            initial={booted ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ display: "flex", gap: 14, alignItems: "center" }}
          >
            <StatChip
              value={<AnimatedCounter target={STATS.total} duration={1000} />}
              label="tools" color={accent}
            />
            <StatChip
              value={<AnimatedCounter target={STATS.oss} duration={900} />}
              label="OSS" color="#00ff88"
            />
            <StatChip value={STATS.freeCredits} label="credits" color="#eab308" />
          </motion.div>
        )}
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <TypewriterSearch value={search} onChange={onSearch} accent={accent} />

        {/* ⌘K pill */}
        <button
          onClick={onOpenPalette}
          title="Command palette (⌘K)"
          style={{
            fontFamily: "monospace", fontSize: 10,
            background: "var(--surface-1)", border: "1px solid var(--border-bright)",
            borderRadius: 7, padding: "9px 12px", cursor: "pointer",
            color: "var(--text-muted)", transition: "all 0.15s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = `${accent}40`; }}
          onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
        >
          ⌘K
        </button>

        {/* Theme toggle — sun/moon */}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} accent={accent} />

        {/* OSS filter */}
        <OSSToggle active={filterOSS} onToggle={onToggleOSS} accent={accent} />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => onSort(e.target.value)}
          aria-label="Sort tools by"
          style={{
            background: "var(--surface-1)", border: "1px solid var(--border-bright)",
            borderRadius: 8, color: "var(--text-secondary)", fontSize: 11,
            fontFamily: "monospace", padding: "8px 10px", cursor: "pointer", outline: "none",
          }}
        >
          <option value="name">A–Z</option>
          <option value="category">Category</option>
          <option value="company">Company</option>
        </select>

        {/* Planner mode */}
        <button
          onClick={onTogglePlanner}
          style={{
            fontFamily: "monospace", fontSize: 10,
            background: plannerMode ? `${accent}20` : "var(--surface-1)",
            border: `1px solid ${plannerMode ? accent + "40" : "var(--border-bright)"}`,
            borderRadius: 7, padding: "8px 13px", cursor: "pointer",
            color: plannerMode ? accent : "var(--text-muted)",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}
        >
          {plannerMode ? "✓ PLANNER" : "AI PLANNER"}
        </button>

        {/* Issue Solver */}
        <button
          onClick={onToggleIssue}
          style={{
            fontFamily: "monospace", fontSize: 10,
            background: issueMode ? `${accent}20` : "var(--surface-1)",
            border: `1px solid ${issueMode ? accent + "40" : "var(--border-bright)"}`,
            borderRadius: 7, padding: "8px 13px", cursor: "pointer",
            color: issueMode ? accent : "var(--text-muted)",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}
        >
          {issueMode ? "✓ SOLVER" : "◈ SOLVE"}
        </button>

        {/* Submit Tool */}
        <button
          onClick={onToggleSubmit}
          style={{
            fontFamily: "monospace", fontSize: 10,
            background: "var(--surface-1)",
            border: "1px solid var(--border-bright)",
            borderRadius: 7, padding: "8px 13px", cursor: "pointer",
            color: "var(--text-muted)",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = `${accent}40`; }}
          onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
        >
          + SUBMIT
        </button>

        {/* Result count */}
        {resultCount !== undefined && (
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
            {resultCount} results
          </span>
        )}
      </div>
    </header>
  );
}

function StatChip({ value, label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color }}>{value}</span>
      <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: 1 }}>{label}</span>
    </div>
  );
}

function ThemeToggle({ theme, onToggle, accent }) {
  const isLight = theme === "light";
  return (
    <motion.button
      onClick={onToggle}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      whileTap={{ scale: 0.85 }}
      style={{
        fontFamily: "monospace", fontSize: 14,
        background: isLight ? `${accent}18` : "rgba(255,255,255,0.22)",
        border: `1px solid ${isLight ? accent + "40" : "rgba(255,255,255,0.5)"}`,
        borderRadius: 8, padding: "6px 10px", cursor: "pointer",
        color: isLight ? accent : "#ffffff",
        transition: "background 0.2s, border-color 0.2s, color 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1,
      }}
    >
      <motion.span
        key={isLight ? "sun" : "moon"}
        initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
        transition={{ duration: 0.2 }}
        style={{ display: "block" }}
      >
        {isLight ? "☀" : "☽"}
      </motion.span>
    </motion.button>
  );
}

function OSSToggle({ active, onToggle, accent }) {
  const containerRef = useRef(null);

  const handleToggle = () => {
    onToggle();
    if (active) return; // Only burst when turning ON
    // Confetti burst
    const container = containerRef.current;
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("div");
      el.className = "confetti-particle";
      const angle = (i / 12) * Math.PI * 2;
      const dist = 24 + Math.random() * 20;
      el.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
      el.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
      el.style.background = ["#00ff88", "#00f0ff", "#b388ff"][i % 3];
      container.appendChild(el);
      setTimeout(() => el.remove(), 700);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={handleToggle}
        style={{
          fontFamily: "monospace", fontSize: 10,
          background: active ? "rgba(0,255,136,0.12)" : "var(--surface-1)",
          border: `1px solid ${active ? "rgba(0,255,136,0.4)" : "var(--border-bright)"}`,
          borderRadius: 7, padding: "8px 12px", cursor: "pointer",
          color: active ? "#00ff88" : "var(--text-muted)",
          transition: "all 0.15s",
        }}
      >
        {active ? "● OSS" : "○ OSS"}
      </button>
    </div>
  );
}
