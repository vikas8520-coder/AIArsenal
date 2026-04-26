"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useShouldReduceMotion } from "../hooks/useIsMobile";

// Neural constellation canvas
function ConstellationCanvas({ accentColor }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const reduced = useShouldReduceMotion();

  useEffect(() => {
    if (reduced) return; // Skip the canvas animation entirely on mobile / reduced-motion
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles — fewer on smaller screens
    const count = window.innerWidth < 720 ? 22 : 45;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));

    // Pause the loop when the tab is hidden
    let paused = document.visibilityState === "hidden";
    const onVis = () => {
      paused = document.visibilityState === "hidden";
      if (!paused && !animRef.current) animRef.current = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);

    const draw = () => {
      if (paused) {
        animRef.current = null;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Parse accent color for rgba
      const hex = accentColor.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      const particles = particlesRef.current;

      // Update positions
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // Draw connections (max 100px apart)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},0.25)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [accentColor, reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
}

export default function AmbientBackground({ orb1, orb2, accent, theme }) {
  const isLight = theme === "light";
  const orb1Opacity = isLight ? 0.13 : 0.045;
  const orb2Opacity = isLight ? 0.11 : 0.04;
  const gridColor = isLight ? "rgba(0,0,0,0.025)" : "rgba(255,255,255,0.015)";
  const reduced = useShouldReduceMotion();

  // On mobile / reduced-motion: skip canvas, drop second orb, halve blur
  return (
    <>
      {/* Constellation — opt-out on reduced motion */}
      <ConstellationCanvas accentColor={accent} />

      {/* Ambient orbs */}
      <motion.div
        key={orb1}
        animate={reduced ? false : { background: orb1, opacity: orb1Opacity }}
        transition={{ duration: 3, ease: "easeInOut" }}
        style={{
          position: "fixed",
          top: "-200px",
          left: "-150px",
          width: reduced ? "420px" : "700px",
          height: reduced ? "420px" : "700px",
          borderRadius: "50%",
          filter: reduced ? "blur(70px)" : "blur(130px)",
          opacity: orb1Opacity,
          pointerEvents: "none",
          zIndex: 0,
          background: orb1,
        }}
      />
      {!reduced && (
        <motion.div
          key={orb2}
          animate={{ background: orb2, opacity: orb2Opacity }}
          transition={{ duration: 3, ease: "easeInOut" }}
          style={{
            position: "fixed",
            bottom: "-200px",
            right: "-150px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            filter: "blur(130px)",
            opacity: orb2Opacity,
            pointerEvents: "none",
            zIndex: 0,
            background: orb2,
          }}
        />
      )}

      {/* Grid overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}
