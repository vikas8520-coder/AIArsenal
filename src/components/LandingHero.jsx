"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { TOOLS, STATS } from "../data/tools";
import { CATEGORIES, getCategoryById } from "../data/categories";

// ── Constants ──────────────────────────────────────────────────────────────
const categoryCount = CATEGORIES.filter((c) => c.id !== "all").length;
const uniqueCompanies = new Set(TOOLS.map((t) => t.company)).size;

// Curated showcase tools (mix of popular + diverse categories)
const SHOWCASE_IDS = ["d3", "e1", "d9", "e2", "d24", "c1", "a5", "d8"];
const showcaseTools = SHOWCASE_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);

// All tools for marquee
const marqueeTools = [...TOOLS]
  .sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""))
  .slice(0, 24);

// ── Spring configs ─────────────────────────────────────────────────────────
const springBounce = { type: "spring", stiffness: 260, damping: 22 };
const springSmooth = { type: "spring", stiffness: 120, damping: 20 };

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
    <form onSubmit={handleSubmit} style={{
      display: "flex", gap: 0, maxWidth: 420, width: "100%",
      background: "var(--surface-2)",
      border: "1px solid var(--border-bright)",
      borderRadius: 12, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          fontFamily: "var(--font-mono)", fontSize: 13,
          background: "transparent", border: "none",
          padding: "12px 16px", color: "var(--text-strong)",
          outline: "none", flex: 1, minWidth: 0,
        }}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
          background: accent, color: "#0a0a0a",
          border: "none", padding: "12px 20px",
          cursor: status === "submitting" ? "wait" : "pointer",
          transition: "all 0.15s", whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {status === "submitting" ? "..." : "Get Weekly Picks →"}
      </button>
    </form>
  );
}

// ── ToolPreviewCard ────────────────────────────────────────────────────────
function ToolPreviewCard({ tool, index, accent }) {
  const cat = getCategoryById(tool.category);
  const color = cat?.color || accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...springBounce, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        background: "linear-gradient(135deg, var(--surface-2), var(--surface-1))",
        border: "1px solid var(--border)",
        borderRadius: 14, padding: "18px 16px",
        cursor: "pointer", position: "relative",
        overflow: "hidden", minWidth: 0,
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.6,
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 14, color,
          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
          background: `${color}12`, borderRadius: 8,
        }}>
          {cat?.icon}
        </span>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
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
        fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px",
        lineHeight: 1.45, fontFamily: "var(--font-body)",
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {tool.desc}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          background: `${color}12`, color, border: `1px solid ${color}20`,
          borderRadius: 4, padding: "2px 7px",
        }}>
          {tool.oss ? "OPEN SOURCE" : "FREE TIER"}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          color: "var(--text-faint)",
        }}>
          {tool.subcategory}
        </span>
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
      maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
      WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
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
              padding: "6px 12px",
              background: "var(--surface-1)", border: "1px solid var(--border)",
              borderRadius: 8, whiteSpace: "nowrap",
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
                  borderRadius: 2, fontFamily: "var(--font-mono)", fontWeight: 700,
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

// ── Feature pill ───────────────────────────────────────────────────────────
function FeaturePill({ icon, title, desc, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...springSmooth, delay: index * 0.1 }}
      style={{
        flex: "1 1 220px", maxWidth: 280,
        padding: "20px 18px",
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: 14, textAlign: "center",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${color}10`, border: `1px solid ${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px", fontSize: 18,
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
        color: "var(--text-strong)", marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "var(--font-body)", fontSize: 12,
        color: "var(--text-muted)", lineHeight: 1.5,
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
        overflowY: "auto", overflowX: "hidden",
      }}
    >
      {/* Mouse-follow spotlight */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(800px circle at ${mouse.x}% ${mouse.y}%, ${accent}08, transparent 40%)`,
        transition: "background 0.3s ease",
      }} />

      {/* Floating orbs */}
      <div style={{
        position: "fixed", top: "10%", left: "15%",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}20, transparent 65%)`,
        filter: "blur(80px)", pointerEvents: "none",
        animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", bottom: "5%", right: "10%",
        width: 450, height: 450, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 65%)",
        filter: "blur(80px)", pointerEvents: "none",
        animation: "float 10s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "fixed", top: "50%", right: "30%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,136,0.08), transparent 65%)",
        filter: "blur(60px)", pointerEvents: "none",
        animation: "float 12s ease-in-out infinite 2s",
      }} />

      {/* ─── HERO SECTION ─── */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1, padding: "60px 16px 40px",
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springBounce, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
            color: accent, background: `${accent}10`,
            border: `1px solid ${accent}20`, borderRadius: 20,
            padding: "5px 14px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: accent, display: "inline-block",
            animation: "pulse 2s ease-in-out infinite",
          }} />
          {STATS.total}+ tools · Updated weekly
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: 0.15 }}
          style={{
            fontFamily: "var(--font-mono)", fontWeight: 800,
            fontSize: "clamp(36px, 6vw, 64px)",
            color: "var(--text-strong)",
            margin: "0 0 6px", letterSpacing: -1.5,
            lineHeight: 1.05, textAlign: "center",
          }}
        >
          Your AI stack,{" "}
          <span style={{
            background: `linear-gradient(135deg, ${accent}, #b388ff)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            curated
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: 0.25 }}
          style={{
            fontFamily: "var(--font-body)", fontSize: "clamp(16px, 2.2vw, 20px)",
            color: "var(--text-secondary)", textAlign: "center",
            margin: "0 0 36px", lineHeight: 1.6,
            maxWidth: 520,
          }}
        >
          {STATS.total}+ free AI tools, credits, and systems — discover, compare,
          and build your perfect stack in minutes.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: 0.35 }}
          style={{
            display: "flex", gap: 12, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 44,
          }}
        >
          <motion.button
            onClick={handleExplore}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
              background: accent, color: "#0a0a0a",
              border: "none", borderRadius: 11,
              padding: "14px 36px", cursor: "pointer",
              boxShadow: `0 4px 24px ${accent}40, 0 0 60px ${accent}15`,
              letterSpacing: 0.3,
            }}
          >
            Explore Tools →
          </motion.button>
          <motion.button
            onClick={() => {
              const emailSection = document.getElementById("hero-email");
              if (emailSection) emailSection.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
              background: "var(--surface-2)", color: "var(--text-strong)",
              border: "1px solid var(--border-bright)", borderRadius: 11,
              padding: "14px 28px", cursor: "pointer",
            }}
          >
            Get Weekly Picks
          </motion.button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: 0.45 }}
          style={{
            display: "flex", gap: "clamp(20px, 5vw, 40px)", justifyContent: "center",
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
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ width: "100vw", marginBottom: 20 }}
        >
          <ToolMarquee />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          style={{
            marginTop: 12,
            animation: "float 3s ease-in-out infinite",
          }}
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

      {/* ─── SHOWCASE SECTION ─── */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "60px 24px 80px", maxWidth: 900,
        width: "100%", margin: "0 auto",
      }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={springSmooth}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: accent, letterSpacing: 2, fontWeight: 600,
            display: "block", marginBottom: 10,
          }}>
            FEATURED TOOLS
          </span>
          <h2 style={{
            fontFamily: "var(--font-mono)", fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700, color: "var(--text-strong)",
            margin: 0, lineHeight: 1.2,
          }}>
            From coding assistants to{" "}
            <span style={{ color: "#b388ff" }}>creative AI</span>
          </h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: 15,
            color: "var(--text-muted)", margin: "10px 0 0",
          }}>
            A taste of what you'll find inside
          </p>
        </motion.div>

        {/* Tool grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 60,
        }}>
          {showcaseTools.map((tool, i) => (
            <ToolPreviewCard key={tool.id} tool={tool} index={i} accent={accent} />
          ))}
        </div>

        {/* Why AIArsenal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={springSmooth}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "#00ff88", letterSpacing: 2, fontWeight: 600,
            display: "block", marginBottom: 10,
          }}>
            WHY AIARSENAL
          </span>
          <h2 style={{
            fontFamily: "var(--font-mono)", fontSize: "clamp(22px, 3.5vw, 32px)",
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
          display: "flex", gap: 14, justifyContent: "center",
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springSmooth}
          style={{
            textAlign: "center",
            padding: "40px 24px",
            background: "linear-gradient(135deg, var(--surface-2), var(--surface-1))",
            border: "1px solid var(--border)",
            borderRadius: 20,
            marginBottom: 48,
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Subtle glow */}
          <div style={{
            position: "absolute", top: "-50%", left: "50%",
            transform: "translateX(-50%)", width: 400, height: 200,
            background: `radial-gradient(ellipse, ${accent}10, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <h3 style={{
            fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700,
            color: "var(--text-strong)", margin: "0 0 6px",
            position: "relative",
          }}>
            Stay ahead of the curve
          </h3>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: 14,
            color: "var(--text-muted)", margin: "0 0 20px",
            position: "relative",
          }}>
            5 new AI tools delivered to your inbox every Friday
          </p>
          <div style={{
            display: "flex", justifyContent: "center",
            position: "relative",
          }}>
            <EmailCTA accent={accent} />
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springSmooth}
          style={{ textAlign: "center" }}
        >
          <motion.button
            onClick={handleExplore}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700,
              background: accent, color: "#0a0a0a",
              border: "none", borderRadius: 12,
              padding: "16px 48px", cursor: "pointer",
              boxShadow: `0 4px 32px ${accent}40, 0 0 80px ${accent}10`,
              letterSpacing: 0.3, marginBottom: 16,
            }}
          >
            Explore {STATS.total}+ Tools →
          </motion.button>
          <br />
          <button
            onClick={handleExplore}
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
    </section>
  );
}

// ── StatBlock ──────────────────────────────────────────────────────────────
function StatBlock({ value, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontWeight: 800,
        fontSize: 32, color, lineHeight: 1,
        letterSpacing: -0.5,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: "var(--text-faint)", letterSpacing: 2,
        marginTop: 6, textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}
