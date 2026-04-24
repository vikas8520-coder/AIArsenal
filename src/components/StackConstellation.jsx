"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TOOLS } from "../data/tools";
import { getToolSlug } from "../lib/tools";
import { getCategoryById } from "../data/categories";

/**
 * SVG constellation — archetype at center, tools orbiting radially.
 * Orchestrates a staggered reveal animation.
 *
 * Props:
 *   archetype: { slug, name, emoji, accent }
 *   tools:     [{ id, role, why }]
 *   reveal:    boolean — if true, runs the entrance animation from start
 */
export default function StackConstellation({
  archetype,
  tools,
  reveal = true,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const size = 560;
  const cx = size / 2;
  const cy = size / 2;
  const centerRadius = 62;
  const orbitRadius = 210;

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
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <clipPath id="center-clip">
            <circle cx={cx} cy={cy} r={centerRadius - 4} />
          </clipPath>
          <filter id="tool-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={orbitRadius + 60}
          fill="url(#center-glow)"
          initial={reveal ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: reveal ? 0.2 : 0 }}
        />

        {/* Orbit ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={orbitRadius}
          fill="none"
          stroke={accent}
          strokeWidth="0.6"
          strokeOpacity="0.18"
          strokeDasharray="2 4"
          initial={reveal ? { pathLength: 0, opacity: 0 } : { opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: reveal ? 0.3 : 0 }}
        />

        {/* Connection lines (center → each tool) */}
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
              strokeWidth={hoveredIdx === i ? 1.6 : 1}
              strokeOpacity={hoveredIdx === i ? 0.8 : 0.35}
              initial={
                reveal ? { pathLength: 0, opacity: 0 } : { opacity: 0.35 }
              }
              animate={{
                pathLength: 1,
                opacity: hoveredIdx === i ? 0.8 : 0.35,
              }}
              transition={{
                pathLength: { duration: 0.6, delay: reveal ? 0.7 + i * 0.15 : 0 },
                opacity: { duration: 0.25 },
              }}
            />
          );
        })}

        {/* Center node (archetype) */}
        <motion.g
          initial={reveal ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.7,
            delay: reveal ? 0.2 : 0,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={centerRadius}
            fill="var(--surface-2, #18181b)"
            stroke={accent}
            strokeWidth="2"
          />
          {portraitUrl ? (
            <image
              href={portraitUrl}
              x={cx - centerRadius + 4}
              y={cy - centerRadius + 4}
              width={(centerRadius - 4) * 2}
              height={(centerRadius - 4) * 2}
              clipPath="url(#center-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fontSize="42"
              style={{ userSelect: "none" }}
            >
              {archetype?.emoji || "⬢"}
            </text>
          )}
          <circle
            cx={cx}
            cy={cy}
            r={centerRadius}
            fill="none"
            stroke={accent}
            strokeWidth="2"
          />
        </motion.g>

        {/* Tool nodes */}
        {positions.map((p, i) => {
          const entry = tooledTools[i];
          const cat = getCategoryById(entry.tool.category);
          const color = cat?.color || accent;
          const nodeRadius = hoveredIdx === i ? 34 : 30;

          return (
            <motion.g
              key={`tool-${i}`}
              initial={
                reveal
                  ? {
                      scale: 0,
                      opacity: 0,
                      x: cx - p.x,
                      y: cy - p.y,
                    }
                  : { scale: 1, opacity: 1 }
              }
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              transition={{
                duration: 0.55,
                delay: reveal ? 0.85 + i * 0.15 : 0,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <Link href={`/tools/${getToolSlug(entry.tool)}`}>
                <g>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={nodeRadius + 10}
                    fill={color}
                    fillOpacity={hoveredIdx === i ? 0.18 : 0}
                    style={{ transition: "fill-opacity 0.2s" }}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={nodeRadius}
                    fill="var(--surface-1, #0f0f10)"
                    stroke={color}
                    strokeWidth={hoveredIdx === i ? 2 : 1.4}
                    style={{ transition: "all 0.2s" }}
                    filter={hoveredIdx === i ? "url(#tool-glow)" : undefined}
                  />
                  <text
                    x={p.x}
                    y={p.y - 2}
                    textAnchor="middle"
                    fill="var(--text-strong, #e0e0e0)"
                    fontSize="9.5"
                    fontFamily="var(--font-mono, monospace)"
                    fontWeight="700"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {entry.tool.name.length > 12
                      ? entry.tool.name.slice(0, 11) + "…"
                      : entry.tool.name}
                  </text>
                  <text
                    x={p.x}
                    y={p.y + 10}
                    textAnchor="middle"
                    fill={color}
                    fontSize="7"
                    fontFamily="var(--font-mono, monospace)"
                    letterSpacing="0.5"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {(entry.role || cat?.label || "TOOL").toUpperCase().slice(0, 16)}
                  </text>
                </g>
              </Link>
            </motion.g>
          );
        })}
      </svg>

      {/* Tooltip below constellation on hover */}
      {hoveredIdx != null && tooledTools[hoveredIdx]?.why && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-2)",
            border: `1px solid ${accent}35`,
            borderRadius: 8,
            padding: "8px 14px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 11.5,
            color: "var(--text-default)",
            maxWidth: 440,
            width: "max-content",
            textAlign: "center",
            lineHeight: 1.5,
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        >
          {tooledTools[hoveredIdx].why}
        </motion.div>
      )}
    </div>
  );
}
