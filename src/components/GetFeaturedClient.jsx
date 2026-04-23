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
    priceSub: "review queue",
    turnaround: "14–21 days",
    color: "#64748b",
    description:
      "Submit and wait. Our editors evaluate every tool against a quality bar before adding. Free, but slow — and not every submission is accepted.",
    benefits: [
      "Standard listing in the 206+ tool directory",
      "Appears in category filters + semantic search",
      "Manual editorial review for fit and quality",
      "No guaranteed acceptance",
      "No affiliate tracking or placement",
    ],
    cta: { label: "Submit for review", href: "#submit", primary: false },
  },
  {
    id: "featured",
    label: "Featured",
    price: "$99",
    priceSub: "/month",
    turnaround: "48 hours",
    color: "#eab308",
    highlighted: true,
    badge: "MOST POPULAR",
    description:
      "Skip the queue and stand out. Your tool ships within 2 business days with a Featured badge, priority placement, and affiliate tracking built in.",
    benefits: [
      'Pinned to the top of its category with a "FEATURED" badge',
      "Included in conversational search responses when relevant",
      "Affiliate link tracking + UTM attribution",
      "Highlighted in weekly newsletter (20K+ subscribers)",
      "Priority in AI Stack Planner recommendations",
      "Cancel anytime — no contracts",
    ],
    cta: { label: "Get Featured", href: "mailto:partner@aiarsenal.dev?subject=Featured%20Listing%20Inquiry", primary: true },
  },
  {
    id: "partner",
    label: "Partner",
    price: "$299",
    priceSub: "/month",
    turnaround: "72 hours",
    color: "#a855f7",
    description:
      "The full co-marketing package. For teams that want AIArsenal as an extended top-of-funnel growth channel.",
    benefits: [
      "Everything in Featured, plus:",
      "Dedicated comparison page (/compare/your-tool-vs-X)",
      "Editorial blog post (co-written, 1,500+ words, SEO-optimized)",
      "Case study on the AIArsenal landing page",
      "Custom landing page at /partners/[your-tool]",
      "Homepage spotlight rotation",
      "Quarterly performance report (clicks, conversions, UTM data)",
    ],
    cta: { label: "Become a Partner", href: "mailto:partner@aiarsenal.dev?subject=Partner%20Tier%20Inquiry", primary: true },
  },
];

const FAQ = [
  {
    q: "Why charge to be featured when the directory is free?",
    a: "AIArsenal is 100% free for users and always will be. Featured + Partner tiers are how we keep it that way — they fund curation, hosting, and the AI recommender. Users don't pay; the platform funds itself from the tools that benefit most from placement.",
  },
  {
    q: "Do you disclose affiliate relationships?",
    a: "Always. Every Featured tool carries a visible badge, affiliate links are transparent in the URL bar, and we display a disclosure on every card with a partner link. Users know exactly what's sponsored and what isn't.",
  },
  {
    q: "Will featured placement affect my organic ranking if I cancel?",
    a: "No. If you cancel, you keep your organic listing based on editorial merit. You only lose the Featured badge, priority placement, and affiliate tracking. Nothing is held hostage.",
  },
  {
    q: "What counts as a quality tool?",
    a: "Live product (not a landing page). Clear free tier or credits. Real users. Not a scam or rebadged wrapper. We reject ~40% of submissions, including paid tiers — we protect the quality bar regardless of payment.",
  },
  {
    q: "Can I see traffic numbers before committing?",
    a: "Yes. Email partner@aiarsenal.dev and we'll share current traffic, demographics, and historical click-through rates for similar tools in your category.",
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
            color: ACCENT,
            padding: "4px 12px",
            border: `1px solid ${ACCENT}40`,
            borderRadius: 4,
            marginBottom: 18,
          }}
        >
          FOR AI TOOL BUILDERS
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
          Reach builders who are <br />
          <span style={{ color: ACCENT }}>actively choosing tools</span>
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
          AIArsenal's 20,000+ monthly users are technical, high-intent, and
          mid-decision. They arrive searching for specific AI capabilities and
          leave having picked a tool. Get featured and be part of that decision.
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
          <Stat value="206+" label="tools curated" />
          <Stat value="20K+" label="monthly users" color="#00ff88" />
          <Stat value="48hr" label="to live" color={ACCENT} />
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
          From submission to featured — 48 hours
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
              body: "Email partner@aiarsenal.dev with your tool URL + Featured tier choice.",
            },
            {
              step: "2",
              title: "Quick review",
              body: "We check product quality, free tier accuracy, and category fit within 24 hours.",
            },
            {
              step: "3",
              title: "Onboard",
              body: "You confirm listing copy + affiliate link + UTM params. Billed monthly.",
            },
            {
              step: "4",
              title: "Ship",
              body: "Live within 48 hours with Featured badge, priority placement, and affiliate tracking.",
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
          Ready to get featured?
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
          Email us with your tool, your preferred tier, and any questions.
          We'll respond within one business day with traffic numbers and next
          steps.
        </p>
        <a
          href="mailto:partner@aiarsenal.dev?subject=Featured%20Listing%20Inquiry"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: ACCENT,
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
            e.currentTarget.style.boxShadow = `0 8px 24px ${ACCENT}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          partner@aiarsenal.dev →
        </a>
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
