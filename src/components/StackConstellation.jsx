"use client";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TOOLS } from "../data/tools";
import { getToolSlug } from "../lib/tools";
import { getCategoryById } from "../data/categories";

/**
 * SVG constellation — archetype at center, tools orbiting radially.
 * Orchestrates a staggered reveal + continuous ambient animation.
 *
 * Props:
 *   archetype: { slug, name, emoji, accent }
 *   tools:     [{ id, role, why }]
 *   reveal:    boolean — if true, runs the entrance animation
 */
export default function StackConstellation({
  archetype,
  tools,
  reveal = true,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [portraitLoaded, setPortraitLoaded] = useState(false);

  const size = 640;
  const cx = size / 2;
  const cy = size / 2;
  const centerRadius = 72;
  const orbitRadius = 230;

  const tooledTools = useMemo(() => {
    return tools
      .map((t) => ({ ...t, tool: TOOLS.find((x) => x.id === t.id) }))
      .filter((t) => t.tool);
  }, [tools]);

  const n = tooledTools.length;

  const positions = useMemo(() => {
    // Start at top (-90deg), spread evenly around
    const start = -Math.PI / 2;
    return tooledTools.map((_, i) => {
      const angle = start + (i / n) * Math.PI * 2;
      return {
        x: cx + Math.cos(angle) * orbitRadius,
        y: cy + Math.sin(angle) * orbitRadius,
        angle,
      };
    });
  }, [n, cx, cy]);

  const accent = archetype?.accent || "#00f0ff";
  const portraitUrl = archetype?.slug
    ? `/archetypes/${archetype.slug}.jpg`
    : null;

  // Preload the portrait — if it fails, we fall back to the emoji treatment.
  useEffect(() => {
    if (!portraitUrl) return;
    setPortraitLoaded(false);
    const img = new window.Image();
    img.onload = () => setPortraitLoaded(true);
    img.src = portraitUrl;
    return () => {
      img.onload = null;
    };
  }, [portraitUrl]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: size,
        margin: "0 auto",
        position: "relative",
        aspectRatio: "1 / 1",
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          <radialGradient id="center-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="50%" stopColor={accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="portrait-fallback" cx="50%" cy="30%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="ring-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor={accent} stopOpacity="1" />
          </linearGradient>
          <clipPath id="center-clip">
            <circle cx={cx} cy={cy} r={centerRadius - 4} />
          </clipPath>
          <filter id="tool-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer halo glow */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={orbitRadius + 80}
          fill="url(#center-glow)"
          initial={reveal ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: reveal ? 0.2 : 0 }}
        />

        {/* Pulsing concentric rings around center */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`pulse-${i}`}
            cx={cx}
            cy={cy}
            r={centerRadius}
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 2.2],
              opacity: [0.45, 0],
            }}
            transition={{
              duration: 3.5,
              delay: reveal ? 2.5 + i * 1.1 : i * 1.1,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}

        {/* Orbit ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={orbitRadius}
          fill="none"
          stroke={accent}
          strokeWidth="0.8"
          strokeOpacity="0.22"
          strokeDasharray="3 5"
          initial={reveal ? { pathLength: 0, opacity: 0 } : { opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: reveal ? 0.3 : 0 }}
        />

        {/* Connection lines */}
        {positions.map((p, i) => {
          const cat = getCategoryById(tooledTools[i].tool.category);
          const lineColor = cat?.color || accent;
          return (
            <motion.line
              key={`line-${i}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={lineColor}
              strokeWidth={hoveredIdx === i ? 2 : 1.2}
              strokeOpacity={hoveredIdx === i ? 0.9 : 0.4}
              initial={
                reveal ? { pathLength: 0, opacity: 0 } : { opacity: 0.4 }
              }
              animate={{
                pathLength: 1,
                opacity: hoveredIdx === i ? 0.9 : 0.4,
              }}
              transition={{
                pathLength: { duration: 0.6, delay: reveal ? 0.7 + i * 0.15 : 0 },
                opacity: { duration: 0.25 },
              }}
            />
          );
        })}

        {/* Continuous data-flow particles traveling outward along each line */}
        {positions.map((p, i) => {
          const cat = getCategoryById(tooledTools[i].tool.category);
          const color = cat?.color || accent;
          return [0, 1].map((pulse) => (
            <motion.circle
              key={`flow-${i}-${pulse}`}
              r="2.6"
              fill={color}
              initial={{ opacity: 0 }}
              animate={{
                cx: [cx, p.x],
                cy: [cy, p.y],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.4,
                delay: reveal
                  ? 2.4 + i * 0.15 + pulse * 1.2
                  : i * 0.1 + pulse * 1.2,
                repeat: Infinity,
                repeatDelay: 1.2,
                ease: "linear",
                times: [0, 0.1, 0.85, 1],
              }}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          ));
        })}

        {/* Center node — archetype portrait or gradient fallback */}
        <motion.g
          initial={reveal ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: reveal ? 0.2 : 0,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {/* Outer halo */}
          <circle
            cx={cx}
            cy={cy}
            r={centerRadius + 14}
            fill={accent}
            opacity="0.08"
          />
          <circle
            cx={cx}
            cy={cy}
            r={centerRadius + 6}
            fill={accent}
            opacity="0.15"
          />

          {/* Background disc — always filled with gradient so there's no empty look */}
          <circle cx={cx} cy={cy} r={centerRadius} fill="url(#portrait-fallback)" />

          {/* If portrait loaded, overlay it */}
          {portraitUrl && portraitLoaded && (
            <image
              href={portraitUrl}
              x={cx - centerRadius + 4}
              y={cy - centerRadius + 4}
              width={(centerRadius - 4) * 2}
              height={(centerRadius - 4) * 2}
              clipPath="url(#center-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
          )}

          {/* Show the emoji over the disc only when portrait hasn't loaded */}
          {!portraitLoaded && (
            <text
              x={cx}
              y={cy + 18}
              textAnchor="middle"
              fontSize="54"
              style={{ userSelect: "none" }}
            >
              {archetype?.emoji || "⬢"}
            </text>
          )}

          {/* Shimmering ring on top */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={centerRadius}
            fill="none"
            stroke="url(#ring-shimmer)"
            strokeWidth="2.5"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        </motion.g>

        {/* Tool nodes */}
        {positions.map((p, i) => {
          const entry = tooledTools[i];
          const cat = getCategoryById(entry.tool.category);
          const color = cat?.color || accent;
          const isHovered = hoveredIdx === i;
          const nodeRadius = isHovered ? 38 : 34;

          // Truncate display name
          const displayName =
            entry.tool.name.length > 13
              ? entry.tool.name.slice(0, 12) + "…"
              : entry.tool.name;
          const roleText = (entry.role || cat?.label || "TOOL")
            .toUpperCase()
            .slice(0, 14);

          return (
            <motion.g
              key={`tool-${i}`}
              initial={
                reveal
                  ? {
                      scale: 0,
                      opacity: 0,
                    }
                  : { scale: 1, opacity: 1 }
              }
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: reveal ? 0.85 + i * 0.15 : 0,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <Link href={`/tools/${getToolSlug(entry.tool)}`}>
                <g>
                  {/* Outer aura */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={nodeRadius + 14}
                    fill={color}
                    fillOpacity={isHovered ? 0.22 : 0.08}
                    style={{ transition: "fill-opacity 0.2s" }}
                  />

                  {/* Main node disc */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={nodeRadius}
                    fill="#0d0d0f"
                    stroke={color}
                    strokeWidth={isHovered ? 2.5 : 1.8}
                    style={{ transition: "all 0.2s" }}
                    filter={isHovered ? "url(#tool-glow)" : undefined}
                  />

                  {/* Subtle inner ring for depth */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={nodeRadius - 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.6"
                    strokeOpacity="0.3"
                  />

                  {/* Number badge (top-left of node) */}
                  <circle
                    cx={p.x - nodeRadius + 6}
                    cy={p.y - nodeRadius + 6}
                    r="10"
                    fill={color}
                  />
                  <text
                    x={p.x - nodeRadius + 6}
                    y={p.y - nodeRadius + 9.5}
                    textAnchor="middle"
                    fill="#0a0a0a"
                    fontSize="10"
                    fontFamily="var(--font-mono, monospace)"
                    fontWeight="700"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {i + 1}
                  </text>

                  {/* Tool name */}
                  <text
                    x={p.x}
                    y={p.y - 1}
                    textAnchor="middle"
                    fill="var(--text-strong, #e0e0e0)"
                    fontSize="10"
                    fontFamily="var(--font-mono, monospace)"
                    fontWeight="700"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {displayName}
                  </text>

                  {/* Role label */}
                  <text
                    x={p.x}
                    y={p.y + 12}
                    textAnchor="middle"
                    fill={color}
                    fontSize="7"
                    fontFamily="var(--font-mono, monospace)"
                    letterSpacing="0.8"
                    fontWeight="600"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {roleText}
                  </text>
                </g>
              </Link>
            </motion.g>
          );
        })}
      </svg>

      {/* Tooltip on hover */}
      {hoveredIdx != null && tooledTools[hoveredIdx]?.why && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            bottom: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(13,13,15,0.95)",
            border: `1px solid ${accent}55`,
            borderRadius: 10,
            padding: "10px 16px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 12,
            color: "var(--text-default)",
            maxWidth: 480,
            width: "max-content",
            textAlign: "center",
            lineHeight: 1.5,
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${accent}20`,
            backdropFilter: "blur(8px)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 1.5,
              color: accent,
              marginBottom: 4,
            }}
          >
            {(tooledTools[hoveredIdx].role || "TOOL").toUpperCase()}
          </div>
          {tooledTools[hoveredIdx].why}
        </motion.div>
      )}
    </div>
  );
}
