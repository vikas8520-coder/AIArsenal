import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONVERTKIT_FORM_ID = "YOUR_FORM_ID";
const CONVERTKIT_API_KEY = "YOUR_API_KEY";
const STORAGE_KEY = "aiarsenal-email-dismissed";

export default function EmailCapture({ accent = "#00f0ff", compact = false }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) setDismissed(true);
    } catch {}
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === "submitting") return;

    setStatus("submitting");
    try {
      const res = await fetch(
        `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: CONVERTKIT_API_KEY, email }),
        }
      );
      if (res.ok) {
        setStatus("success");
        // Fire Plausible custom event
        if (window.plausible) window.plausible("Email Signup");
        // Log lead to Airtable (fire-and-forget)
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "email_capture" }),
        }).catch(() => {});
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          padding: compact ? "16px 20px" : "24px 20px",
          margin: compact ? "16px 0 0" : "20px 0",
        }}
      >
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#00ff88" }}>
          You're in. We'll notify you when new tools drop.
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        position: "relative",
        textAlign: "center",
        padding: compact ? "20px 20px" : "28px 24px",
        margin: compact ? "20px 0 0" : "24px 0",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 14,
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          position: "absolute", top: 10, right: 12,
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "monospace", fontSize: 12, color: "var(--text-faint)",
          padding: "2px 6px", lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        x
      </button>

      <p style={{
        fontFamily: "monospace", fontSize: compact ? 11 : 12,
        color: "var(--text-secondary)", margin: "0 0 12px",
      }}>
        Get notified when new AI tools are added
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex", gap: 8,
          justifyContent: "center", alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            fontFamily: "monospace", fontSize: 11,
            background: "var(--surface-2)",
            border: "1px solid var(--border-bright)",
            borderRadius: 6, padding: "8px 12px",
            color: "var(--text-strong)", outline: "none",
            width: compact ? 180 : 220,
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-bright)"; }}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          style={{
            fontFamily: "monospace", fontSize: 11,
            background: `${accent}20`, color: accent,
            border: `1px solid ${accent}35`,
            borderRadius: 6, padding: "8px 16px",
            cursor: status === "submitting" ? "wait" : "pointer",
            transition: "all 0.15s",
            opacity: status === "submitting" ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (status !== "submitting") e.currentTarget.style.background = `${accent}30`; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}20`; }}
        >
          {status === "submitting" ? "..." : "Notify me"}
        </button>
      </form>

      {status === "error" && (
        <p style={{ fontFamily: "monospace", fontSize: 10, color: "#ff6b6b", margin: "8px 0 0" }}>
          Something went wrong. Try again.
        </p>
      )}

      <p style={{
        fontFamily: "monospace", fontSize: 8.5,
        color: "var(--text-faint)", margin: "14px 0 0",
        lineHeight: 1.5, opacity: 0.6,
      }}>
        Some links on this site are affiliate links. We may earn a commission at no extra cost to you.
      </p>
    </motion.div>
  );
}
