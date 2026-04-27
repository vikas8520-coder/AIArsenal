"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TOOLS } from "../data/tools";
import { getToolSlug } from "../lib/tools";
import { getCategoryById } from "../data/categories";

const ACCENT = "#eab308";

const TIERS = [
  {
    id: "editorial",
    label: "Editorial Listing",
    price: "Free",
    priceSub: "always",
    turnaround: "7–14 days",
    color: "#10b981",
    highlighted: true,
    badge: "100% FREE",
    description:
      "Submit your tool. We review against a quality bar and add it if it's a fit. No payment, no upsell — every tool currently on AIArsenal got in this way.",
    benefits: [
      "Standard listing in the 207+ tool directory",
      "Appears in category filters + semantic search",
      "Eligible for /quiz, /ask, and /stacks recommendations",
      "Editorial bestFor / notFor decision guides written for you",
      "Outbound clicks attributed via UTM (you can see them in your analytics)",
      "Affiliate URL accepted if you have a program — we'll wire it in for free",
    ],
    cta: { label: "Submit your tool", href: "#submit", primary: true },
  },
  {
    id: "affiliate",
    label: "Affiliate Partner",
    price: "Free",
    priceSub: "rev-share",
    turnaround: "Same day",
    color: "#a855f7",
    description:
      "Already have an affiliate program? We'll route AIArsenal traffic through your affiliate link. No flat fee — we earn only when your free-tier users convert to paid.",
    benefits: [
      "Affiliate link replaces the standard outbound on your tool page",
      "UTM attribution + your affiliate ID auto-injected",
      "Sponsored badge optional (we recommend OFF for trust)",
      "We never charge you a flat fee — pure rev-share",
      "Cancel anytime — just email us to revert to plain link",
    ],
    cta: {
      label: "Email partner@",
      href: "mailto:partner@aiarsenal.dev?subject=Affiliate%20program%20offer",
      primary: false,
    },
  },
  {
    id: "future",
    label: "Paid placements",
    price: "Coming",
    priceSub: "later",
    turnaround: "—",
    color: "#64748b",
    description:
      "We may add paid Featured slots in the future once organic traffic + editorial trust are deeper. For now, every listing decision is purely on quality.",
    benefits: [
      "Currently: not available — please use Editorial or Affiliate tiers",
      "When live: transparent pricing, all paid placements clearly badged",
      "Editorial integrity comes first — no pay-to-play on quality",
    ],
    cta: { label: "Get notified", href: "mailto:partner@aiarsenal.dev?subject=Notify%20me%20when%20paid%20listings%20open", primary: false },
  },
];

const FAQ = [
  {
    q: "How does AIArsenal make money if every listing is free?",
    a: "We earn affiliate commissions when our users sign up to your free tier and eventually convert to a paid plan. If you have an affiliate program, we plug into it. If you don't, we get nothing — and that's fine, your listing is still permanent.",
  },
  {
    q: "Do you disclose affiliate relationships to users?",
    a: "Yes — every page footer carries an explicit affiliate disclosure, and we never let commission rates affect editorial decisions (which tools we list, how we describe them, what we recommend in the quiz). The disclosure is one click away from any tool card.",
  },
  {
    q: "What counts as a quality tool?",
    a: "Live product (not a landing page). Clear free tier or credits. Real users. Not a scam or rebadged wrapper. We reject ~40% of submissions and the bar applies whether or not you have an affiliate program.",
  },
  {
    q: "How long does review take?",
    a: "7–14 days typically. We process submissions in batches and write the editorial copy (description, bestFor / notFor) ourselves so each tool fits the format. We'll email you when it's live.",
  },
  {
    q: "I have an affiliate program — how do I share the link?",
    a: "Just include it when you submit (or email partner@aiarsenal.dev with your tool URL + affiliate URL). We'll wire it as the outbound link on your tool's page so we get credit for conversions. UTM source is auto-set to 'aiarsenal'.",
  },
  {
    q: "Will you ever charge for placement?",
    a: "Possibly later, once organic traffic and editorial trust are deeper. If we do, paid slots will be clearly badged and editorial decisions will stay independent. For now, every listing decision is purely on quality.",
  },
];

function TierCard({ tier }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        position: "relative",
        padding: "28px 24px",
        background: tier.highlighted ? `${tier.color}08` : "var(--surface-1)",
        border: `1px solid ${tier.highlighted ? `${tier.color}40` : "var(--border)"}`,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {tier.badge && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: 20,
            fontSize: 9,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: 1.5,
            padding: "4px 10px",
            background: tier.color,
            color: "#000",
            borderRadius: 4,
          }}
        >
          {tier.badge}
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 1.5,
            color: tier.color,
            marginBottom: 8,
          }}
        >
          {tier.label.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 36,
              fontWeight: 700,
              color: "var(--text-strong)",
              letterSpacing: -1,
            }}
          >
            {tier.price}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "var(--text-faint)",
            }}
          >
            {tier.priceSub}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            fontFamily: "monospace",
            color: tier.color,
            letterSpacing: 0.5,
          }}
        >
          Goes live in {tier.turnaround}
        </div>
      </div>
      <p
        style={{
          fontSize: 12.5,
          lineHeight: 1.6,
          color: "var(--text-secondary)",
          margin: "0 0 18px",
        }}
      >
        {tier.description}
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 22px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {tier.benefits.map((b, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 8,
              fontSize: 12,
              color: "var(--text-default)",
              lineHeight: 1.55,
            }}
          >
            <span
              style={{
                color: tier.color,
                flexShrink: 0,
                fontFamily: "monospace",
              }}
            >
              ▸
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <a
        href={tier.cta.href}
        style={{
          display: "block",
          padding: "12px 18px",
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          borderRadius: 10,
          textDecoration: "none",
          background: tier.cta.primary ? tier.color : "transparent",
          color: tier.cta.primary ? "#000" : tier.color,
          border: `1px solid ${tier.color}${tier.cta.primary ? "" : "40"}`,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!tier.cta.primary) {
            e.currentTarget.style.background = `${tier.color}15`;
          }
        }}
        onMouseLeave={(e) => {
          if (!tier.cta.primary) {
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {tier.cta.label} →
      </a>
    </motion.div>
  );
}

function FAQItem({ item, open, onClick }) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "16px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text-strong)",
        }}
      >
        <span>{item.q}</span>
        <span style={{ color: ACCENT, fontSize: 18 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{
            paddingBottom: 18,
            fontSize: 12.5,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
          }}
        >
          {item.a}
        </motion.div>
      )}
    </div>
  );
}

export default function GetFeaturedClient() {
  const [openFaq, setOpenFaq] = useState(0);

  const featuredExamples = TOOLS.filter((t) => t.sponsored).slice(0, 3);

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      {/* Back link */}
      <Link
        href="/"
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 24,
        }}
      >
        ← AIArsenal
      </Link>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: "#10b981",
            padding: "4px 12px",
            border: `1px solid #10b98140`,
            borderRadius: 4,
            marginBottom: 18,
          }}
        >
          FOR AI TOOL BUILDERS · 100% FREE
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          Get listed on AIArsenal. <br />
          <span style={{ color: "#10b981" }}>Zero fee, ever.</span>
        </h1>
        <p
          style={{
            margin: "20px auto 0",
            maxWidth: 640,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          AIArsenal is funded entirely by affiliate commissions when our users
          sign up to your free tier and later upgrade. There's no flat listing
          fee — submit your tool and if it clears editorial review it gets
          listed permanently for free.
        </p>
        <div
          style={{
            display: "flex",
            gap: 28,
            justifyContent: "center",
            marginTop: 32,
            flexWrap: "wrap",
          }}
        >
          <Stat value="207" label="tools listed" />
          <Stat value="$0" label="listing fee" color="#10b981" />
          <Stat value="7–14d" label="review window" color="#a855f7" />
          <Stat value="40%" label="rejection rate" color="#ef5350" />
        </div>
      </div>

      {/* Tiers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 72,
        }}
      >
        {TIERS.map((t) => (
          <TierCard key={t.id} tier={t} />
        ))}
      </div>

      {/* Featured examples */}
      {featuredExamples.length > 0 && (
        <div style={{ marginBottom: 72 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: "var(--text-faint)",
              marginBottom: 12,
            }}
          >
            CURRENTLY FEATURED
          </div>
          <h2
            style={{
              margin: "0 0 20px",
              fontFamily: "monospace",
              fontSize: 20,
              color: "var(--text-strong)",
            }}
          >
            Teams already featured
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {featuredExamples.map((t) => {
              const cat = getCategoryById(t.category);
              return (
                <Link
                  key={t.id}
                  href={`/tools/${getToolSlug(t)}`}
                  style={{
                    padding: 16,
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${ACCENT}`,
                    borderRadius: 10,
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${ACCENT}40`;
                    e.currentTarget.style.borderLeftColor = ACCENT;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.borderLeftColor = ACCENT;
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--text-strong)",
                      marginBottom: 4,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
                      marginBottom: 8,
                    }}
                  >
                    {t.desc}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      color: cat?.color || ACCENT,
                      letterSpacing: 1,
                    }}
                  >
                    {t.category}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      <div style={{ marginBottom: 72 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: "var(--text-faint)",
            marginBottom: 12,
          }}
        >
          HOW IT WORKS
        </div>
        <h2
          style={{
            margin: "0 0 28px",
            fontFamily: "monospace",
            fontSize: 20,
            color: "var(--text-strong)",
          }}
        >
          From submission to listed — 7–14 days
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              step: "1",
              title: "Submit",
              body: "Use the form below — name, URL, free tier details, optional affiliate link. Takes 2 minutes.",
            },
            {
              step: "2",
              title: "Editorial review",
              body: "We check product quality, free tier accuracy, and category fit. ~40% rejection rate.",
            },
            {
              step: "3",
              title: "We write your copy",
              body: "If accepted, we draft your description, bestFor / notFor, and quickStart so it fits the format.",
            },
            {
              step: "4",
              title: "Live forever",
              body: "Listed permanently in the directory, comparison pages, /quiz pool, and /ask recommendations.",
            },
          ].map(({ step, title, body }) => (
            <div
              key={step}
              style={{
                padding: 18,
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 28,
                  color: ACCENT,
                  fontWeight: 700,
                  marginBottom: 8,
                  lineHeight: 1,
                }}
              >
                {step}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-strong)",
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 60 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: "var(--text-faint)",
            marginBottom: 12,
          }}
        >
          FAQ
        </div>
        <h2
          style={{
            margin: "0 0 12px",
            fontFamily: "monospace",
            fontSize: 20,
            color: "var(--text-strong)",
          }}
        >
          Questions we hear a lot
        </h2>
        <div>
          {FAQ.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              open={openFaq === i}
              onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        id="submit"
        style={{
          padding: "40px 32px",
          background: `${ACCENT}08`,
          border: `1px solid ${ACCENT}25`,
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: 22,
            color: "var(--text-strong)",
          }}
        >
          Submit your tool
        </h2>
        <p
          style={{
            margin: "10px auto 24px",
            maxWidth: 520,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          Free, permanent, no upsell. Just give us the basics + your affiliate
          link if you have one. We'll review within 7–14 days.
        </p>
        <Link
          href="/?submit=1"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "#10b981",
            color: "#000",
            textDecoration: "none",
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 10,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 8px 24px #10b98140`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          + SUBMIT YOUR TOOL →
        </Link>
        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            fontFamily: "monospace",
            color: "var(--text-faint)",
            letterSpacing: 0.5,
          }}
        >
          Have an affiliate program? Email{" "}
          <a
            href="mailto:partner@aiarsenal.dev?subject=Affiliate%20program%20offer"
            style={{ color: "#a855f7" }}
          >
            partner@aiarsenal.dev
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 22,
          fontWeight: 700,
          color: color || "var(--text-strong)",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "var(--text-faint)",
          letterSpacing: 1,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
