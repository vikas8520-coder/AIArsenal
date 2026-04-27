"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

const ACCENT = "#10b981";

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.4 },
          colors: [ACCENT, "#eab308", "#a855f7", "#ffffff"],
        });
      } catch {}
    }, 250);
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Checkout Completed");
    }
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "60px 24px 80px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: 96,
          height: 96,
          margin: "0 auto 28px",
          borderRadius: "50%",
          background: `${ACCENT}15`,
          border: `2px solid ${ACCENT}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          color: ACCENT,
        }}
      >
        ✓
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: ACCENT,
            marginBottom: 12,
          }}
        >
          PAYMENT RECEIVED
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
          You're in.
        </h1>
        <p
          style={{
            margin: "16px auto 0",
            maxWidth: 540,
            fontSize: 15,
            lineHeight: 1.65,
            color: "var(--text-secondary)",
          }}
        >
          We've got your submission and payment. Vikas will personally review
          your tool within 24 hours and have it live with the FEATURED badge
          within 48 hours.
        </p>
        <p
          style={{
            margin: "12px auto 0",
            maxWidth: 540,
            fontSize: 13,
            color: "var(--text-faint)",
            lineHeight: 1.6,
          }}
        >
          Stripe sent a receipt to your email. You can manage your
          subscription anytime from the same email link.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{
          marginTop: 36,
          padding: "20px 24px",
          background: "var(--surface-1)",
          border: `1px solid ${ACCENT}30`,
          borderRadius: 14,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: "var(--text-faint)",
            marginBottom: 10,
          }}
        >
          WHAT HAPPENS NEXT
        </div>
        <ol
          style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {[
            "Vikas reviews your submission against the quality bar",
            "If accepted, your tool gets the FEATURED badge + priority placement",
            "Goes live within 48 business hours",
            "You'll get an email confirmation with the listing URL + UTM tracking notes",
          ].map((s, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 12,
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-default)",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `${ACCENT}15`,
                  border: `1px solid ${ACCENT}40`,
                  color: ACCENT,
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        style={{
          marginTop: 32,
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            padding: "12px 22px",
            background: ACCENT,
            color: "#000",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          BACK TO AIARSENAL →
        </Link>
        <Link
          href="/get-featured"
          style={{
            padding: "12px 22px",
            background: "transparent",
            color: "var(--text-faint)",
            border: "1px solid var(--border)",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          FEATURE ANOTHER TOOL
        </Link>
      </motion.div>

      {sessionId && (
        <div
          style={{
            marginTop: 28,
            fontSize: 10,
            fontFamily: "monospace",
            color: "var(--text-faint)",
            letterSpacing: 1,
          }}
        >
          Session: {sessionId.slice(0, 16)}…
        </div>
      )}
    </div>
  );
}
