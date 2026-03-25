import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { STATS } from "../data/tools";
import SmartSearch from "./SmartSearch";

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
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <>{val}</>;
}

export default function Header({
  search, onSearch, filterOSS, onToggleOSS,
  sortBy, onSort, onToggleSubmit,
  accent, onOpenPalette, resultCount, theme, onToggleTheme,
  onSelectTool, tools, selected, onSelectStack,
  onSelectCategory,
  bookmarkCount, onOpenStack,
  onOpenShare, hasSelected,
  onOpenCalc,
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

  const pillStyle = {
    fontFamily: "monospace", fontSize: 10,
    background: "var(--surface-1)", border: "1px solid var(--border-bright)",
    borderRadius: 7, padding: "9px 12px", cursor: "pointer",
    color: "var(--text-muted)", transition: "all 0.15s", whiteSpace: "nowrap",
  };

  const hoverOn = (e) => { e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = `${accent}40`; };
  const hoverOff = (e) => { e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; };

  return (
    <header className="header-mobile" style={{
      padding: "18px 24px 14px",
      borderBottom: "1px solid var(--border)",
      background: theme === "light" ? "rgba(240,244,248,0.8)" : "rgba(10,10,10,0.7)",
      backdropFilter: "blur(20px)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      {/* Title row */}
      <div className="header-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        {showTitle && (
          <motion.div
            initial={booted ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 10, overflow: "hidden",
              flexShrink: 0,
            }}>
              <img
                src="/logo.png"
                alt="AIArsenal"
                style={{ width: 56, height: 56, marginTop: -7, marginLeft: -7, display: "block" }}
              />
            </div>
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
      <div className="header-controls" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <SmartSearch
          value={search}
          onChange={onSearch}
          accent={accent}
          onSelectTool={onSelectTool}
          tools={tools}
          selected={selected}
          onSelectStack={onSelectStack}
          filterOSS={filterOSS}
          onToggleOSS={onToggleOSS}
          onSelectCategory={onSelectCategory}
        />

        {/* ⌘K pill */}
        <button
          onClick={onOpenPalette}
          title="Command palette (⌘K)"
          className="hide-mobile"
          style={pillStyle}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          ⌘K
        </button>

        {/* My Stack */}
        <button
          onClick={onOpenStack}
          title="My saved tools"
          className="hide-mobile"
          style={{
            ...pillStyle,
            color: bookmarkCount > 0 ? "#eab308" : "var(--text-muted)",
            borderColor: bookmarkCount > 0 ? "rgba(234,179,8,0.25)" : "var(--border-bright)",
          }}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          ★ STACK{bookmarkCount > 0 ? ` (${bookmarkCount})` : ""}
        </button>

        {/* Share — only when tools are selected */}
        {hasSelected && (
          <button
            onClick={onOpenShare}
            className="hide-mobile"
            style={pillStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            SHARE
          </button>
        )}

        {/* Budget */}
        <button
          onClick={onOpenCalc}
          title="Budget calculator"
          className="hide-mobile"
          style={pillStyle}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          BUDGET
        </button>

        {/* Theme toggle */}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} accent={accent} />

        {/* OSS filter */}
        <OSSToggle active={filterOSS} onToggle={onToggleOSS} accent={accent} />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => onSort(e.target.value)}
          aria-label="Sort tools by"
          className="hide-mobile"
          style={{
            background: "var(--surface-1)", border: "1px solid var(--border-bright)",
            borderRadius: 8, color: "var(--text-secondary)", fontSize: 11,
            fontFamily: "monospace", padding: "8px 10px", cursor: "pointer", outline: "none",
          }}
        >
          <option value="name">A–Z</option>
          <option value="newest">Newest</option>
          <option value="category">Category</option>
          <option value="company">Company</option>
        </select>

        {/* Submit Tool */}
        <button
          onClick={onToggleSubmit}
          className="hide-mobile"
          style={pillStyle}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          + SUBMIT
        </button>

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="hide-mobile" style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
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
    if (active) return;
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
