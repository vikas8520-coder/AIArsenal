import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Bug Report", "Tool Suggestion", "Feature Request", "Other"];
const FEEDBACK_API = "/api/feedback";

function StarRating({ value, onChange, accent }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, padding: "2px 1px", lineHeight: 1,
            color: (hover || value) >= star ? accent : "var(--text-faint)",
            transition: "color 0.12s, transform 0.12s",
            transform: hover >= star ? "scale(1.15)" : "scale(1)",
          }}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", marginLeft: 6, alignSelf: "center" }}>
        {value ? `${value}/5` : "Rate us"}
      </span>
    </div>
  );
}

function TestimonialCard({ item, accent }) {
  return (
    <div style={{
      padding: "12px 14px", marginBottom: 8,
      background: "var(--surface-1)", borderRadius: 10,
      border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "var(--text-strong)" }}>
          {item.name}
        </span>
        <span style={{ fontSize: 12, color: accent, letterSpacing: 1 }}>
          {"★".repeat(item.rating)}
          <span style={{ color: "var(--text-faint)" }}>{"★".repeat(5 - item.rating)}</span>
        </span>
      </div>
      <p style={{
        fontFamily: "monospace", fontSize: 11, color: "var(--text-secondary)",
        margin: 0, lineHeight: 1.5,
      }}>
        {item.message}
      </p>
      {item.category && (
        <span style={{
          display: "inline-block", marginTop: 8,
          fontFamily: "monospace", fontSize: 9,
          background: `${accent}10`, color: accent,
          border: `1px solid ${accent}20`,
          borderRadius: 3, padding: "1px 6px",
        }}>
          {item.category}
        </span>
      )}
    </div>
  );
}

export default function FeedbackWidget({ accent = "#00f0ff" }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("feedback"); // feedback | wall
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [testimonials, setTestimonials] = useState([]);
  const [loadingWall, setLoadingWall] = useState(false);

  // Fetch approved testimonials when wall tab opens
  useEffect(() => {
    if (tab !== "wall" || !open) return;
    setLoadingWall(true);
    fetch(FEEDBACK_API)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTestimonials(data.testimonials || []);
      })
      .catch(() => {})
      .finally(() => setLoadingWall(false));
  }, [tab, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !category) return;

    setStatus("submitting");
    try {
      const res = await fetch(FEEDBACK_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonymous",
          category,
          message,
          rating: rating || 5,
          email: email || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        if (window.plausible) window.plausible("Feedback Submitted", { props: { category, rating } });
        // Fire-and-forget lead capture
        if (email.trim()) {
          fetch("/api/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), source: "feedback" }),
          }).catch(() => {});
        }
        setTimeout(() => {
          setStatus("idle");
          setCategory("");
          setMessage("");
          setName("");
          setEmail("");
          setRating(0);
        }, 2500);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const TABS = [
    { id: "feedback", label: "FEEDBACK" },
    { id: "wall", label: "WALL" },
  ];

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 50,
          width: 44, height: 44, borderRadius: 12,
          background: `${accent}20`, border: `1px solid ${accent}35`,
          color: accent, fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(12px)",
          boxShadow: `0 4px 20px ${accent}15`,
          transition: "background 0.15s",
        }}
        aria-label="Send feedback"
      >
        {open ? "✕" : "💬"}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", bottom: 74, right: 20, zIndex: 50,
              width: 340, maxHeight: 480, borderRadius: 14,
              background: "var(--surface-3)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--border-bright)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Tab bar */}
            <div style={{
              display: "flex", borderBottom: "1px solid var(--border)",
            }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, padding: "12px 0", cursor: "pointer",
                    fontFamily: "monospace", fontSize: 10, letterSpacing: 2,
                    background: "none", border: "none",
                    color: tab === t.id ? accent : "var(--text-faint)",
                    borderBottom: tab === t.id ? `2px solid ${accent}` : "2px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 0 }}>
              <AnimatePresence mode="wait">
                {tab === "feedback" ? (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {status === "success" ? (
                      <div style={{ padding: "40px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#00ff88" }}>
                          Thanks! Your feedback was recorded.
                        </span>
                        <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)", marginTop: 6 }}>
                          It may appear on the wall after review.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} style={{ padding: "12px 16px 16px" }}>
                        {/* Category chips */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCategory(cat)}
                              style={{
                                fontFamily: "monospace", fontSize: 10,
                                background: category === cat ? `${accent}20` : "var(--surface-1)",
                                border: `1px solid ${category === cat ? accent + "40" : "var(--border)"}`,
                                borderRadius: 5, padding: "4px 10px", cursor: "pointer",
                                color: category === cat ? accent : "var(--text-muted)",
                                transition: "all 0.12s",
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Star rating */}
                        <StarRating value={rating} onChange={setRating} accent={accent} />

                        {/* Name */}
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Name (optional)"
                          style={{
                            width: "100%", padding: "8px 11px",
                            background: "var(--surface-1)", border: "1px solid var(--border)",
                            borderRadius: 8, color: "var(--text-strong)", fontSize: 11,
                            fontFamily: "monospace", outline: "none",
                            boxSizing: "border-box", marginBottom: 8,
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        />

                        {/* Message */}
                        <textarea
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="What's on your mind?"
                          rows={3}
                          style={{
                            width: "100%", padding: "9px 11px",
                            background: "var(--surface-1)", border: "1px solid var(--border)",
                            borderRadius: 8, color: "var(--text-strong)", fontSize: 12,
                            fontFamily: "monospace", outline: "none", resize: "vertical",
                            lineHeight: 1.5, boxSizing: "border-box", marginBottom: 8,
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        />

                        {/* Email */}
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email (optional, for follow-up)"
                          style={{
                            width: "100%", padding: "8px 11px",
                            background: "var(--surface-1)", border: "1px solid var(--border)",
                            borderRadius: 8, color: "var(--text-strong)", fontSize: 11,
                            fontFamily: "monospace", outline: "none",
                            boxSizing: "border-box", marginBottom: 10,
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        />

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={!message.trim() || !category || status === "submitting"}
                          style={{
                            width: "100%", fontFamily: "monospace", fontSize: 11,
                            background: `${accent}20`, color: accent,
                            border: `1px solid ${accent}35`,
                            borderRadius: 7, padding: "9px 16px",
                            cursor: (!message.trim() || !category || status === "submitting") ? "not-allowed" : "pointer",
                            opacity: (!message.trim() || !category || status === "submitting") ? 0.5 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {status === "submitting" ? "Sending..." : "Send Feedback"}
                        </button>

                        {status === "error" && (
                          <p style={{ fontFamily: "monospace", fontSize: 10, color: "#ff6b6b", margin: "8px 0 0", textAlign: "center" }}>
                            Failed to send. Try again.
                          </p>
                        )}
                      </form>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="wall"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    style={{ padding: "12px 14px 16px" }}
                  >
                    {loadingWall ? (
                      <div style={{ textAlign: "center", padding: "30px 0" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
                          Loading...
                        </span>
                      </div>
                    ) : testimonials.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px 0" }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>🗨</div>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
                          No testimonials yet.
                        </span>
                        <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
                          Be the first to share your experience!
                        </p>
                        <button
                          onClick={() => setTab("feedback")}
                          style={{
                            marginTop: 10, fontFamily: "monospace", fontSize: 10,
                            background: `${accent}15`, color: accent,
                            border: `1px solid ${accent}25`, borderRadius: 6,
                            padding: "6px 14px", cursor: "pointer",
                          }}
                        >
                          Leave Feedback →
                        </button>
                      </div>
                    ) : (
                      testimonials.map((t, i) => (
                        <TestimonialCard key={i} item={t} accent={accent} />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
