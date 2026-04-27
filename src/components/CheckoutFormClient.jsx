"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ACCENT = "#eab308";

const TIERS = {
  featured: {
    name: "Featured",
    price: "$99/mo",
    benefits: [
      "Pinned to the top of its category with FEATURED badge",
      "Affiliate link tracking + UTM attribution",
      "Newsletter feature (20K+ subscribers)",
      "Priority in /quiz and /ask recommendations",
      "Live in 48 hours · cancel anytime",
    ],
  },
  partner: {
    name: "Partner",
    price: "$299/mo",
    benefits: [
      "Everything in Featured, plus:",
      "Dedicated /compare page (your tool vs N alternatives)",
      "Editorial blog post (1,500+ words, SEO-optimized)",
      "Custom landing page at /partners/[your-tool]",
      "Homepage spotlight rotation",
      "Quarterly performance report",
    ],
  },
};

export default function CheckoutFormClient() {
  const searchParams = useSearchParams();
  const initialTier = searchParams?.get("tier") === "partner" ? "partner" : "featured";

  const [tier, setTier] = useState(initialTier);
  const [toolName, setToolName] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync tier with URL param if user changed it
  useEffect(() => {
    const t = searchParams?.get("tier");
    if (t && (t === "featured" || t === "partner")) setTier(t);
  }, [searchParams]);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!toolName.trim() || !toolUrl.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          toolName: toolName.trim(),
          toolUrl: toolUrl.trim(),
          email: email.trim(),
          contactName: contactName.trim(),
          pitch: pitch.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Checkout Started", { props: { tier } });
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const t = TIERS[tier];

  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      <Link
        href="/get-featured"
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 22,
        }}
      >
        ← Back to plans
      </Link>

      <div style={{ marginBottom: 30 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          CHECKOUT · STEP 1 OF 2
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(26px, 4.4vw, 38px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -0.5,
            lineHeight: 1.15,
          }}
        >
          Get your tool featured
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 600,
          }}
        >
          Tell us about your tool, then complete payment via Stripe. We'll
          review within 24 hours and ship within 48.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 28,
          alignItems: "flex-start",
        }}
        className="checkout-grid"
      >
        {/* Form */}
        <form
          onSubmit={submit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: 20,
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 14,
          }}
        >
          {/* Tier toggle */}
          <div>
            <label style={labelStyle}>TIER</label>
            <div style={{ display: "flex", gap: 8 }}>
              <TierToggle
                active={tier === "featured"}
                onClick={() => setTier("featured")}
                label="Featured"
                price="$99/mo"
              />
              <TierToggle
                active={tier === "partner"}
                onClick={() => setTier("partner")}
                label="Partner"
                price="$299/mo"
              />
            </div>
          </div>

          <Field
            label="TOOL NAME *"
            value={toolName}
            onChange={setToolName}
            placeholder="e.g. SuperGPT"
            required
          />
          <Field
            label="TOOL URL *"
            value={toolUrl}
            onChange={setToolUrl}
            placeholder="https://supergpt.dev"
            type="url"
            required
          />
          <Field
            label="YOUR NAME *"
            value={contactName}
            onChange={setContactName}
            placeholder="Vikas Reddy"
            required
          />
          <Field
            label="YOUR EMAIL *"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
            type="email"
            required
          />
          <Field
            label="PITCH (1-2 SENTENCES)"
            value={pitch}
            onChange={setPitch}
            placeholder="What does your tool do? Who's it for?"
            multiline
          />

          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 11,
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !toolName.trim() || !toolUrl.trim() || !email.trim()}
            style={{
              padding: "14px 22px",
              background:
                loading || !toolName.trim() || !toolUrl.trim() || !email.trim()
                  ? "var(--surface-2)"
                  : ACCENT,
              color:
                loading || !toolName.trim() || !toolUrl.trim() || !email.trim()
                  ? "var(--text-faint)"
                  : "#000",
              border: "none",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              borderRadius: 10,
              cursor:
                loading || !toolName.trim() || !toolUrl.trim() || !email.trim()
                  ? "not-allowed"
                  : "pointer",
              boxShadow:
                !loading && toolName.trim() && toolUrl.trim() && email.trim()
                  ? `0 6px 24px ${ACCENT}30`
                  : "none",
            }}
          >
            {loading ? "REDIRECTING TO STRIPE..." : `CONTINUE — PAY ${t.price} →`}
          </button>

          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              color: "var(--text-faint)",
              lineHeight: 1.5,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Secure payment via Stripe · cancel anytime · 14-day refund if we
            don't ship in 48 hours
          </div>
        </form>

        {/* Tier summary */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: 18,
            background: `${ACCENT}08`,
            border: `1px solid ${ACCENT}40`,
            borderRadius: 14,
            position: "sticky",
            top: 20,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: ACCENT,
              marginBottom: 8,
            }}
          >
            {t.name.toUpperCase()} TIER
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 32,
              fontWeight: 700,
              color: "var(--text-strong)",
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            {t.price}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "var(--text-faint)",
              marginBottom: 14,
            }}
          >
            recurring · cancel anytime
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {t.benefits.map((b, i) => (
              <li
                key={i}
                style={{
                  fontSize: 12,
                  color: "var(--text-default)",
                  lineHeight: 1.5,
                  display: "flex",
                  gap: 8,
                }}
              >
                <span style={{ color: ACCENT, flexShrink: 0 }}>▸</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </motion.aside>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 10,
  fontFamily: "monospace",
  letterSpacing: 1.5,
  color: "var(--text-faint)",
  marginBottom: 6,
};

const inputBase = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border-bright)",
  borderRadius: 8,
  color: "var(--text-strong)",
  fontFamily: "monospace",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

function Field({ label, value, onChange, placeholder, type = "text", required, multiline }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          required={required}
          style={{ ...inputBase, fontFamily: "var(--font-body, system-ui)", resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={inputBase}
        />
      )}
    </div>
  );
}

function TierToggle({ active, onClick, label, price }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 12px",
        background: active ? `${ACCENT}15` : "var(--surface-2)",
        border: `1px solid ${active ? `${ACCENT}50` : "var(--border)"}`,
        color: active ? ACCENT : "var(--text-secondary)",
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
        {price}
      </div>
    </button>
  );
}
