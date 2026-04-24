"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  pollinationsUrl,
  signatureBackgroundPrompt,
} from "../utils/pollinations";

/**
 * Live-generated atmospheric background for the quiz result page.
 * Fades in when the image loads, falls back silently on error.
 */
export default function SignatureBackground({ answers, archetype }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const url = useMemo(() => {
    if (!answers) return null;
    const prompt = signatureBackgroundPrompt(
      answers,
      archetype?.sceneKeywords || ""
    );
    // Use archetype slug as seed-ish so same archetype looks consistent
    // across runs but answers differ = different look.
    const seed = (archetype?.slug || "").length * 37 + 7;
    return pollinationsUrl(prompt, {
      width: 1600,
      height: 900,
      seed,
      model: "flux",
    });
  }, [answers, archetype]);

  useEffect(() => {
    if (!url) return;
    setLoaded(false);
    setFailed(false);
    const img = new window.Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setFailed(true);
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  if (!url || failed) return null;

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 1.2 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px) saturate(1.2)",
          transform: "scale(1.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 70%, rgba(10,10,10,0.95) 100%)",
        }}
      />
    </motion.div>
  );
}
