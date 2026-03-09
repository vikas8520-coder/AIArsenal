import { useState, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TOOLS } from "./data/tools";
import { searchTools } from "./hooks/useSearch";
import { CATEGORIES, getCategoryById } from "./data/categories";
import useBookmarks from "./hooks/useBookmarks";
import { decodeStack } from "./utils/stackUrl";
import AmbientBackground from "./components/AmbientBackground";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ToolCard, { SkeletonCard } from "./components/ToolCard";
import CommandPalette from "./components/CommandPalette";
import CategoryHero from "./components/CategoryHero";
import Spotlight from "./components/Spotlight";
import EmptyState from "./components/EmptyState";
import EmailCapture from "./components/EmailCapture";
import FeedbackWidget from "./components/FeedbackWidget";
import ToolSubmitForm from "./components/ToolSubmitForm";
import MyStack from "./components/MyStack";
import ComparisonMatrix from "./components/ComparisonMatrix";
import SharePanel from "./components/SharePanel";
import CostCalculator from "./components/CostCalculator";

// Group tools by subcategory, sponsored tools float to top
function groupBySubcategory(tools) {
  const map = new Map();
  tools.forEach((t) => {
    if (!map.has(t.subcategory)) map.set(t.subcategory, []);
    map.get(t.subcategory).push(t);
  });
  for (const [key, list] of map) {
    map.set(key, list.sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0)));
  }
  return map;
}

export default function App() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [filterOSS, setFilterOSS] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selected, setSelected] = useState(new Set());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("nexus-theme") || "dark"; } catch { return "dark"; }
  });

  // New feature state
  const [stackOpen, setStackOpen] = useState(false);
  const [compareSet, setCompareSet] = useState(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // Bookmarks hook
  const { bookmarks, toggle: toggleBookmark, isBookmarked, count: bookmarkCount, bookmarkedTools, exportMarkdown, clearAll: clearBookmarks } = useBookmarks();

  // Derive active category object
  const activeCatObj = getCategoryById(activeCat);

  // Restore shared stack from URL hash on mount
  useEffect(() => {
    const ids = decodeStack(window.location.hash);
    if (ids.length > 0) {
      const validIds = ids.filter((id) => TOOLS.some((t) => t.id === id));
      if (validIds.length > 0) {
        setSelected(new Set(validIds));
      }
    }
  }, []);

  // Apply data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("nexus-theme", theme); } catch {}
  }, [theme]);

  // Update CSS accent variable when category changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", activeCatObj.color);
    const hex = activeCatObj.color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
    root.style.setProperty("--accent-dim", `rgba(${r},${g},${b},0.1)`);
    root.style.setProperty("--accent-border", `rgba(${r},${g},${b},0.25)`);
    root.style.setProperty("--orb1", activeCatObj.orb1);
    root.style.setProperty("--orb2", activeCatObj.orb2);
  }, [activeCatObj]);

  // ⌘K global shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "o" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        setFilterOSS((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = activeCat === "all" ? TOOLS : TOOLS.filter((t) => t.category === activeCat);
    if (filterOSS) list = list.filter((t) => t.oss);
    if (search.trim()) {
      list = searchTools(list, search);
    } else {
      if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      else if (sortBy === "category") list = [...list].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
      else if (sortBy === "company") list = [...list].sort((a, b) => a.company.localeCompare(b.company));
      else if (sortBy === "newest") list = [...list].sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""));
    }
    return list;
  }, [activeCat, filterOSS, search, sortBy]);

  // Recently added tools (top 8 by date)
  const recentTools = useMemo(() => {
    return [...TOOLS]
      .sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""))
      .slice(0, 8);
  }, []);

  // Tool counts per category for sidebar
  const toolCounts = useMemo(() => {
    const map = {};
    map["all"] = TOOLS.length;
    CATEGORIES.forEach((c) => {
      if (c.id !== "all") {
        let list = TOOLS.filter((t) => t.category === c.id);
        if (filterOSS) list = list.filter((t) => t.oss);
        map[c.id] = list.length;
      }
    });
    return map;
  }, [filterOSS]);

  // Toggle tool selection
  const toggleTool = useCallback((id, forceValue) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (forceValue === true) next.add(id);
      else if (forceValue === false) next.delete(id);
      else if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Toggle compare (max 4)
  const toggleCompare = useCallback((id) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Category switch with brief loading effect
  const handleCategorySelect = useCallback((id) => {
    setActiveCat(id);
    setSearch("");
    setLoading(true);
    setTimeout(() => setLoading(false), 180);
  }, []);

  // Grouped subcategory view
  const grouped = useMemo(() => groupBySubcategory(filtered), [filtered]);

  const showSpotlight = activeCat === "all" && !search && !filterOSS;
  const hasResults = filtered.length > 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      {/* Ambient layer */}
      <AmbientBackground
        orb1={activeCatObj.orb1}
        orb2={activeCatObj.orb2}
        accent={activeCatObj.color}
        theme={theme}
      />

      {/* Sidebar */}
      <Sidebar
        activeCat={activeCat}
        onSelect={handleCategorySelect}
        toolCounts={toolCounts}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1, minWidth: 0 }}>
        {/* Header */}
        <Header
          search={search}
          onSearch={setSearch}
          filterOSS={filterOSS}
          onToggleOSS={() => setFilterOSS((v) => !v)}
          sortBy={sortBy}
          onSort={setSortBy}
          onToggleSubmit={() => setSubmitOpen(true)}
          accent={activeCatObj.color}
          onOpenPalette={() => setPaletteOpen(true)}
          resultCount={filtered.length}
          theme={theme}
          onToggleTheme={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
          onSelectTool={(tool) => handleCategorySelect(tool.category)}
          tools={TOOLS}
          selected={selected}
          onSelectStack={toggleTool}
          onSelectCategory={handleCategorySelect}
          bookmarkCount={bookmarkCount}
          onOpenStack={() => setStackOpen(true)}
          onOpenShare={() => setShareOpen(true)}
          hasSelected={selected.size > 0}
          onOpenCalc={() => setCalcOpen(true)}
        />

        {/* Scrollable content */}
        <main
          style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px" }}
          aria-label="Tool library"
        >
          {/* Category Hero */}
          <CategoryHero cat={activeCatObj} filteredCount={filtered.length} />

          {/* Spotlight (All Tools only) */}
          {showSpotlight && <Spotlight onToolSelect={() => {}} />}

          {/* Recently Added (homepage only) */}
          {showSpotlight && sortBy !== "newest" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontFamily: "monospace", fontSize: 9,
                  color: "#00f0ff", letterSpacing: 1.5, fontWeight: 600,
                }}>
                  RECENTLY ADDED
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div style={{
                display: "flex", gap: 8, overflowX: "auto",
                paddingBottom: 8, scrollbarWidth: "thin",
              }}>
                {recentTools.map((tool) => {
                  const cat = getCategoryById(tool.category);
                  return (
                    <div
                      key={tool.id}
                      style={{
                        flexShrink: 0, width: 200,
                        padding: "10px 12px",
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        cursor: "pointer",
                      }}
                      onClick={() => handleCategorySelect(tool.category)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                        <span style={{
                          fontFamily: "monospace", fontWeight: 700, fontSize: 11,
                          color: "var(--text-strong)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {tool.name}
                        </span>
                        <span style={{
                          fontSize: 7, padding: "1px 4px",
                          background: "rgba(0,240,255,0.12)", color: "#00f0ff",
                          borderRadius: 2, fontFamily: "monospace", fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          NEW
                        </span>
                      </div>
                      <p style={{
                        fontSize: 9.5, color: "var(--text-faint)", margin: 0,
                        lineHeight: 1.3,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {tool.desc}
                      </p>
                      <span style={{
                        fontSize: 8, marginTop: 5, display: "inline-block",
                        padding: "1px 5px",
                        background: `${cat?.color || "#00f0ff"}10`,
                        color: cat?.color || "#00f0ff",
                        borderRadius: 3, fontFamily: "monospace",
                      }}>
                        {tool.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email capture (homepage only) */}
          {showSpotlight && <EmailCapture accent={activeCatObj.color} />}

          {/* Loading skeletons */}
          {loading && (
            <div>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasResults && search && (
            <EmptyState
              query={search}
              onClear={() => setSearch("")}
              accent={activeCatObj.color}
            />
          )}

          {/* Tool grid — grouped by subcategory */}
          {!loading && hasResults && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCat + filterOSS}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {[...grouped.entries()].map(([subcategory, tools]) => (
                  <div key={subcategory} style={{ marginBottom: 20 }}>
                    {/* Subcategory header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{
                        fontFamily: "monospace", fontSize: 8.5,
                        color: "var(--text-faint)", letterSpacing: 1.5,
                      }}>
                        {subcategory.toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: 9, fontFamily: "monospace",
                        background: `${activeCatObj.color}10`,
                        color: activeCatObj.color, border: `1px solid ${activeCatObj.color}20`,
                        borderRadius: 3, padding: "0px 5px",
                      }}>
                        {tools.length}
                      </span>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    </div>

                    {/* Tool cards with stagger */}
                    {tools.map((tool, i) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025, duration: 0.25 }}
                      >
                        <ToolCard
                          tool={tool}
                          selected={selected.has(tool.id)}
                          onToggle={toggleTool}
                          plannerMode={false}
                          isBookmarked={isBookmarked(tool.id)}
                          onToggleBookmark={toggleBookmark}
                          isComparing={compareSet.has(tool.id)}
                          onToggleCompare={toggleCompare}
                          compareCount={compareSet.size}
                        />
                      </motion.div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Floating compare bar */}
      <AnimatePresence>
        {compareSet.size >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: "fixed", bottom: 20, left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 18px",
              background: "var(--surface-3)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--border-bright)",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-secondary)" }}>
              Compare ({compareSet.size}/4)
            </span>
            <button
              onClick={() => setCompareOpen(true)}
              disabled={compareSet.size < 2}
              style={{
                fontFamily: "monospace", fontSize: 10,
                background: compareSet.size >= 2 ? `${activeCatObj.color}20` : "var(--surface-1)",
                color: compareSet.size >= 2 ? activeCatObj.color : "var(--text-faint)",
                border: `1px solid ${compareSet.size >= 2 ? `${activeCatObj.color}40` : "var(--border)"}`,
                borderRadius: 7, padding: "6px 14px", cursor: compareSet.size >= 2 ? "pointer" : "not-allowed",
                opacity: compareSet.size >= 2 ? 1 : 0.5,
              }}
            >
              Compare Now
            </button>
            <button
              onClick={() => setCompareSet(new Set())}
              style={{
                fontFamily: "monospace", fontSize: 10,
                background: "none", color: "var(--text-faint)",
                border: "1px solid var(--border)",
                borderRadius: 7, padding: "6px 10px", cursor: "pointer",
              }}
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Widget */}
      <FeedbackWidget accent={activeCatObj.color} />

      {/* Tool Submit Form */}
      <ToolSubmitForm
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        accent={activeCatObj.color}
      />

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectCategory={handleCategorySelect}
        onSelectTool={(tool) => {
          handleCategorySelect(tool.category);
        }}
      />

      {/* My Stack Panel */}
      <MyStack
        open={stackOpen}
        onClose={() => setStackOpen(false)}
        bookmarkedTools={bookmarkedTools}
        onToggleBookmark={toggleBookmark}
        onExport={exportMarkdown}
        onClear={clearBookmarks}
        accent={activeCatObj.color}
      />

      {/* Comparison Matrix */}
      <ComparisonMatrix
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        compareIds={[...compareSet]}
        accent={activeCatObj.color}
      />

      {/* Share Panel */}
      <SharePanel
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        selectedIds={[...selected]}
        accent={activeCatObj.color}
      />

      {/* Cost Calculator */}
      <CostCalculator
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        accent={activeCatObj.color}
      />
    </div>
  );
}
