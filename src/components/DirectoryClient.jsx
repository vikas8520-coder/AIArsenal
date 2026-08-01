"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { TOOLS } from "@/src/data/tools";
import { searchTools } from "@/src/hooks/useSearch";
import { CATEGORIES, getCategoryById } from "@/src/data/categories";
import useBookmarks from "@/src/hooks/useBookmarks";
import { decodeStack } from "@/src/utils/stackUrl";
import AmbientBackground from "@/src/components/AmbientBackground";
import Sidebar from "@/src/components/Sidebar";
import Header from "@/src/components/Header";
import ToolCard, { SkeletonCard } from "@/src/components/ToolCard";
import CategoryHero from "@/src/components/CategoryHero";
import Spotlight from "@/src/components/Spotlight";
import EmptyState from "@/src/components/EmptyState";
import EmailCapture from "@/src/components/EmailCapture";
import FeedbackWidget from "@/src/components/FeedbackWidget";
import LandingHero from "@/src/components/LandingHero";
import WelcomeBackBanner from "@/src/components/WelcomeBackBanner";
import KineticHero from "@/src/components/KineticHero";
import Footer from "@/src/components/Footer";
import { adjustColorForTheme } from "@/src/lib/colors";

// Overlays are only loaded when first opened
const CommandPalette = dynamic(() => import("@/src/components/CommandPalette"), { ssr: false });
const ToolSubmitForm = dynamic(() => import("@/src/components/ToolSubmitForm"), { ssr: false });
const MyStack = dynamic(() => import("@/src/components/MyStack"), { ssr: false });
const ComparisonMatrix = dynamic(() => import("@/src/components/ComparisonMatrix"), { ssr: false });
const SharePanel = dynamic(() => import("@/src/components/SharePanel"), { ssr: false });
const CostCalculator = dynamic(() => import("@/src/components/CostCalculator"), { ssr: false });

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

// Mount once on first open, keep mounted so internal AnimatePresence exit animations run
function useLazyMount(isOpen) {
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);
  return hasOpened;
}

export default function DirectoryClient() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [filterOSS, setFilterOSS] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selected, setSelected] = useState(new Set());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollToToolId, setScrollToToolId] = useState(null);
  const mainRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("nexus-theme") || "dark"; } catch { return "dark"; }
  });

  // New feature state
  const [stackOpen, setStackOpen] = useState(false);
  const [compareSet, setCompareSet] = useState(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // Lazy-mount flags: load overlay chunks on first open but keep mounted for exit animations
  const hasOpenedSubmit = useLazyMount(submitOpen);
  const hasOpenedPalette = useLazyMount(paletteOpen);
  const hasOpenedStack = useLazyMount(stackOpen);
  const hasOpenedCompare = useLazyMount(compareOpen);
  const hasOpenedShare = useLazyMount(shareOpen);
  const hasOpenedCalc = useLazyMount(calcOpen);

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
    const accent = adjustColorForTheme(activeCatObj.color, theme);
    root.style.setProperty("--accent", accent);
    const hex = accent.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
    root.style.setProperty("--accent-dim", `rgba(${r},${g},${b},0.1)`);
    root.style.setProperty("--accent-border", `rgba(${r},${g},${b},0.25)`);
    root.style.setProperty("--orb1", activeCatObj.orb1);
    root.style.setProperty("--orb2", activeCatObj.orb2);
  }, [activeCatObj, theme]);

  // ⌘K global shortcut and OSS toggle
  useEffect(() => {
    const handler = (e) => {
      const anyOverlayOpen = submitOpen || paletteOpen || stackOpen || compareOpen || shareOpen || calcOpen;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (
        e.key === "o" &&
        !e.metaKey && !e.ctrlKey && !e.altKey &&
        !anyOverlayOpen &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA" &&
        !e.target.isContentEditable
      ) {
        setFilterOSS((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitOpen, paletteOpen, stackOpen, compareOpen, shareOpen, calcOpen]);

  // Lock body scroll while any overlay is open
  useEffect(() => {
    const anyOverlayOpen = submitOpen || paletteOpen || stackOpen || compareOpen || shareOpen || calcOpen;
    if (anyOverlayOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [submitOpen, paletteOpen, stackOpen, compareOpen, shareOpen, calcOpen]);

  // Scroll to tool after category switch renders
  useEffect(() => {
    if (!scrollToToolId) return;
    let highlightTimer = null;
    let pollTimer = null;
    let attempts = 0;

    // Poll until the tool card exists AND its framer-motion enter animation
    // has settled (opacity === 1, no transform). Stagger delay is i*0.025s
    // so cards far down the list take up to ~1.5s to settle.
    const poll = () => {
      attempts++;
      const el = document.getElementById(`tool-${scrollToToolId}`);
      if (!el) {
        if (attempts < 80) pollTimer = setTimeout(poll, 50);
        return;
      }

      // Check if the parent motion.div has settled (opacity animation complete)
      const motionParent = el.parentElement;
      const style = motionParent ? getComputedStyle(motionParent) : null;
      const settled = !style || parseFloat(style.opacity) >= 0.99;

      if (!settled) {
        if (attempts < 80) pollTimer = setTimeout(poll, 50);
        return;
      }

      // Element found and settled — scroll and highlight
      const main = mainRef.current;
      if (main) {
        const mainRect = main.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const offset = elRect.top - mainRect.top + main.scrollTop - (mainRect.height / 2) + (elRect.height / 2);
        main.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Highlight with cyan ring — use outline instead of boxShadow to avoid
      // conflicting with the card's inline boxShadow style
      el.style.outline = "2px solid #00f0ff";
      el.style.outlineOffset = "-2px";
      highlightTimer = setTimeout(() => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      }, 2500);
    };

    // Start polling after loading state clears (180ms)
    pollTimer = setTimeout(poll, 200);

    return () => {
      clearTimeout(pollTimer);
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, [scrollToToolId]);

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
  const handleCategorySelect = useCallback((id, skipAnimation) => {
    setActiveCat(id);
    setSearch("");
    if (!skipAnimation) {
      setLoading(true);
      setTimeout(() => setLoading(false), 180);
    }
  }, []);

  // Grouped subcategory view
  const grouped = useMemo(() => groupBySubcategory(filtered), [filtered]);

  const showSpotlight = activeCat === "all" && !search && !filterOSS;
  const hasResults = filtered.length > 0;
  const activeColor = adjustColorForTheme(activeCatObj.color, theme);
  const activeDisplayCat = useMemo(
    () => ({ ...activeCatObj, color: activeColor }),
    [activeCatObj, activeColor]
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", position: "relative", width: "100%", maxWidth: "100vw", overflow: "hidden" }}>
      {/* Landing Hero (first visit) */}
      <LandingHero accent={activeCatObj.color} onExplore={() => {}} />

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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1, minWidth: 0, width: "100%", maxWidth: "100%" }}>
        {/* Header */}
        <Header
          search={search}
          onSearch={setSearch}
          filterOSS={filterOSS}
          onToggleOSS={() => setFilterOSS((v) => !v)}
          sortBy={sortBy}
          onSort={setSortBy}
          onToggleSubmit={() => setSubmitOpen(true)}
          accent={activeColor}
          onOpenPalette={() => setPaletteOpen(true)}
          resultCount={filtered.length}
          theme={theme}
          onToggleTheme={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
          onSelectTool={(tool) => {
            handleCategorySelect(tool.category, true);
            setScrollToToolId(tool.id);
          }}
          onCompare={(idA, idB) => {
            setCompareSet(new Set([idA, idB]));
            setCompareOpen(true);
          }}
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
          ref={mainRef}
          className="main-content-mobile"
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "20px 20px 40px", minWidth: 0, width: "100%", maxWidth: "100%" }}
          aria-label="Tool library"
        >
          {/* Kinetic landing hero (All Tools view only) */}
          {showSpotlight && <KineticHero accent={activeColor} />}

          {/* Category-specific hero strip (every category EXCEPT All Tools) */}
          {!showSpotlight && (
            <CategoryHero cat={activeDisplayCat} filteredCount={filtered.length} />
          )}

          {/* Personalized welcome-back banner (All Tools only) */}
          {showSpotlight && <WelcomeBackBanner />}

          {/* Spotlight (All Tools only) */}
          {showSpotlight && <Spotlight onToolSelect={() => {}} />}

          {/* Recently Added (homepage only) */}
          {showSpotlight && sortBy !== "newest" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontFamily: "monospace", fontSize: 9,
                  color: "var(--brand-color)", letterSpacing: 1.5, fontWeight: 600,
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
                      onClick={() => {
                        handleCategorySelect(tool.category);
                        setScrollToToolId(tool.id);
                      }}
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
                          background: "var(--badge-new-bg)", color: "var(--badge-new-color)",
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
                        background: `${adjustColorForTheme(cat?.color || "#00f0ff", theme)}10`,
                        color: adjustColorForTheme(cat?.color || "#00f0ff", theme),
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
          {showSpotlight && <EmailCapture accent={activeColor} />}

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
              accent={activeColor}
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
                        background: `${activeColor}10`,
                        color: activeColor, border: `1px solid ${activeColor}20`,
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

          {/* Footer inside the scrollable main area on the homepage */}
          <Footer />
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
                background: compareSet.size >= 2 ? `${activeColor}20` : "var(--surface-1)",
                color: compareSet.size >= 2 ? activeColor : "var(--text-faint)",
                border: `1px solid ${compareSet.size >= 2 ? `${activeColor}40` : "var(--border)"}`,
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
      <FeedbackWidget accent={activeColor} />

      {/* Tool Submit Form */}
      {hasOpenedSubmit && (
        <ToolSubmitForm
          open={submitOpen}
          onClose={() => setSubmitOpen(false)}
          accent={activeColor}
        />
      )}

      {/* Command Palette */}
      {hasOpenedPalette && (
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onSelectCategory={handleCategorySelect}
          onSelectTool={(tool) => {
            handleCategorySelect(tool.category);
          }}
        />
      )}

      {/* My Stack Panel */}
      {hasOpenedStack && (
        <MyStack
          open={stackOpen}
          onClose={() => setStackOpen(false)}
          bookmarkedTools={bookmarkedTools}
          onToggleBookmark={toggleBookmark}
          onExport={exportMarkdown}
          onClear={clearBookmarks}
          accent={activeColor}
        />
      )}

      {/* Comparison Matrix */}
      {hasOpenedCompare && (
        <ComparisonMatrix
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          compareIds={[...compareSet]}
          accent={activeColor}
        />
      )}

      {/* Share Panel */}
      {hasOpenedShare && (
        <SharePanel
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          selectedIds={[...selected]}
          accent={activeColor}
        />
      )}

      {/* Cost Calculator */}
      {hasOpenedCalc && (
        <CostCalculator
          open={calcOpen}
          onClose={() => setCalcOpen(false)}
          accent={activeColor}
        />
      )}
    </div>
  );
}
