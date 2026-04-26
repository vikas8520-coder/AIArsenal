"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ACCENT = "#00f0ff";

function Section({ title, subtitle, children, right }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: ACCENT,
              marginBottom: 4,
            }}
          >
            {title.toUpperCase()}
          </div>
          {subtitle && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--text-faint)",
                fontFamily: "monospace",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      <div
        style={{
          padding: 16,
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 10,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function BarList({ items, labelKey = "key", valueKey = "count", empty = "No data yet." }) {
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "var(--text-faint)",
        }}
      >
        {empty}
      </div>
    );
  }
  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, idx) => {
        const label = item[labelKey];
        const value = Number(item[valueKey]) || 0;
        const pct = (value / max) * 100;
        return (
          <div
            key={`${label}-${idx}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px",
              alignItems: "center",
              gap: 10,
              fontFamily: "monospace",
              fontSize: 11,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "var(--text-strong)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 2,
                }}
                title={label}
              >
                {label}
              </div>
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "var(--surface-2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: ACCENT,
                    opacity: 0.5 + pct / 200,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                color: ACCENT,
                fontWeight: 700,
              }}
            >
              {value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KPI({ label, value, sub, color = ACCENT }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: "var(--surface-1)",
        border: `1px solid ${color}25`,
        borderRadius: 10,
        flex: 1,
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 1.5,
          color: "var(--text-faint)",
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 24,
          fontWeight: 700,
          color,
          letterSpacing: -0.5,
          lineHeight: 1.1,
        }}
      >
        {value ?? "—"}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            color: "var(--text-faint)",
            marginTop: 3,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function Login({ onAuth }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) {
        setError("Wrong password.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      onAuth(password, data);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 340,
          padding: 24,
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 14,
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
          ADMIN
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: 18,
            color: "var(--text-strong)",
          }}
        >
          AIArsenal Dashboard
        </h1>
        <p
          style={{
            margin: "6px 0 18px",
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          Enter the admin password to view lead capture, chat questions, and
          click analytics.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          placeholder="Admin password"
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "var(--surface-2)",
            border: `1px solid ${error ? "#ef4444" : "var(--border-bright)"}`,
            borderRadius: 8,
            color: "var(--text-strong)",
            fontFamily: "monospace",
            fontSize: 12,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 10,
          }}
        />
        {error && (
          <div
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "#f87171",
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: `${ACCENT}20`,
            border: `1px solid ${ACCENT}50`,
            color: ACCENT,
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            borderRadius: 8,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Verifying..." : "SIGN IN →"}
        </button>
      </form>
    </div>
  );
}

export default function AdminClient() {
  const [password, setPassword] = useState(null);
  const [data, setData] = useState(null);
  const [newsletter, setNewsletter] = useState(null);
  const [nlLoading, setNlLoading] = useState(false);
  const [blogDraft, setBlogDraft] = useState(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState(null);
  const [blogCopied, setBlogCopied] = useState(false);
  const [nlError, setNlError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("aiarsenal-admin-pw");
      if (saved) {
        fetch("/api/admin/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: saved }),
        }).then(async (res) => {
          if (res.ok) {
            const d = await res.json();
            setPassword(saved);
            setData(d);
          }
        });
      }
    } catch {}
  }, []);

  const handleAuth = (pw, d) => {
    setPassword(pw);
    setData(d);
    try {
      sessionStorage.setItem("aiarsenal-admin-pw", pw);
    } catch {}
  };

  const logout = () => {
    setPassword(null);
    setData(null);
    try {
      sessionStorage.removeItem("aiarsenal-admin-pw");
    } catch {}
  };

  const generateNewsletter = async () => {
    if (!password || nlLoading) return;
    setNlLoading(true);
    setNlError(null);
    setNewsletter(null);
    const topQuestions = (data?.questions?.recent || [])
      .slice(0, 20)
      .map((q) => q.question);
    const topToolClicks = (data?.plausible?.topToolClicks || []).map(
      (t) => t.name || t.key || "unknown"
    );
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, topQuestions, topToolClicks }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const d = await res.json();
      setNewsletter(d);
    } catch (e) {
      setNlError(e.message);
    } finally {
      setNlLoading(false);
    }
  };

  const draftBlogPost = async (question) => {
    if (!password || blogLoading || !question) return;
    setBlogLoading(true);
    setBlogError(null);
    setBlogDraft(null);
    try {
      const res = await fetch("/api/admin/blog-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, question }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const d = await res.json();
      setBlogDraft({ ...d, sourceQuestion: question });
    } catch (e) {
      setBlogError(e.message);
    } finally {
      setBlogLoading(false);
    }
  };

  const copyBlogJson = () => {
    if (!blogDraft) return;
    const entry = {
      slug: blogDraft.slug,
      title: blogDraft.title,
      description: blogDraft.description,
      date: new Date().toISOString().slice(0, 10),
      tags: blogDraft.tags,
      content: blogDraft.markdown,
    };
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2)).then(() => {
      setBlogCopied(true);
      setTimeout(() => setBlogCopied(false), 2000);
    });
  };

  const copyNewsletter = () => {
    if (!newsletter?.markdown) return;
    navigator.clipboard.writeText(newsletter.markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  if (!password || !data) {
    return <Login onAuth={handleAuth} />;
  }

  const plausibleConfigured = data.plausible?.configured;
  const agg = data.plausible?.aggregate;

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 24px 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 28,
          paddingBottom: 18,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: ACCENT,
              marginBottom: 4,
            }}
          >
            ADMIN DASHBOARD
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "monospace",
              fontSize: 22,
              color: "var(--text-strong)",
              letterSpacing: -0.5,
            }}
          >
            AIArsenal · last 7 days
          </h1>
        </div>
        <button
          onClick={logout}
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            padding: "6px 12px",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            color: "var(--text-faint)",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          LOG OUT
        </button>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
      >
        <KPI
          label="Visitors 7d"
          value={agg?.visitors?.value?.toLocaleString()}
          sub={plausibleConfigured ? undefined : "Plausible API not wired"}
        />
        <KPI
          label="Pageviews 7d"
          value={agg?.pageviews?.value?.toLocaleString()}
          sub={
            agg?.bounce_rate?.value != null
              ? `${agg.bounce_rate.value}% bounce`
              : undefined
          }
        />
        <KPI
          label="Leads"
          value={data.leads.total.toLocaleString()}
          sub={`${data.leads.recent.length} shown`}
          color="#10b981"
        />
        <KPI
          label="Chat Questions"
          value={data.questions.total.toLocaleString()}
          sub="cumulative"
          color="#a855f7"
        />
      </div>

      {/* Traffic */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Section
          title="Top pages"
          subtitle={
            plausibleConfigured
              ? "Last 7 days · via Plausible"
              : "Wire PLAUSIBLE_API_KEY to enable"
          }
        >
          <BarList
            items={(data.plausible.topPages || []).map((r) => ({
              key: r.page,
              count: r.visitors,
            }))}
            empty={
              plausibleConfigured
                ? "No data yet."
                : "Set PLAUSIBLE_API_KEY + PLAUSIBLE_SITE_ID."
            }
          />
        </Section>
        <Section title="Top sources" subtitle="Where visitors come from">
          <BarList
            items={(data.plausible.topSources || []).map((r) => ({
              key: r.source || "(direct)",
              count: r.visitors,
            }))}
            empty={
              plausibleConfigured ? "No data yet." : "Needs Plausible key."
            }
          />
        </Section>
      </div>

      {/* Clicks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Section title="Top affiliate clicks" subtitle="Revenue-relevant">
          <BarList
            items={(data.plausible.topAffiliateClicks || []).map((r) => ({
              key: r.name || r.key || "—",
              count: r.visitors || r.events,
            }))}
            empty={
              plausibleConfigured
                ? "No affiliate clicks this week."
                : "Needs Plausible."
            }
          />
        </Section>
        <Section title="Top tool clicks" subtitle="All outbound clicks">
          <BarList
            items={(data.plausible.topToolClicks || []).map((r) => ({
              key: r.name || r.key || "—",
              count: r.visitors || r.events,
            }))}
            empty={
              plausibleConfigured ? "No tool clicks yet." : "Needs Plausible."
            }
          />
        </Section>
      </div>

      {/* Leads */}
      <Section
        title="Recent leads"
        subtitle={`${data.leads.total} total · ${data.leads.sources
          .map((s) => `${s.key}=${s.count}`)
          .join(" · ")}`}
      >
        {data.leads.recent.length === 0 ? (
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
            No leads captured yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.leads.recent.map((lead, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 120px 1fr",
                  gap: 10,
                  padding: "6px 4px",
                  fontFamily: "monospace",
                  fontSize: 11.5,
                  borderBottom:
                    i === data.leads.recent.length - 1
                      ? "none"
                      : "1px solid var(--border)",
                }}
              >
                <div style={{ color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lead.email}
                </div>
                <div style={{ color: ACCENT }}>{lead.source}</div>
                <div style={{ color: "var(--text-faint)", textAlign: "right" }}>
                  {lead.at ? new Date(lead.at).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Chat Questions */}
      <Section
        title="Chat questions"
        subtitle={`Most recent — ${data.questions.total} total`}
      >
        {data.questions.recent.length === 0 ? (
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>
            No chat questions logged yet. (First ones start flowing after the
            next deploy — the logger was just added.)
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.questions.recent.map((q, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 12px",
                  background: "var(--surface-2)",
                  borderRadius: 8,
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "var(--text-default)",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>{q.question}</div>
                  <button
                    onClick={() => draftBlogPost(q.question)}
                    disabled={blogLoading}
                    title="Draft a full blog post answering this question"
                    style={{
                      flexShrink: 0,
                      fontSize: 9,
                      fontFamily: "monospace",
                      letterSpacing: 1,
                      padding: "3px 8px",
                      background: blogLoading ? "var(--surface-2)" : "rgba(0,240,255,0.12)",
                      color: blogLoading ? "var(--text-faint)" : ACCENT,
                      border: `1px solid ${blogLoading ? "var(--border)" : "rgba(0,240,255,0.4)"}`,
                      borderRadius: 4,
                      cursor: blogLoading ? "wait" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✎ DRAFT POST
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 9,
                    color: "var(--text-faint)",
                  }}
                >
                  turn {q.turn} ·{" "}
                  {q.at ? new Date(q.at).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Blog post drafter — shows when user clicked DRAFT POST on a question */}
      {(blogDraft || blogLoading || blogError) && (
        <Section
          title="Blog post draft"
          subtitle={
            blogDraft?.sourceQuestion
              ? `Drafted from: "${blogDraft.sourceQuestion.slice(0, 80)}${blogDraft.sourceQuestion.length > 80 ? "..." : ""}"`
              : "Generating from the selected question"
          }
          right={
            blogDraft && (
              <button
                onClick={copyBlogJson}
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  padding: "8px 14px",
                  background: blogCopied ? "#10b98118" : `${ACCENT}20`,
                  border: `1px solid ${blogCopied ? "#10b98150" : `${ACCENT}50`}`,
                  color: blogCopied ? "#10b981" : ACCENT,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                {blogCopied ? "✓ COPIED JSON" : "COPY AS BLOG ENTRY"}
              </button>
            )
          }
        >
          {blogLoading && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                Drafting ~1000-word post with citations...
              </motion.span>
            </div>
          )}
          {blogError && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#f87171",
              }}
            >
              {blogError}
            </div>
          )}
          {blogDraft && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--surface-2)",
                  border: `1px solid ${ACCENT}30`,
                  borderRadius: 8,
                  fontFamily: "monospace",
                  fontSize: 12,
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: "6px 12px",
                }}
              >
                <span style={{ color: "var(--text-faint)", letterSpacing: 1 }}>SLUG</span>
                <span style={{ color: ACCENT }}>{blogDraft.slug}</span>
                <span style={{ color: "var(--text-faint)", letterSpacing: 1 }}>TITLE</span>
                <span style={{ color: "var(--text-strong)" }}>{blogDraft.title}</span>
                <span style={{ color: "var(--text-faint)", letterSpacing: 1 }}>META</span>
                <span style={{ color: "var(--text-default)" }}>{blogDraft.description}</span>
                <span style={{ color: "var(--text-faint)", letterSpacing: 1 }}>TAGS</span>
                <span style={{ color: "var(--text-default)" }}>
                  {(blogDraft.tags || []).join(", ")}
                </span>
              </div>
              <pre
                style={{
                  padding: 16,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "var(--text-default)",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 520,
                  overflowY: "auto",
                  margin: 0,
                }}
              >
                {blogDraft.markdown}
              </pre>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "var(--text-faint)",
                  lineHeight: 1.5,
                }}
              >
                Paste the JSON entry into{" "}
                <span style={{ color: ACCENT }}>src/data/blog-posts.js</span>,
                commit, and the post auto-publishes at /blog/{blogDraft.slug}.
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Newsletter drafter */}
      <Section
        title="Weekly newsletter draft"
        subtitle="Gemini-generated, based on recent tools + trending questions"
        right={
          <button
            onClick={generateNewsletter}
            disabled={nlLoading}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              padding: "8px 14px",
              background: `${ACCENT}20`,
              border: `1px solid ${ACCENT}50`,
              color: ACCENT,
              borderRadius: 8,
              cursor: nlLoading ? "wait" : "pointer",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {nlLoading ? "DRAFTING..." : "GENERATE →"}
          </button>
        }
      >
        {!newsletter && !nlLoading && !nlError && (
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.6 }}>
            Click GENERATE to draft this week's edition. Uses the last 14 days
            of added tools, your top chat questions, and top tool clicks.
            Output is markdown — paste straight into Substack, Beehiiv, or
            ConvertKit.
          </div>
        )}
        {nlError && (
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#f87171", marginBottom: 8 }}>
            {nlError}
          </div>
        )}
        {nlLoading && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}
          >
            Drafting newsletter with recent data...
          </motion.div>
        )}
        {newsletter && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                fontSize: 10,
                fontFamily: "monospace",
                color: "var(--text-faint)",
              }}
            >
              <span>
                {newsletter.meta?.recentToolCount ?? 0} new tools ·{" "}
                {newsletter.meta?.questionsConsidered ?? 0} questions
                considered
              </span>
              <button
                onClick={copyNewsletter}
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  padding: "4px 10px",
                  background: copied ? "#10b98120" : "var(--surface-2)",
                  border: `1px solid ${copied ? "#10b98150" : "var(--border)"}`,
                  color: copied ? "#10b981" : "var(--text-secondary)",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                {copied ? "✓ COPIED" : "COPY MD"}
              </button>
            </div>
            <pre
              style={{
                padding: 16,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text-default)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 600,
                overflowY: "auto",
                margin: 0,
              }}
            >
              {newsletter.markdown}
            </pre>
          </div>
        )}
      </Section>
    </div>
  );
}
