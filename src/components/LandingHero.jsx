"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TOOLS, STATS } from "../data/tools";
import { CATEGORIES } from "../data/categories";

function AnimatedNumber({ target, duration = 1500, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
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
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}{val}{suffix}
    </span>
  );
}

function EmailCTA({ accent }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing_hero" }),
      });
      if (res.ok) {
        setStatus("success");
        if (window.plausible) window.plausible("Email Signup", { props: { location: "landing_hero" } });
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#00ff88", margin: 0 }}
      >
        You're in. Weekly picks incoming.
      </motion.p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          fontFamily: "var(--font-mono)", fontSize: 13,
          background: "var(--surface-2)",
          border: "1px solid var(--border-bright)",
          borderRadius: 8, padding: "10px 16px",
          color: "var(--text-strong)", outline: "none",
          width: 240, transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-bright)"; }}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
          background: `${accent}20`, color: accent,
          border: `1px solid ${accent}40`,
          borderRadius: 8, padding: "10px 20px",
          cursor: status === "submitting" ? "wait" : "pointer",
          transition: "all 0.15s",
        }}
      >
        {status === "submitting" ? "..." : "Get Weekly Picks"}
      </button>
    </form>
  );
}

// Category count (excluding "all")
const categoryCount = CATEGORIES.filter((c) => c.id !== "all").length;

// Unique companies
const uniqueCompanies = new Set(TOOLS.map((t) => t.company)).size;

export default function LandingHero({ accent = "#00f0ff", onExplore }) {
  const [visible, setVisible] = useState(true);

  // If user has visited before, skip hero
  useEffect(() => {
    try {
      if (sessionStorage.getItem("aiarsenal-hero-seen")) {
        setVisible(false);
      }
    } catch {}
  }, []);

  const handleExplore = () => {
    setVisible(false);
    try { sessionStorage.setItem("aiarsenal-hero-seen", "1"); } catch {}
    if (onExplore) onExplore();
  };

  if (!visible) return null;

  return (
    <section className="landing-hero" style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)",
      overflow: "hidden",
    }}>
      {/* Ambient glow orbs */}
      <div style={{
        position: "absolute", top: "15%", left: "20%",
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}12, transparent 70%)`,
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%",
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 800, width: "100%",
        padding: "0 24px",
        textAlign: "center",
      }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ marginBottom: 24 }}
        >
          <img
            src="/logo.png"
            alt="AIArsenal"
            style={{
              width: 100, height: 100, borderRadius: 20,
              boxShadow: `0 0 60px ${accent}20, 0 0 120px ${accent}10`,
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            fontFamily: "var(--font-mono)", fontWeight: 700,
            fontSize: "clamp(32px, 5vw, 56px)",
            color: "var(--text-strong)",
            margin: "0 0 8px", letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          AI<span style={{ color: accent }}>Arsenal</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{
            fontFamily: "var(--font-body)", fontSize: "clamp(16px, 2.2vw, 20px)",
            color: "var(--text-secondary)",
            margin: "0 0 32px", lineHeight: 1.5,
            maxWidth: 560, marginLeft: "auto", marginRight: "auto",
          }}
        >
          The curated directory of <strong style={{ color: "var(--text-strong)" }}>{STATS.total}+ free AI tools</strong>,
          credits, and systems — discover, compare, and build your perfect AI stack.
        </motion.p>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{
            display: "flex", gap: 32, justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 36,
          }}
        >
          <StatBlock value={<AnimatedNumber target={STATS.total} suffix="+" />} label="AI Tools" color={accent} />
          <StatBlock value={<AnimatedNumber target={categoryCount} />} label="Categories" color="#ff6b9d" />
          <StatBlock value={<AnimatedNumber target={STATS.oss} suffix="+" />} label="Open Source" color="#00ff88" />
          <StatBlock value={<AnimatedNumber target={uniqueCompanies} suffix="+" />} label="Companies" color="#ffd700" />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{
            display: "flex", gap: 12, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 40,
          }}
        >
          <button
            onClick={handleExplore}
            className="landing-cta-primary"
            style={{
              fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
              background: accent, color: "#0a0a0a",
              border: "none", borderRadius: 10,
              padding: "14px 32px", cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 4px 24px ${accent}40`,
            }}
          >
            Explore Tools
          </button>
          <button
            onClick={() => {
              handleExplore();
              setTimeout(() => {
                const el = document.querySelector("[data-email-capture]");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
              background: "var(--surface-2)", color: "var(--text-strong)",
              border: "1px solid var(--border-bright)", borderRadius: 10,
              padding: "14px 32px", cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Get Weekly Picks
          </button>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          style={{
            display: "flex", gap: 16, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 40,
          }}
        >
          <StepCard step="1" title="Discover" desc="Browse 194+ curated AI tools across 13 categories" color={accent} />
          <StepCard step="2" title="Compare" desc="Side-by-side comparison, AI-powered search & stack planner" color="#b388ff" />
          <StepCard step="3" title="Build" desc="Save your stack, export it, and share with your team" color="#00ff88" />
        </motion.div>

        {/* Why AIArsenal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          style={{
            display: "flex", gap: 20, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 40,
          }}
        >
          {[
            { icon: "✓", text: "Curated, not scraped", sub: "Every tool manually vetted" },
            { icon: "⚡", text: "AI-powered search", sub: "Semantic search with embeddings" },
            { icon: "🔒", text: "Privacy flags", sub: "Know before you share data" },
            { icon: "💰", text: "100% free", sub: "No paywalls, ever" },
          ].map((item) => (
            <div key={item.text} style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              textAlign: "left", maxWidth: 180,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                  color: "var(--text-strong)", marginBottom: 2,
                }}>{item.text}</div>
                <div style={{
                  fontFamily: "var(--font-body)", fontSize: 11,
                  color: "var(--text-muted)", lineHeight: 1.3,
                }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Email capture */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          style={{ marginBottom: 24 }}
        >
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--text-muted)", margin: "0 0 12px",
          }}>
            Get 5 new AI tools delivered every Friday
          </p>
          <EmailCTA accent={accent} />
        </motion.div>

        {/* Skip link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={handleExplore}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--text-faint)", background: "none",
            border: "none", cursor: "pointer",
            padding: "8px 16px",
          }}
        >
          skip to tools ↓
        </motion.button>
      </div>

      {/* Featured categories strip at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85 }}
        style={{
          position: "absolute", bottom: 20, left: 0, right: 0,
          display: "flex", gap: 10, justifyContent: "center",
          flexWrap: "wrap", padding: "0 20px",
        }}
      >
        {CATEGORIES.filter((c) => c.id !== "all").slice(0, 6).map((cat) => (
          <span
            key={cat.id}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              color: cat.color, opacity: 0.6,
              background: `${cat.color}08`,
              border: `1px solid ${cat.color}15`,
              borderRadius: 4, padding: "3px 8px",
              letterSpacing: 0.5,
            }}
          >
            {cat.icon} {cat.label}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

function StatBlock({ value, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontWeight: 700,
        fontSize: 28, color, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text-muted)", letterSpacing: 1.5,
        marginTop: 4, textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}

function StepCard({ step, title, desc, color }) {
  return (
    <div style={{
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: 12, padding: "20px 18px",
      width: 200, textAlign: "left",
      transition: "border-color 0.2s",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        color, marginBottom: 8, letterSpacing: 1,
      }}>
        STEP {step}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
        color: "var(--text-strong)", marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "var(--font-body)", fontSize: 12,
        color: "var(--text-muted)", lineHeight: 1.4,
      }}>
        {desc}
      </div>
    </div>
  );
}
