"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { ANSWER_LABELS } from "../data/quiz-archetypes";
import { encodeQuizResult } from "../utils/quizResult";
import { readProfile } from "../lib/visitorIntel";

const ACCENT = "#00f0ff";

// ──────────────────────────────────────────────────────────────────────────
// Question definitions with icons
// ──────────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    key: "building",
    prompt: "What are you building?",
    sub: "Pick the main outcome you're chasing.",
    options: [
      { value: "ship-product", label: "Ship an AI product", icon: "🚀" },
      { value: "create-content", label: "Create content", icon: "🎬", sub: "writing, video, audio, images" },
      { value: "automate-work", label: "Automate work", icon: "⚡" },
      { value: "replace-paid", label: "Replace paid tools", icon: "💥", sub: "cancel those subscriptions" },
      { value: "learn-research", label: "Learn or research", icon: "🔬" },
      { value: "earn-income", label: "Earn income with AI", icon: "💸" },
    ],
  },
  {
    key: "role",
    prompt: "What's your role?",
    sub: "The lens you approach AI through.",
    options: [
      { value: "solo-dev", label: "Solo developer / founder", icon: "👨‍💻" },
      { value: "creator", label: "Creator / marketer", icon: "🎨" },
      { value: "biz-ops", label: "Business / ops pro", icon: "💼" },
      { value: "researcher", label: "Researcher / student", icon: "🎓" },
      { value: "non-technical", label: "Non-technical", icon: "🌱", sub: "just exploring" },
    ],
  },
  {
    key: "budget",
    prompt: "What's your budget at scale?",
    sub: "What you'd pay once your thing is working.",
    options: [
      { value: "free-only", label: "$0 always", icon: "🆓", sub: "free tiers only" },
      { value: "under-50", label: "Under $50/mo", icon: "☕", sub: "if it saves real time" },
      { value: "50-500", label: "$50–500/mo", icon: "💳", sub: "for a great tool" },
      { value: "enterprise", label: "Enterprise", icon: "🏛️", sub: "whatever works" },
    ],
  },
  {
    key: "technical",
    prompt: "How technical are you?",
    sub: "We'll match tool depth to your comfort zone.",
    options: [
      { value: "no-code", label: "I don't code", icon: "🎯" },
      { value: "copy-paste", label: "Copy-paste code", icon: "📋", sub: "SDKs are fine" },
      { value: "full-stack", label: "Full-stack dev", icon: "⚙️" },
      { value: "ml-engineer", label: "ML / infra engineer", icon: "🧠" },
    ],
  },
  {
    key: "privacy",
    prompt: "Privacy requirements?",
    sub: "How strict about where your data lives.",
    options: [
      { value: "cloud-ok", label: "Cloud is fine", icon: "☁️" },
      { value: "no-train", label: "Don't train on my data", icon: "🔒" },
      { value: "self-host", label: "Must be self-hostable", icon: "🏠", sub: "local or on-prem only" },
    ],
  },
];

// Conditional skip logic
function shouldSkip(question, answers) {
  if (question.key === "technical" && answers.role === "non-technical") {
    return { skip: true, autoAnswer: "no-code" };
  }
  return { skip: false };
}

// ──────────────────────────────────────────────────────────────────────────
// Screens
// ──────────────────────────────────────────────────────────────────────────

function Intro({ onStart }) {
  const [savedCount, setSavedCount] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = readProfile();
    setSavedCount((p.savedQuizResults || []).length);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      style={{
        maxWidth: 560,
        margin: "0 auto",
        textAlign: "center",
        padding: "8vh 24px 40px",
      }}
    >
      {savedCount > 0 && (
        <Link
          href="/quiz/library"
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            padding: "8px 14px",
            background: `${ACCENT}10`,
            border: `1px solid ${ACCENT}40`,
            color: ACCENT,
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          ★ YOUR LIBRARY ({savedCount})
        </Link>
      )}
      <div
        style={{
          fontSize: 10,
          fontFamily: "monospace",
          letterSpacing: 2.5,
          color: ACCENT,
          marginBottom: 16,
        }}
      >
        STACK QUIZ
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "monospace",
          fontSize: "clamp(30px, 6vw, 52px)",
          fontWeight: 700,
          color: "var(--text-strong)",
          letterSpacing: -1,
          lineHeight: 1.05,
        }}
      >
        Find your AI stack
        <br />
        in <span style={{ color: ACCENT }}>60 seconds</span>
      </h1>
      <p
        style={{
          margin: "22px auto 0",
          maxWidth: 460,
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--text-secondary)",
        }}
      >
        Answer 5 questions. Get a personalized 5–7 tool stack curated from the
        206+ tool catalog. Customize it. Share it. Ship.
      </p>
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        style={{
          marginTop: 32,
          padding: "16px 36px",
          background: ACCENT,
          color: "#000",
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.5,
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          boxShadow: `0 8px 32px ${ACCENT}30`,
        }}
      >
        START →
      </motion.button>
      <div
        style={{
          marginTop: 22,
          fontSize: 10,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          letterSpacing: 1,
        }}
      >
        NO SIGNUP · NO EMAIL · NO BULLSHIT
      </div>
    </motion.div>
  );
}

function QuestionCard({ question, progress, onAnswer, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "5vh 20px 40px",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-faint)",
              fontFamily: "monospace",
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            ← BACK
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              letterSpacing: 1.5,
              color: "var(--text-faint)",
              marginBottom: 4,
            }}
          >
            QUESTION {progress.current} OF {progress.total}
          </div>
          <div
            style={{
              height: 3,
              background: "var(--surface-2)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
              transition={{ duration: 0.4 }}
              style={{
                height: "100%",
                background: ACCENT,
              }}
            />
          </div>
        </div>
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily: "monospace",
          fontSize: "clamp(22px, 3.8vw, 30px)",
          fontWeight: 700,
          color: "var(--text-strong)",
          letterSpacing: -0.5,
          lineHeight: 1.2,
        }}
      >
        {question.prompt}
      </h2>
      {question.sub && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          {question.sub}
        </p>
      )}

      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {question.options.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            whileHover={{ x: 4, borderColor: `${ACCENT}80` }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(opt.value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "monospace",
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>
              {opt.icon}
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-strong)",
                }}
              >
                {opt.label}
              </div>
              {opt.sub && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-faint)",
                    marginTop: 2,
                  }}
                >
                  {opt.sub}
                </div>
              )}
            </div>
            <span
              style={{
                color: "var(--text-faint)",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              →
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function Assembling() {
  const tickers = [
    "Analyzing your goal...",
    "Matching 206 tools...",
    "Checking compatibility...",
    "Ranking alternatives...",
    "Polishing recommendations...",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setIdx((v) => (v + 1) % tickers.length), 900);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: "15vh 24px",
        textAlign: "center",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 28px",
          borderRadius: "50%",
          border: `2px solid ${ACCENT}25`,
          borderTopColor: ACCENT,
        }}
      />
      <div
        style={{
          fontSize: 10,
          fontFamily: "monospace",
          letterSpacing: 2,
          color: ACCENT,
          marginBottom: 10,
        }}
      >
        ASSEMBLING YOUR STACK
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          style={{
            fontFamily: "monospace",
            fontSize: 15,
            color: "var(--text-secondary)",
          }}
        >
          {tickers[idx]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────

export default function QuizClient() {
  const [phase, setPhase] = useState("intro"); // intro | quiz | assembling | result
  const [answers, setAnswers] = useState({});
  const [qIdx, setQIdx] = useState(0);
  const [history, setHistory] = useState([]); // for back button
  const [error, setError] = useState(null);
  const router = useRouter();
  const submitted = useRef(false);

  const go = useCallback((nextAnswers, fromIdx) => {
    // Find next non-skipped question
    let i = fromIdx + 1;
    while (i < QUESTIONS.length) {
      const { skip, autoAnswer } = shouldSkip(QUESTIONS[i], nextAnswers);
      if (skip) {
        nextAnswers = { ...nextAnswers, [QUESTIONS[i].key]: autoAnswer };
        i++;
      } else break;
    }
    return { nextAnswers, nextIdx: i };
  }, []);

  const handleAnswer = useCallback(
    (value) => {
      const q = QUESTIONS[qIdx];
      const nextAnswers = { ...answers, [q.key]: value };
      setHistory((h) => [...h, qIdx]);

      const { nextAnswers: finalAnswers, nextIdx } = go(nextAnswers, qIdx);
      setAnswers(finalAnswers);

      if (nextIdx >= QUESTIONS.length) {
        submitQuiz(finalAnswers);
      } else {
        setQIdx(nextIdx);
      }
    },
    [answers, qIdx, go]
  );

  const handleBack = useCallback(() => {
    if (history.length === 0) {
      setPhase("intro");
      setQIdx(0);
      return;
    }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setQIdx(prev);
  }, [history]);

  const submitQuiz = useCallback(
    async (finalAnswers) => {
      if (submitted.current) return;
      submitted.current = true;
      setPhase("assembling");
      setError(null);

      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Quiz Completed");
      }

      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: finalAnswers }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Request failed");

        const result = {
          archetype: data.archetype,
          tools: data.tools,
          answers: finalAnswers,
        };

        // Fire confetti just before navigation
        setTimeout(() => {
          if (typeof window !== "undefined") {
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.4 },
                colors: [
                  data.archetype.accent || "#00f0ff",
                  "#ffffff",
                  "#a855f7",
                ],
              });
            } catch {}
          }
        }, 100);

        // Redirect to result page with encoded data
        const encoded = encodeQuizResult(result);
        router.push(`/quiz/result?s=${encoded}`);
      } catch (e) {
        submitted.current = false;
        setError(e.message);
        setPhase("quiz");
      }
    },
    [router]
  );

  // Fire intro plausible event
  useEffect(() => {
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Quiz Viewed");
    }
  }, []);

  const handleStart = () => {
    setPhase("quiz");
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Quiz Started");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Home link */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          fontSize: 11,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          textDecoration: "none",
          zIndex: 50,
        }}
      >
        ← AIArsenal
      </Link>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <Intro key="intro" onStart={handleStart} />
        )}
        {phase === "quiz" && (
          <QuestionCard
            key={`q-${qIdx}`}
            question={QUESTIONS[qIdx]}
            progress={{ current: qIdx + 1, total: QUESTIONS.length }}
            onAnswer={handleAnswer}
            onBack={qIdx > 0 ? handleBack : null}
          />
        )}
        {phase === "assembling" && <Assembling key="assembling" />}
      </AnimatePresence>

      {error && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 14px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 11,
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
