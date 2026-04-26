import { ImageResponse } from "next/og";
import { decodeQuizResult } from "../../../../src/utils/quizResult";
import { getArchetypeBySlug } from "../../../../src/data/quiz-archetypes";
import { TOOLS } from "../../../../src/data/tools";

export const runtime = "edge";
export const contentType = "image/png";

// Tiny deterministic PRNG (xmur3 + mulberry32) — same shape as
// GenerativeSigil so the poster's mark matches what's in the result page.
function makeRng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^= h >>> 16);
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSigilPaths(seed) {
  const rng = makeRng(seed || "default");
  const cx = 60;
  const cy = 60;
  const rayCount = 3 + Math.floor(rng() * 3);
  const paths = [];
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + rng() * 0.5;
    const len = 22 + rng() * 20;
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len;
    const perp = angle + Math.PI / 2;
    const bend = (rng() - 0.5) * 18;
    const mx = (cx + x2) / 2 + Math.cos(perp) * bend;
    const my = (cy + y2) / 2 + Math.sin(perp) * bend;
    paths.push(`M ${cx} ${cy} Q ${mx} ${my} ${x2} ${y2}`);
  }
  const dotCount = 4 + Math.floor(rng() * 4);
  const dots = [];
  for (let i = 0; i < dotCount; i++) {
    const a = rng() * Math.PI * 2;
    const r = 12 + rng() * 34;
    dots.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      s: 0.8 + rng() * 1.6,
    });
  }
  let h = 0;
  for (let i = 0; i < (seed || "").length; i++) {
    h = (h * 31 + (seed || "").charCodeAt(i)) >>> 0;
  }
  const label = h.toString(16).padStart(8, "0").slice(0, 6).toUpperCase();
  return { paths, dots, label };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("s") || "";
  const decoded = decodeQuizResult(encoded);
  const archetype = decoded ? getArchetypeBySlug(decoded.archetypeSlug) : null;

  const W = 1080;
  const H = 1920;

  if (!archetype || !decoded) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00f0ff",
            fontFamily: "monospace",
            fontSize: 64,
          }}
        >
          AIArsenal Stack Quiz
        </div>
      ),
      { width: W, height: H }
    );
  }

  const accent = archetype.accent || "#00f0ff";
  const sigilSeed =
    archetype.slug +
    "|" +
    Object.entries(decoded.answers || {})
      .sort()
      .map(([k, v]) => `${k}:${v}`)
      .join("|") +
    "|" +
    (decoded.tools || [])
      .map((t) => t.id)
      .sort()
      .join(",");

  const { paths, dots, label } = buildSigilPaths(sigilSeed);
  const tools = decoded.tools.slice(0, 7);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "monospace",
          position: "relative",
          padding: "70px 64px 56px",
          justifyContent: "space-between",
        }}
      >
        {/* Decorative gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -240,
            right: -180,
            width: 720,
            height: 720,
            borderRadius: "50%",
            background: accent,
            opacity: 0.18,
            filter: "blur(140px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: -200,
            width: 760,
            height: 760,
            borderRadius: "50%",
            background: "#a855f7",
            opacity: 0.15,
            filter: "blur(160px)",
            display: "flex",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 26,
              letterSpacing: 6,
              color: accent,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: accent,
                display: "flex",
              }}
            />
            AIARSENAL · STACK QUIZ
          </div>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 2,
              color: "#666",
              display: "flex",
            }}
          >
            1 OF 10
          </div>
        </div>

        {/* Identity block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 6,
              color: "#888",
              display: "flex",
            }}
          >
            I AM
          </div>
          <div
            style={{
              fontSize: 144,
              fontWeight: 700,
              letterSpacing: -5,
              lineHeight: 1,
              color: "#ffffff",
              display: "flex",
            }}
          >
            {archetype.name.replace(/^The /, "")}
          </div>
          <div
            style={{
              fontSize: 36,
              color: accent,
              letterSpacing: 0.5,
              display: "flex",
            }}
          >
            "{archetype.tagline}"
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#aaa",
              lineHeight: 1.4,
              maxWidth: 880,
              display: "flex",
            }}
          >
            {archetype.identity}
          </div>
        </div>

        {/* Sigil + tool list block */}
        <div
          style={{
            display: "flex",
            gap: 36,
            alignItems: "flex-start",
          }}
        >
          {/* Sigil */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                color: "#888",
                display: "flex",
              }}
            >
              SIGIL
            </div>
            <svg
              width={240}
              height={240}
              viewBox="0 0 120 120"
              style={{ display: "block" }}
            >
              <circle
                cx={60}
                cy={60}
                r={54}
                fill="none"
                stroke={accent}
                strokeWidth="0.7"
                strokeOpacity="0.4"
              />
              <circle
                cx={60}
                cy={60}
                r={20}
                fill={accent}
                fillOpacity="0.1"
                stroke={accent}
                strokeWidth="0.6"
              />
              {paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={accent}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity={0.95}
                />
              ))}
              {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={accent} />
              ))}
              <circle cx={60} cy={60} r={2.5} fill={accent} />
            </svg>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 4,
                color: accent,
                opacity: 0.7,
                display: "flex",
              }}
            >
              {label}
            </div>
          </div>

          {/* Tools */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                color: "#888",
                display: "flex",
              }}
            >
              MY {tools.length}-TOOL STACK
            </div>
            {tools.map((t, i) => {
              const tool = TOOLS.find((x) => x.id === t.id);
              if (!tool) return null;
              return (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "14px 22px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${accent}30`,
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      color: "#666",
                      letterSpacing: 2,
                      display: "flex",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      color: "#ffffff",
                      fontWeight: 700,
                      letterSpacing: -0.5,
                      display: "flex",
                    }}
                  >
                    {tool.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 22,
            borderTop: `1px solid ${accent}25`,
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#888",
              letterSpacing: 1.5,
              display: "flex",
            }}
          >
            ai-arsenal-nu.vercel.app/quiz
          </div>
          <div
            style={{
              fontSize: 20,
              color: accent,
              letterSpacing: 4,
              display: "flex",
            }}
          >
            FIND YOUR STACK →
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
