"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOOL_CATEGORIES = [
  "Developer Tools",
  "End-User Tools",
  "Creative AI",
  "Open-Source Models",
  "Infrastructure",
  "Research & Education",
  "Automation & Agents",
  "Business AI",
  "Safety & Ethics",
  "Token Economy",
  "AI Income",
  "Cost Optimization",
  "Personal AI Systems",
];

const inputStyle = {
  width: "100%",
  padding: "8px 11px",
  background: "var(--surface-1)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-strong)",
  fontSize: 11,
  fontFamily: "monospace",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 8,
};

export default function ToolSubmitForm({ open, onClose, accent = "#00f0ff" }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [freeTier, setFreeTier] = useState("");
  const [company, setCompany] = useState("");
  const [oss, setOss] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const resetForm = () => {
    setName(""); setUrl(""); setCategory(""); setDescription("");
    setFreeTier(""); setCompany(""); setOss(false); setEmail("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !category) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/submit-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          category,
          description: description.trim(),
          free_tier: freeTier.trim(),
          company: company.trim(),
          oss,
          submitter_email: email.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        if (window.plausible) window.plausible("Tool Submitted", { props: { category } });
        // Fire-and-forget lead capture
        if (email.trim()) {
          fetch("/api/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), source: "tool_submission" }),
          }).catch(() => {});
        }
        setTimeout(() => {
          setStatus("idle");
          resetForm();
          onClose();
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const focusHandler = (e) => { e.currentTarget.style.borderColor = accent; };
  const blurHandler = (e) => { e.currentTarget.style.borderColor = "var(--border)"; };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 61,
              width: 380, maxHeight: "85vh",
              borderRadius: 14,
              background: "var(--surface-3)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--border-bright)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderBottom: "1px solid var(--border)",
            }}>
              <span style={{
                fontFamily: "monospace", fontSize: 11, fontWeight: 600,
                color: accent, letterSpacing: 1.5,
              }}>
                + SUBMIT A TOOL
              </span>
              <button
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "monospace", fontSize: 14, color: "var(--text-faint)",
                  padding: "2px 6px", lineHeight: 1,
                }}
              >
                x
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
              {status === "success" ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#00ff88" }}>
                    Tool submitted for review!
                  </span>
                  <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)", marginTop: 6 }}>
                    We'll review it and add it to the arsenal.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Tool name */}
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tool name *"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />

                  {/* URL */}
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tool-url.com *"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />

                  {/* Category dropdown */}
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      color: category ? "var(--text-strong)" : "var(--text-faint)",
                    }}
                  >
                    <option value="" disabled>Category *</option>
                    {TOOL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Description */}
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description"
                    rows={2}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      lineHeight: 1.5,
                      fontSize: 11,
                    }}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />

                  {/* Free tier */}
                  <input
                    type="text"
                    value={freeTier}
                    onChange={(e) => setFreeTier(e.target.value)}
                    placeholder="Free tier details (e.g. 100 req/day)"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />

                  {/* Company */}
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company / Creator"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />

                  {/* OSS checkbox */}
                  <label style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "monospace", fontSize: 11, color: "var(--text-secondary)",
                    marginBottom: 8, cursor: "pointer",
                  }}>
                    <input
                      type="checkbox"
                      checked={oss}
                      onChange={(e) => setOss(e.target.checked)}
                      style={{ accentColor: accent }}
                    />
                    Open source
                  </label>

                  {/* Email */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional, for updates)"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={!name.trim() || !url.trim() || !category || status === "submitting"}
                    style={{
                      width: "100%", fontFamily: "monospace", fontSize: 11,
                      background: `${accent}20`, color: accent,
                      border: `1px solid ${accent}35`,
                      borderRadius: 7, padding: "9px 16px",
                      cursor: (!name.trim() || !url.trim() || !category || status === "submitting") ? "not-allowed" : "pointer",
                      opacity: (!name.trim() || !url.trim() || !category || status === "submitting") ? 0.5 : 1,
                      transition: "all 0.15s",
                      marginTop: 4,
                    }}
                  >
                    {status === "submitting" ? "Submitting..." : "Submit Tool"}
                  </button>

                  {status === "error" && (
                    <p style={{ fontFamily: "monospace", fontSize: 10, color: "#ff6b6b", margin: "8px 0 0", textAlign: "center" }}>
                      Failed to submit. Try again.
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
