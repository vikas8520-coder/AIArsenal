"use client";
import { useState } from "react";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Directory",
    links: [
      { label: "All tools", href: "/" },
      { label: "Categories", href: "/#categories" },
      { label: "Ask AI", href: "/ask" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "For builders",
    links: [
      { label: "Submit a tool", href: "/#submit" },
      { label: "Get featured", href: "/get-featured" },
      { label: "Partner tier", href: "/get-featured#submit" },
      { label: "partner@aiarsenal.dev", href: "mailto:partner@aiarsenal.dev" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "How we curate", href: "/get-featured#how-it-works" },
      { label: "Affiliate disclosure", href: "#disclosure" },
      { label: "GitHub", href: "https://github.com/vikas8520-coder/AIArsenal" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      setStatus("done");
      setEmail("");
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Newsletter Signup", { props: { source: "footer" } });
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: 60,
        padding: "40px 24px 28px",
        background: "var(--surface-1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.4fr repeat(3, 1fr)",
          gap: 32,
          alignItems: "flex-start",
        }}
        className="footer-grid"
      >
        {/* Brand + newsletter */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <img
              src="/logo.png"
              alt=""
              style={{ width: 28, height: 28, borderRadius: 6 }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-strong)",
              }}
            >
              AI<span style={{ color: "#00f0ff" }}>Arsenal</span>
            </span>
          </div>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 12,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            The curated directory of free AI tools. 100% free for builders, funded
            by transparent partnerships.
          </p>

          <form onSubmit={subscribe}>
            <div
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1.5,
                color: "var(--text-faint)",
                marginBottom: 6,
              }}
            >
              WEEKLY TOOL PICKS
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: 4,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              <input
                type="email"
                required
                value={email}
                disabled={status === "loading" || status === "done"}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  padding: "6px 8px",
                  color: "var(--text-strong)",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "done"}
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "6px 12px",
                  background: status === "done" ? "#10b98120" : "#00f0ff20",
                  border: `1px solid ${status === "done" ? "#10b98150" : "#00f0ff50"}`,
                  color: status === "done" ? "#10b981" : "#00f0ff",
                  borderRadius: 6,
                  cursor: status === "loading" ? "wait" : "pointer",
                }}
              >
                {status === "loading"
                  ? "..."
                  : status === "done"
                    ? "✓ JOINED"
                    : "SUBSCRIBE"}
              </button>
            </div>
            {status === "error" && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  fontFamily: "monospace",
                  color: "#f87171",
                }}
              >
                Something went wrong. Try again.
              </div>
            )}
          </form>
        </div>

        {/* Nav sections */}
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1.5,
                color: "var(--text-faint)",
                marginBottom: 12,
              }}
            >
              {section.title.toUpperCase()}
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {section.links.map((link) => {
                const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto:");
                const Comp = isExternal ? "a" : Link;
                const props = isExternal
                  ? { href: link.href, target: link.href.startsWith("http") ? "_blank" : undefined, rel: "noopener" }
                  : { href: link.href };
                return (
                  <li key={link.label}>
                    <Comp
                      {...props}
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11.5,
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#00f0ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-secondary)")
                      }
                    >
                      {link.label}
                    </Comp>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Affiliate disclosure */}
      <div
        id="disclosure"
        style={{
          maxWidth: 1200,
          margin: "36px auto 0",
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 10,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          lineHeight: 1.6,
        }}
      >
        <div style={{ maxWidth: 700 }}>
          <strong style={{ color: "var(--text-secondary)" }}>
            Affiliate disclosure:
          </strong>{" "}
          AIArsenal is free for users. Some outbound links include affiliate
          tracking — we earn a small commission when you sign up through them,
          at no extra cost to you. Editorial decisions (which tools we list, how
          we describe them) are never tied to commissions. Featured placements
          are labeled with a yellow FEATURED badge and priced transparently on
          the{" "}
          <Link
            href="/get-featured"
            style={{ color: "#eab308", textDecoration: "none" }}
          >
            Get Featured
          </Link>{" "}
          page.
        </div>
        <div>© 2026 AIArsenal</div>
      </div>
    </footer>
  );
}
