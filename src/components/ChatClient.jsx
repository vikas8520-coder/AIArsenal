"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getCategoryById } from "../data/categories";
import { getToolSlug } from "../lib/tools";

const ACCENT = "#00f0ff";

const STARTER_PROMPTS = [
  "Build me a free stack to ship an AI SaaS this weekend",
  "Best free coding assistant if I care about privacy?",
  "How do I get free GPU compute to train a model?",
  "Claude vs ChatGPT vs Gemini — which free tier is best in 2026?",
  "Cheapest way to add voice cloning to my app",
  "What tools should I use to earn income with AI?",
];

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: ACCENT,
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}

function ToolPill({ tool }) {
  const cat = getCategoryById(tool.category);
  const color = cat?.color || ACCENT;
  return (
    <Link
      href={`/tools/${getToolSlug(tool)}`}
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        textDecoration: "none",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.background = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--surface-1)";
      }}
    >
      <span
        style={{
          color,
          fontFamily: "monospace",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        ◈
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--text-strong)",
            }}
          >
            {tool.name}
          </span>
          {tool.sponsored && (
            <span
              style={{
                fontSize: 8,
                padding: "1px 5px",
                background: "rgba(234,179,8,0.12)",
                color: "#eab308",
                borderRadius: 3,
                fontFamily: "monospace",
                fontWeight: 700,
                border: "1px solid rgba(234,179,8,0.25)",
              }}
            >
              FEATURED
            </span>
          )}
          {tool.oss && (
            <span
              style={{
                fontSize: 8,
                padding: "1px 5px",
                background: "rgba(0,255,136,0.1)",
                color: "#00ff88",
                borderRadius: 3,
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              OSS
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-secondary)",
            marginTop: 3,
            lineHeight: 1.45,
          }}
        >
          {tool.desc}
        </div>
        {tool.free && (
          <div
            style={{
              fontSize: 10,
              color: "#10b981",
              marginTop: 4,
              fontFamily: "monospace",
            }}
          >
            {tool.free}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 9,
          color,
          border: `1px solid ${color}25`,
          borderRadius: 3,
          padding: "1px 6px",
          alignSelf: "center",
          fontFamily: "monospace",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {tool.category.split(" ")[0]}
      </span>
    </Link>
  );
}

function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 18,
      }}
    >
      <div
        style={{
          maxWidth: isUser ? "80%" : "100%",
          width: isUser ? "auto" : "100%",
        }}
      >
        {isUser ? (
          <div
            style={{
              background: `${ACCENT}12`,
              border: `1px solid ${ACCENT}25`,
              borderRadius: "14px 14px 4px 14px",
              padding: "10px 14px",
              fontSize: 13,
              fontFamily: "monospace",
              color: "var(--text-strong)",
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontFamily: "monospace",
                  letterSpacing: 1.5,
                  color: ACCENT,
                }}
              >
                AIARSENAL
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--border)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "var(--text-strong)",
                marginBottom: message.tools?.length ? 12 : 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {message.content}
            </div>
            {message.tools && message.tools.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: message.followups?.length ? 14 : 0,
                }}
              >
                {message.tools.map((t) => (
                  <ToolPill key={t.id} tool={t} />
                ))}
              </div>
            )}
            {message.followups && message.followups.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "monospace",
                    letterSpacing: 1,
                    color: "var(--text-faint)",
                    marginBottom: 6,
                  }}
                >
                  TRY ASKING
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {message.followups.map((f, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        message.onFollowup && message.onFollowup(f)
                      }
                      style={{
                        fontSize: 11,
                        fontFamily: "monospace",
                        padding: "6px 10px",
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        transition: "all 0.15s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${ACCENT}40`;
                        e.currentTarget.style.color = ACCENT;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      {f} ↗
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatClient({ initialQuery = "" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailCaptureShown, setEmailCaptureShown] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const didAutoSend = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aiarsenal-chat");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
      if (localStorage.getItem("aiarsenal-chat-email-shown") === "1") {
        setEmailCaptureShown(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem("aiarsenal-chat", JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = useCallback(
    async (text) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      setError(null);
      setInput("");
      const userMsg = { role: "user", content };
      const history = [...messages, userMsg];
      setMessages(history);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            tools: data.tools || [],
            followups: data.followups || [],
          },
        ]);

        if (window.plausible) {
          window.plausible("Chat Message", {
            props: { turn: history.length },
          });
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  const handleFollowup = useCallback(
    (q) => {
      send(q);
    },
    [send]
  );

  // Auto-send initial query from ?q= param (once).
  useEffect(() => {
    if (didAutoSend.current) return;
    if (!initialQuery || messages.length > 0) return;
    didAutoSend.current = true;
    send(initialQuery);
  }, [initialQuery, messages.length, send]);

  // Email capture: show after 3 assistant replies, once per user.
  const assistantReplies = messages.filter((m) => m.role === "assistant").length;
  const shouldShowEmailCapture =
    !emailCaptureShown && assistantReplies >= 3 && !loading;

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || emailStatus === "loading") return;
    setEmailStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "ask-chat" }),
      });
      setEmailStatus("done");
      setEmailCaptureShown(true);
      try {
        localStorage.setItem("aiarsenal-chat-email-shown", "1");
      } catch {}
      if (window.plausible) {
        window.plausible("Newsletter Signup", { props: { source: "ask" } });
      }
    } catch {
      setEmailStatus("error");
    }
  };

  const dismissEmailCapture = () => {
    setEmailCaptureShown(true);
    try {
      localStorage.setItem("aiarsenal-chat-email-shown", "1");
    } catch {}
  };

  const messagesWithHandlers = messages.map((m, i) =>
    m.role === "assistant" && i === messages.length - 1
      ? { ...m, onFollowup: handleFollowup }
      : m
  );

  const clearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem("aiarsenal-chat");
    } catch {}
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 820,
        margin: "0 auto",
        padding: "24px 20px 0",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "var(--text-faint)",
                textDecoration: "none",
              }}
            >
              ← AIArsenal
            </Link>
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "monospace",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-strong)",
              letterSpacing: -0.3,
            }}
          >
            Ask <span style={{ color: ACCENT }}>AIArsenal</span>
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "var(--text-secondary)",
              fontFamily: "monospace",
            }}
          >
            Conversational AI stack advisor — 206+ tools at your fingertips
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              padding: "6px 10px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--text-faint)",
            }}
          >
            NEW CHAT
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 20,
        }}
        className="no-scrollbar"
      >
        {messages.length === 0 && !loading && (
          <div style={{ paddingTop: 32 }}>
            <div
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1.5,
                color: "var(--text-faint)",
                marginBottom: 14,
              }}
            >
              TRY ASKING
            </div>
            <div
              style={{
                display: "grid",
                gap: 8,
              }}
            >
              {STARTER_PROMPTS.map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ x: 2 }}
                  onClick={() => send(p)}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontFamily: "monospace",
                    fontSize: 12.5,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${ACCENT}40`;
                    e.currentTarget.style.color = "var(--text-strong)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <span style={{ color: ACCENT, marginRight: 8 }}>›</span>
                  {p}
                </motion.button>
              ))}
            </div>
            <p
              style={{
                marginTop: 24,
                fontSize: 10,
                fontFamily: "monospace",
                color: "var(--text-faint)",
                lineHeight: 1.6,
              }}
            >
              AIArsenal is a free directory funded by affiliate partnerships.
              Some recommendations include affiliate links that support the
              site at no cost to you.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messagesWithHandlers.map((m, i) => (
            <Message key={i} message={m} />
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ paddingLeft: 0, marginBottom: 20 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontFamily: "monospace",
                color: "var(--text-faint)",
              }}
            >
              <TypingDots /> thinking...
            </div>
          </motion.div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: "monospace",
              color: "#f87171",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {shouldShowEmailCapture && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "16px 18px",
              background: `${ACCENT}06`,
              border: `1px solid ${ACCENT}25`,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-strong)",
                    marginBottom: 4,
                  }}
                >
                  Liking the recommendations?
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  Get weekly AI tool picks in your inbox — hand-curated, no spam.
                </div>
              </div>
              <button
                onClick={dismissEmailCapture}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "var(--text-faint)",
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            {emailStatus === "done" ? (
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#10b981",
                }}
              >
                ✓ Subscribed. Check your inbox on Monday.
              </div>
            ) : (
              <form onSubmit={submitEmail}>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    padding: 4,
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    disabled={emailStatus === "loading"}
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
                    disabled={emailStatus === "loading"}
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "6px 12px",
                      background: `${ACCENT}20`,
                      border: `1px solid ${ACCENT}50`,
                      color: ACCENT,
                      borderRadius: 6,
                      cursor: emailStatus === "loading" ? "wait" : "pointer",
                    }}
                  >
                    {emailStatus === "loading" ? "..." : "SUBSCRIBE"}
                  </button>
                </div>
                {emailStatus === "error" && (
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
            )}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{
          padding: "12px 0 20px",
          background: "var(--bg, #0a0a0a)",
          position: "sticky",
          bottom: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 12px",
            background: "var(--surface-1)",
            border: `1px solid ${input ? `${ACCENT}40` : "var(--border-bright)"}`,
            borderRadius: 12,
            transition: "border-color 0.15s",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              messages.length === 0
                ? "Ask anything about free AI tools..."
                : "Follow up..."
            }
            disabled={loading}
            autoFocus
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-strong)",
              fontSize: 13,
              fontFamily: "monospace",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              padding: "6px 14px",
              background:
                input.trim() && !loading ? `${ACCENT}20` : "transparent",
              border: `1px solid ${
                input.trim() && !loading ? `${ACCENT}50` : "var(--border)"
              }`,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: "monospace",
              color:
                input.trim() && !loading ? ACCENT : "var(--text-faint)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            SEND ↵
          </button>
        </div>
      </form>
    </div>
  );
}
