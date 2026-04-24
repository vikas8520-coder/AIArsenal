"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  useVisitorProfile,
  trackVisit,
  getEffectiveArchetype,
  getNewToolsSince,
  getLastViewedTools,
} from "../lib/visitorIntel";
import { TOOLS } from "../data/tools";
import { getToolSlug } from "../lib/tools";
import { getCategoryById } from "../data/categories";
import { encodeCustomStack } from "../utils/customStack";

export default function WelcomeBackBanner() {
  const { profile, refresh } = useVisitorProfile();
  const [dismissed, setDismissed] = useState(false);
  const [prevLastVisit, setPrevLastVisit] = useState(null);

  useEffect(() => {
    // Mark visit + get the PRIOR last-visit timestamp so we can show
    // "new since you were here" against the correct baseline.
    const prev = trackVisit();
    setPrevLastVisit(prev);
    refresh();
    // Local dismiss state per-session only
    try {
      if (sessionStorage.getItem("aiarsenal-welcome-dismissed") === "1") {
        setDismissed(true);
      }
    } catch {}
  }, [refresh]);

  const archetype = useMemo(() => getEffectiveArchetype(profile), [profile]);

  const newTools = useMemo(
    () => getNewToolsSince(prevLastVisit).slice(0, 4),
    [prevLastVisit]
  );

  const lastViewed = useMemo(
    () =>
      getLastViewedTools(profile, 4)
        .map((v) => TOOLS.find((t) => t.id === v.id))
        .filter(Boolean),
    [profile]
  );

  const savedStacks = profile.savedStacks || [];
  const returningUser = (profile.visitCount || 0) > 1;

  // Don't render on first visit or if dismissed
  if (!returningUser || dismissed) return null;

  // Need at least ONE reason to show
  const hasReason =
    archetype ||
    newTools.length > 0 ||
    lastViewed.length > 0 ||
    savedStacks.length > 0;
  if (!hasReason) return null;

  const accent = archetype?.accent || "#00f0ff";

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("aiarsenal-welcome-dismissed", "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        style={{
          position: "relative",
          margin: "16px auto 0",
          maxWidth: 1200,
          padding: "16px 20px",
          background: `linear-gradient(135deg, ${accent}10 0%, ${accent}04 100%)`,
          border: `1px solid ${accent}25`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Top row: greeting + archetype + dismiss */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: (newTools.length || lastViewed.length || savedStacks.length) > 0 ? 12 : 0,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `${accent}20`,
                border: `1px solid ${accent}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {archetype?.source === "quiz" ? (
                <img
                  src={`/archetypes/${archetype.slug}.jpg`}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                "◈"
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 2,
                  color: accent,
                  marginBottom: 2,
                }}
              >
                WELCOME BACK
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 14,
                  color: "var(--text-strong)",
                  fontWeight: 700,
                  letterSpacing: -0.2,
                }}
              >
                {archetype
                  ? archetype.source === "quiz"
                    ? `You are ${archetype.name}`
                    : `You look like ${archetype.name}`
                  : "Here's what's new since you were last here"}
                {archetype?.source === "inferred" && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      color: "var(--text-faint)",
                      fontWeight: 400,
                      letterSpacing: 0,
                    }}
                  >
                    (inferred)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {archetype?.source === "inferred" && (
              <Link
                href="/quiz"
                style={{
                  padding: "6px 12px",
                  background: accent,
                  color: "#000",
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1,
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                CONFIRM WITH QUIZ →
              </Link>
            )}
            {archetype?.source === "quiz" && profile.quizResult?.toolIds?.length > 0 && (
              <Link
                href={`/scaffold?s=${encodeCustomStack({
                  name: `My ${archetype.name} stack`,
                  description: archetype.tagline,
                  roles: profile.quizResult.toolIds.map((id) => ({
                    label: "",
                    toolId: id,
                  })),
                })}`}
                style={{
                  padding: "6px 12px",
                  background: accent,
                  color: "#000",
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1,
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                SCAFFOLD MY STACK →
              </Link>
            )}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-faint)",
                fontSize: 16,
                cursor: "pointer",
                padding: "4px 8px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content strip: new tools / last-viewed / saved stacks */}
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {newTools.length > 0 && (
            <IntelSection
              label={`✦ NEW SINCE YOUR LAST VISIT (${newTools.length})`}
              labelColor="#10b981"
            >
              {newTools.map((t) => {
                const cat = getCategoryById(t.category);
                const color = cat?.color || accent;
                return (
                  <Chip
                    key={t.id}
                    href={`/tools/${getToolSlug(t)}`}
                    color={color}
                    label={t.name}
                  />
                );
              })}
            </IntelSection>
          )}

          {savedStacks.length > 0 && (
            <IntelSection label={`★ YOUR SAVED STACKS (${savedStacks.length})`}>
              {savedStacks.slice(0, 3).map((s) => (
                <Chip
                  key={s.name}
                  href={`/build?s=${encodeCustomStack(s)}`}
                  color={accent}
                  label={s.name}
                />
              ))}
            </IntelSection>
          )}

          {newTools.length === 0 && savedStacks.length === 0 && lastViewed.length > 0 && (
            <IntelSection label="◉ PICK UP WHERE YOU LEFT OFF">
              {lastViewed.slice(0, 4).map((t) => {
                const cat = getCategoryById(t.category);
                const color = cat?.color || accent;
                return (
                  <Chip
                    key={t.id}
                    href={`/tools/${getToolSlug(t)}`}
                    color={color}
                    label={t.name}
                  />
                );
              })}
            </IntelSection>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function IntelSection({ label, children, labelColor = "var(--text-faint)" }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 1.5,
          color: labelColor,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function Chip({ href, color, label }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 10.5,
        fontFamily: "monospace",
        padding: "4px 10px",
        background: `${color}12`,
        border: `1px solid ${color}35`,
        color,
        borderRadius: 5,
        textDecoration: "none",
        whiteSpace: "nowrap",
        fontWeight: 600,
      }}
    >
      {label}
    </Link>
  );
}
