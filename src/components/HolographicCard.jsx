"use client";
import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Tilt + holographic-foil card container. Wraps the quiz result content
 * so it feels like a collectible card: mouse movement rotates it in 3D,
 * a conic-gradient sheen follows the cursor, and a border glow intensifies
 * on hover. Falls back to a static flat card with no JS.
 *
 * Props:
 *   accent: archetype color (drives the foil tint)
 *   children: anything — rendered above the foil layers
 */
export default function HolographicCard({ accent = "#00f0ff", children }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Normalized mouse position inside the card (0..1 on each axis)
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  // Spring-smoothed versions for a floaty feel
  const smx = useSpring(mx, { stiffness: 150, damping: 20 });
  const smy = useSpring(my, { stiffness: 150, damping: 20 });

  // Tilt: mouse.y → rotateX (inverted), mouse.x → rotateY
  const rotateX = useTransform(smy, [0, 1], [6, -6]);
  const rotateY = useTransform(smx, [0, 1], [-6, 6]);

  // Foil position — raw percentages for CSS gradient positioning
  const foilX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const foilY = useTransform(my, [0, 1], ["0%", "100%"]);

  // Shine intensity ramps up toward the edges (away from center)
  const shineOpacity = useTransform(
    [smx, smy],
    ([x, y]) => {
      const dx = x - 0.5;
      const dy = y - 0.5;
      return Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2.4);
    }
  );

  const onMove = useCallback(
    (e) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mx.set(Math.max(0, Math.min(1, x)));
      my.set(Math.max(0, Math.min(1, y)));
    },
    [mx, my]
  );

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        maxWidth: 920,
        margin: "0 auto",
        borderRadius: 20,
        padding: "40px 36px 48px",
        background: "rgba(13,13,15,0.7)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${accent}30`,
        boxShadow: hovered
          ? `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accent}40, 0 0 60px ${accent}25`
          : `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}20`,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
        transition: "box-shadow 0.3s ease",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* Layer 1: conic holographic foil (follows cursor) */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: shineOpacity,
          mixBlendMode: "color-dodge",
          background: useTransform(
            [foilX, foilY],
            ([x, y]) =>
              `conic-gradient(from 90deg at ${x} ${y}, ${accent}00, ${accent}55, #a855f755, #eab30855, ${accent}55, ${accent}00)`
          ),
        }}
      />

      {/* Layer 2: soft radial highlight at cursor */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: hovered ? 0.6 : 0.25,
          transition: "opacity 0.3s ease",
          background: useTransform(
            [foilX, foilY],
            ([x, y]) =>
              `radial-gradient(circle at ${x} ${y}, ${accent}22 0%, transparent 45%)`
          ),
        }}
      />

      {/* Layer 3: SVG noise texture for that "foil-card" grain */}
      <svg
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="holo-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.4"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#holo-noise)" />
      </svg>

      {/* Content — lifted above foil layers with translateZ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          transform: "translateZ(30px)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
