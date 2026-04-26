"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { pollinationsUrl, signatureBackgroundPrompt } from "../utils/pollinations";
import { useEffect, useState } from "react";
import { useShouldReduceMotion } from "../hooks/useIsMobile";

/**
 * Multi-layer atmospheric background for the quiz result page.
 * Layer 1 (always renders): CSS-only ambient aura — animated conic
 *   gradient + blurred orbs driven by the archetype's accent color.
 * Layer 2 (best-effort enhancement): AI-generated atmospheric image
 *   from Pollinations. Fades in only if it loads successfully; if the
 *   request fails or times out, we never show a broken image placeholder.
 */
export default function ArchetypeAura({ answers, archetype }) {
  const accent = archetype?.accent || "#00f0ff";
  const reduced = useShouldReduceMotion();

  // ── Layer 2: optional AI enhancement (fails silently). Skip on mobile
  // because (a) the network request alone wastes battery and (b) loading
  // a 1600×900 image into a blurred backdrop is GPU-expensive.
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgUrl = useMemo(() => {
    if (reduced) return null;
    if (!answers || !archetype) return null;
    const prompt = signatureBackgroundPrompt(
      answers,
      archetype.sceneKeywords || ""
    );
    const seed = (archetype.slug || "").length * 37 + 7;
    return pollinationsUrl(prompt, {
      width: 1600,
      height: 900,
      seed,
      model: "flux",
    });
  }, [answers, archetype, reduced]);

  useEffect(() => {
    if (!imgUrl) return;
    setImgLoaded(false);
    const img = new window.Image();
    let cancelled = false;
    const timeout = setTimeout(() => {
      cancelled = true; // Give up silently after 8 seconds
    }, 8000);
    img.onload = () => {
      if (!cancelled) setImgLoaded(true);
      clearTimeout(timeout);
    };
    img.onerror = () => clearTimeout(timeout);
    img.src = imgUrl;
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [imgUrl]);

  return (
    <>
      {/* Base color wash — solid dark */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "var(--bg, #0a0a0a)",
        }}
      />

      {/* Slowly-rotating conic gradient — skipped on mobile / reduced.
          200vmax × 200vmax of conic-gradient is the single most expensive
          paint layer on the page, and on phones it forces a giant offscreen
          composite buffer that bakes battery. */}
      {!reduced && (
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: "200vmax",
            height: "200vmax",
            marginTop: "-100vmax",
            marginLeft: "-100vmax",
            zIndex: 0,
            pointerEvents: "none",
            background: `conic-gradient(from 0deg, ${accent}00 0%, ${accent}22 15%, ${accent}00 30%, #a855f722 55%, ${accent}00 70%, ${accent}18 85%, ${accent}00 100%)`,
            opacity: 0.7,
          }}
        />
      )}

      {/* Soft orbs that drift and breathe. On reduced-motion devices we
          drop one orb, halve the blur radius (cheaper composite), and stop
          the breathing animation. */}
      <motion.div
        aria-hidden
        animate={
          reduced
            ? false
            : {
                x: ["-10%", "15%", "-10%"],
                y: ["-5%", "12%", "-5%"],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration: 22, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          position: "fixed",
          top: "5%",
          left: "5%",
          width: reduced ? 320 : 480,
          height: reduced ? 320 : 480,
          borderRadius: "50%",
          background: accent,
          opacity: reduced ? 0.22 : 0.18,
          filter: reduced ? "blur(60px)" : "blur(120px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {!reduced && (
        <motion.div
          aria-hidden
          animate={{
            x: ["10%", "-15%", "10%"],
            y: ["10%", "-8%", "10%"],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "fixed",
            bottom: "5%",
            right: "5%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "#a855f7",
            opacity: 0.14,
            filter: "blur(140px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}
      {!reduced && (
        <motion.div
          aria-hidden
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.18, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 720,
            height: 720,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Starfield dot grid */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, ${accent}18 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.35,
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      {/* Optional AI enhancement layer — fades in only if loaded */}
      {imgUrl && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: imgLoaded ? 0.55 : 0 }}
          transition={{ duration: 2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: imgLoaded ? `url(${imgUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(8px) saturate(1.3)",
            transform: "scale(1.15)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Top + bottom fade-to-black vignette for legibility */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </>
  );
}
