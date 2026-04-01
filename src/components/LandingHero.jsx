"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { TOOLS, STATS } from "../data/tools";
import { CATEGORIES, getCategoryById } from "../data/categories";

// ── Constants ──────────────────────────────────────────────────────────────
const categoryCount = CATEGORIES.filter((c) => c.id !== "all").length;
const uniqueCompanies = new Set(TOOLS.map((t) => t.company)).size;

const SHOWCASE_IDS = ["d3", "e1", "d9", "e2", "d24", "c1", "a5", "d8"];
const showcaseTools = SHOWCASE_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);

const marqueeTools = [...TOOLS]
  .sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""))
  .slice(0, 24);

// ── Easing ─────────────────────────────────────────────────────────────────
const springBounce = { type: "spring", stiffness: 260, damping: 22 };
const springSmooth = { type: "spring", stiffness: 120, damping: 20 };
const bounceEase = [0.6, 0.5, 0, 1.4]; // StringTune-inspired bounce

// ── Word-by-word reveal ────────────────────────────────────────────────────
function StaggerWords({ text, style, delay = 0, gradient }) {
  const words = text.split(" ");
  return (
    <span style={{ ...style, display: "inline" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.08,
            ease: bounceEase,
          }}
          style={{
            display: "inline-block",
            marginRight: "0.3em",
            ...(gradient ? {
              background: gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            } : {}),
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ── AnimatedNumber ─────────────────────────────────────────────────────────
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

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

// ── EmailCTA ───────────────────────────────────────────────────────────────
function EmailCTA({ accent }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [hovered, setHovered] = useState(false);

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springBounce}
        style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#00ff88", margin: 0 }}
      >
        ✓ You're in. Weekly picks incoming.
      </motion.p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 0, maxWidth: 420, width: "100%",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        border: `1px solid ${hovered ? `${accent}40` : "var(--border-bright)"}`,
        borderRadius: 14, overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: hovered ? `0 0 30px ${accent}10` : "none",
      }}
    >
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          fontFamily: "var(--font-mono)", fontSize: 13,
          background: "transparent", border: "none",
          padding: "14px 16px", color: "var(--text-strong)",
          outline: "none", flex: 1, minWidth: 0,
        }}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="landing-btn-glow"
        style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
          background: accent, color: "#0a0a0a",
          border: "none", padding: "14px 22px",
          cursor: status === "submitting" ? "wait" : "pointer",
          whiteSpace: "nowrap", flexShrink: 0,
          position: "relative", overflow: "hidden",
        }}
      >
        {status === "submitting" ? "..." : "Get Weekly Picks →"}
      </button>
    </form>
  );
}

// ── GlassToolCard (upgraded glassmorphism) ─────────────────────────────────
function GlassToolCard({ tool, index, accent }) {
  const cat = getCategoryById(tool.category);
  const color = cat?.color || accent;
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: bounceEase }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(16px) saturate(200%)",
        WebkitBackdropFilter: "blur(16px) saturate(200%)",
        border: `1px solid ${hovered ? `${color}30` : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, padding: "20px 18px",
        cursor: "pointer", position: "relative",
        overflow: "hidden", minWidth: 0,
        transition: "border-color 0.3s, transform 0.3s cubic-bezier(.6,.5,0,1.4)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
      }}
    >
      {/* Card spotlight glow (follows mouse) */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, ${color}12, transparent 50%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s",
      }} />

      {/* Top accent line with glow */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: hovered ? 0.8 : 0.3,
        transition: "opacity 0.3s",
        boxShadow: hovered ? `0 0 20px ${color}40` : "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, position: "relative" }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 16, color,
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          background: `${color}10`, borderRadius: 10,
          border: `1px solid ${color}15`,
        }}>
          {cat?.icon}
        </span>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
            color: "var(--text-strong)", lineHeight: 1.2,
          }}>
            {tool.name}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-faint)",
            letterSpacing: 0.5,
          }}>
            {tool.company}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 12px",
        lineHeight: 1.5, fontFamily: "var(--font-body)",
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
        position: "relative",
      }}>
        {tool.desc}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          background: `${color}10`, color, border: `1px solid ${color}18`,
          borderRadius: 6, padding: "3px 8px",
        }}>
          {tool.oss ? "OPEN SOURCE" : "FREE TIER"}
        </span>
        <motion.span
          animate={{ x: hovered ? 3 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, color }}
        >
          →
        </motion.span>
      </div>
    </motion.div>
  );
}

// ── Marquee ────────────────────────────────────────────────────────────────
function ToolMarquee() {
  const doubled = [...marqueeTools, ...marqueeTools];
  return (
    <div style={{
      overflow: "hidden", width: "100%",
      maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
    }}>
      <div style={{
        display: "flex", gap: 12, width: "max-content",
        animation: "marquee 60s linear infinite",
      }}>
        {doubled.map((tool, i) => {
          const cat = getCategoryById(tool.category);
          return (
            <div key={`${tool.id}-${i}`} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px",
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 11, color: cat?.color }}>{cat?.icon}</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                color: "var(--text-secondary)",
              }}>
                {tool.name}
              </span>
              {tool.oss && (
                <span style={{
                  fontSize: 7, padding: "1px 4px",
                  background: "rgba(0,255,136,0.1)", color: "#00ff88",
                  borderRadius: 3, fontFamily: "var(--font-mono)", fontWeight: 700,
                }}>
                  OSS
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section Divider (animated line) ────────────────────────────────────────
function SectionDivider({ color = "var(--border)" }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: 1, background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        margin: "48px auto", maxWidth: 400, transformOrigin: "center",
      }}
    />
  );
}

// ── Feature pill (glassmorphism upgrade) ───────────────────────────────────
function FeaturePill({ icon, title, desc, color, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: bounceEase }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 200px", maxWidth: 260,
        padding: "24px 20px",
        background: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        border: `1px solid ${hovered ? `${color}25` : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, textAlign: "center",
        transition: "border-color 0.3s, transform 0.3s cubic-bezier(.6,.5,0,1.4), box-shadow 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 40px ${color}08` : "none",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: `${color}0c`, border: `1px solid ${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 14px", fontSize: 20,
        transition: "transform 0.3s cubic-bezier(.6,.5,0,1.4)",
        transform: hovered ? "scale(1.1)" : "scale(1)",
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
        color: "var(--text-strong)", marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "var(--font-body)", fontSize: 12.5,
        color: "var(--text-muted)", lineHeight: 1.55,
      }}>
        {desc}
      </div>
    </motion.div>
  );
}

// ── Main LandingHero ───────────────────────────────────────────────────────
export default function LandingHero({ accent = "#00f0ff", onExplore }) {
  const [visible, setVisible] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const heroRef = useRef(null);
  const scrollRef = useRef(null);

  // Scroll-driven parallax
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orbY3 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const bgBrightness = useTransform(scrollYProgress, [0, 0.3], [1, 0.7]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("aiarsenal-hero-seen")) setVisible(false);
    } catch {}
  }, []);

  const handleExplore = () => {
    setVisible(false);
    try { sessionStorage.setItem("aiarsenal-hero-seen", "1"); } catch {}
    if (onExplore) onExplore();
  };

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  if (!visible) return null;

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="landing-hero"
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Scroll progress bar */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 210,
          height: 2, width: progressWidth,
          background: `linear-gradient(90deg, ${accent}, #b388ff)`,
        }}
      />

      {/* Mouse-follow spotlight */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(900px circle at ${mouse.x}% ${mouse.y}%, ${accent}06, transparent 40%)`,
        transition: "background 0.15s ease",
      }} />

      {/* Floating orbs with scroll parallax */}
      <motion.div style={{
        position: "fixed", top: "8%", left: "12%",
        width: 550, height: 550, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18, transparent 60%)`,
        filter: "blur(80px)", pointerEvents: "none",
        animation: "float 8s ease-in-out infinite",
        y: orbY1,
      }} />
      <motion.div style={{
        position: "fixed", bottom: "5%", right: "8%",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.14), transparent 60%)",
        filter: "blur(80px)", pointerEvents: "none",
        animation: "float 10s ease-in-out infinite reverse",
        y: orbY2,
      }} />
      <motion.div style={{
        position: "fixed", top: "45%", right: "25%",
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,136,0.07), transparent 60%)",
        filter: "blur(60px)", pointerEvents: "none",
        animation: "float 12s ease-in-out infinite 2s",
        y: orbY3,
      }} />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          position: "relative", zIndex: 1,
        }}
      >
        {/* ─── HERO SECTION ─── */}
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "60px 16px 40px",
        }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: bounceEase }}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
              color: accent, background: `${accent}08`,
              border: `1px solid ${accent}18`, borderRadius: 20,
              padding: "6px 16px", marginBottom: 24,
              display: "flex", alignItems: "center", gap: 7,
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: accent, display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
              boxShadow: `0 0 8px ${accent}60`,
            }} />
            {STATS.total}+ tools · Updated weekly
          </motion.div>

          {/* Title with word-by-word reveal */}
          <h1 style={{
            fontFamily: "var(--font-mono)", fontWeight: 800,
            fontSize: "clamp(36px, 6vw, 68px)",
            color: "var(--text-strong)",
            margin: "0 0 8px", letterSpacing: -2,
            lineHeight: 1.05, textAlign: "center",
          }}>
            <StaggerWords text="Your AI stack," delay={0.2} />
            <br />
            <StaggerWords
              text="curated"
              delay={0.55}
              gradient={`linear-gradient(135deg, ${accent}, #b388ff, #ff6b9d)`}
            />
          </h1>

          {/* Tagline with stagger */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: bounceEase }}
            style={{
              fontFamily: "var(--font-body)", fontSize: "clamp(16px, 2.2vw, 20px)",
              color: "var(--text-secondary)", textAlign: "center",
              margin: "0 0 40px", lineHeight: 1.6,
              maxWidth: 520,
            }}
          >
            {STATS.total}+ free AI tools, credits, and systems — discover, compare,
            and build your perfect stack in minutes.
          </motion.p>

          {/* CTA buttons with animated borders */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.95, ease: bounceEase }}
            style={{
              display: "flex", gap: 14, justifyContent: "center",
              flexWrap: "wrap", marginBottom: 48,
            }}
          >
            <motion.button
              onClick={handleExplore}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="landing-btn-glow"
              style={{
                fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700,
                background: accent, color: "#0a0a0a",
                border: "none", borderRadius: 12,
                padding: "15px 40px", cursor: "pointer",
                boxShadow: `0 4px 28px ${accent}45, 0 0 80px ${accent}12`,
                letterSpacing: 0.3, position: "relative", overflow: "hidden",
              }}
            >
              Explore Tools →
            </motion.button>
            <motion.button
              onClick={() => {
                const el = document.getElementById("hero-email");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600,
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                color: "var(--text-strong)",
                border: "1px solid var(--border-bright)", borderRadius: 12,
                padding: "15px 32px", cursor: "pointer",
                transition: "border-color 0.3s",
              }}
            >
              Get Weekly Picks
            </motion.button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            style={{
              display: "flex", gap: "clamp(24px, 5vw, 48px)", justifyContent: "center",
              flexWrap: "wrap", marginBottom: 48,
            }}
          >
            <StatBlock value={<AnimatedNumber target={STATS.total} suffix="+" />} label="AI Tools" color={accent} />
            <StatBlock value={<AnimatedNumber target={categoryCount} />} label="Categories" color="#ff6b9d" />
            <StatBlock value={<AnimatedNumber target={STATS.oss} suffix="+" />} label="Open Source" color="#00ff88" />
            <StatBlock value={<AnimatedNumber target={uniqueCompanies} suffix="+" />} label="Companies" color="#ffd700" />
          </motion.div>

          {/* Tool marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 1 }}
            style={{ width: "100vw", marginBottom: 24 }}
          >
            <ToolMarquee />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2 }}
            style={{ marginTop: 16, animation: "float 3s ease-in-out infinite" }}
          >
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--text-faint)", display: "flex",
              flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              scroll
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </motion.div>
        </div>

        {/* Section divider */}
        <SectionDivider color={accent} />

        {/* ─── SHOWCASE SECTION ─── */}
        <div style={{
          padding: "20px 24px 80px", maxWidth: 900,
          width: "100%", margin: "0 auto",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: bounceEase }}
            style={{ textAlign: "center", marginBottom: 44 }}
          >
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: accent, letterSpacing: 3, fontWeight: 600,
              display: "block", marginBottom: 12,
            }}>
              FEATURED TOOLS
            </span>
            <h2 style={{
              fontFamily: "var(--font-mono)", fontSize: "clamp(24px, 4vw, 38px)",
              fontWeight: 700, color: "var(--text-strong)",
              margin: 0, lineHeight: 1.15,
            }}>
              From coding assistants to{" "}
              <span style={{
                background: "linear-gradient(135deg, #b388ff, #ff6b9d)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                creative AI
              </span>
            </h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 15,
              color: "var(--text-muted)", margin: "12px 0 0",
            }}>
              A taste of what you'll find inside
            </p>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: 16, marginBottom: 60,
          }}>
            {showcaseTools.map((tool, i) => (
              <GlassToolCard key={tool.id} tool={tool} index={i} accent={accent} />
            ))}
          </div>

          <SectionDivider color="#b388ff" />

          {/* Why AIArsenal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: bounceEase }}
            style={{ textAlign: "center", marginBottom: 36, marginTop: 20 }}
          >
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "#00ff88", letterSpacing: 3, fontWeight: 600,
              display: "block", marginBottom: 12,
            }}>
              WHY AIARSENAL
            </span>
            <h2 style={{
              fontFamily: "var(--font-mono)", fontSize: "clamp(22px, 3.5vw, 34px)",
              fontWeight: 700, color: "var(--text-strong)",
              margin: "0 0 8px",
            }}>
              Not another AI list
            </h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 14,
              color: "var(--text-muted)", margin: 0,
            }}>
              Every tool vetted. Every free tier verified. Zero fluff.
            </p>
          </motion.div>

          <div style={{
            display: "flex", gap: 16, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 64,
          }}>
            <FeaturePill index={0} icon="◎" title="Curated" desc="Manually vetted — no scraped junk or dead links" color={accent} />
            <FeaturePill index={1} icon="⚡" title="AI Search" desc="Semantic search understands what you mean, not just keywords" color="#b388ff" />
            <FeaturePill index={2} icon="◈" title="Privacy Flags" desc="Know which tools train on your data before you sign up" color="#ff6b9d" />
            <FeaturePill index={3} icon="∞" title="100% Free" desc="No paywalls, no premium tier. Every feature open to everyone" color="#00ff88" />
          </div>

          {/* Email capture */}
          <motion.div
            id="hero-email"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: bounceEase }}
            style={{
              textAlign: "center",
              padding: "44px 28px",
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(16px) saturate(200%)",
              WebkitBackdropFilter: "blur(16px) saturate(200%)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 22,
              marginBottom: 52,
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: "-40%", left: "50%",
              transform: "translateX(-50%)", width: 500, height: 250,
              background: `radial-gradient(ellipse, ${accent}0a, transparent 65%)`,
              pointerEvents: "none",
            }} />
            <h3 style={{
              fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700,
              color: "var(--text-strong)", margin: "0 0 8px",
              position: "relative",
            }}>
              Stay ahead of the curve
            </h3>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 14,
              color: "var(--text-muted)", margin: "0 0 22px",
              position: "relative",
            }}>
              5 new AI tools delivered to your inbox every Friday
            </p>
            <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
              <EmailCTA accent={accent} />
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: bounceEase }}
            style={{ textAlign: "center" }}
          >
            <motion.button
              onClick={handleExplore}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="landing-btn-glow"
              style={{
                fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700,
                background: accent, color: "#0a0a0a",
                border: "none", borderRadius: 14,
                padding: "18px 52px", cursor: "pointer",
                boxShadow: `0 4px 36px ${accent}45, 0 0 100px ${accent}10`,
                letterSpacing: 0.3, marginBottom: 16,
                position: "relative", overflow: "hidden",
              }}
            >
              Explore {STATS.total}+ Tools →
            </motion.button>
            <br />
            <button
              onClick={handleExplore}
              className="landing-link-underline"
              style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--text-faint)", background: "none",
                border: "none", cursor: "pointer", padding: "8px 16px",
              }}
            >
              skip to directory ↓
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── StatBlock ──────────────────────────────────────────────────────────────
function StatBlock({ value, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontWeight: 800,
        fontSize: 34, color, lineHeight: 1,
        letterSpacing: -0.5,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: "var(--text-faint)", letterSpacing: 2.5,
        marginTop: 8, textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}
