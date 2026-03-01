import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Bug Report", "Tool Suggestion", "Feature Request", "Other"];
const FORMSPREE_ID = "YOUR_FORMSPREE_ID"; // Replace with real Formspree form ID

export default function FeedbackWidget({ accent = "#00f0ff" }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !category) return;

    setStatus("submitting");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          email: email || "(not provided)",
          _subject: `[AIArsenal Feedback] ${category}`,
        }),
      });
      if (res.ok) {
        setStatus("success");
        if (window.plausible) window.plausible("Feedback Submitted", { props: { category } });
        setTimeout(() => {
          setOpen(false);
          setStatus("idle");
          setCategory("");
          setMessage("");
          setEmail("");
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

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
        {open ? "x" : "?"}
      </motion.button>

      {/* Feedback panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", bottom: 74, right: 20, zIndex: 50,
              width: 320, borderRadius: 14,
              background: "var(--surface-3)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--border-bright)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{
                fontFamily: "monospace", fontSize: 10, color: accent,
                letterSpacing: 2,
              }}>
                FEEDBACK
              </span>
            </div>

            {status === "success" ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#00ff88" }}>
                  Thanks! Your feedback was sent.
                </span>
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

                {/* Email (optional) */}
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
        )}
      </AnimatePresence>
    </>
  );
}
