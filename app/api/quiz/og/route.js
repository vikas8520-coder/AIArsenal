import { ImageResponse } from "next/og";
import { decodeQuizResult } from "../../../../src/utils/quizResult";
import { getArchetypeBySlug } from "../../../../src/data/quiz-archetypes";
import { TOOLS } from "../../../../src/data/tools";

export const runtime = "edge";
export const contentType = "image/png";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("s") || "";
  const decoded = decodeQuizResult(encoded);
  const archetype = decoded ? getArchetypeBySlug(decoded.archetypeSlug) : null;

  const width = 1200;
  const height = 630;

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
            fontSize: 40,
          }}
        >
          AIArsenal Quiz
        </div>
      ),
      { width, height }
    );
  }

  const accent = archetype.accent || "#00f0ff";
  const toolNames = decoded.tools
    .slice(0, 7)
    .map((t) => TOOLS.find((x) => x.id === t.id)?.name)
    .filter(Boolean);

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
          padding: "60px 72px",
          justifyContent: "space-between",
        }}
      >
        {/* Accent gradient glow */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: accent,
            opacity: 0.18,
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "#a855f7",
            opacity: 0.12,
            filter: "blur(100px)",
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: 6,
              color: accent,
              display: "flex",
            }}
          >
            AIARSENAL · STACK QUIZ
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#555",
              letterSpacing: 1,
              display: "flex",
            }}
          >
            ai-arsenal-nu.vercel.app
          </div>
        </div>

        {/* Middle — archetype */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 2,
              color: "#999",
              marginBottom: 12,
              display: "flex",
            }}
          >
            I AM
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1,
              color: "#ffffff",
              display: "flex",
            }}
          >
            {archetype.name.replace(/^The /, "")}
          </div>
          <div
            style={{
              fontSize: 26,
              color: accent,
              marginTop: 18,
              letterSpacing: 0.5,
              display: "flex",
            }}
          >
            "{archetype.tagline}"
          </div>
        </div>

        {/* Bottom — tools */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 16,
              letterSpacing: 3,
              color: "#777",
              display: "flex",
            }}
          >
            MY {toolNames.length}-TOOL STACK
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {toolNames.map((name) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  fontSize: 20,
                  padding: "10px 18px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${accent}40`,
                  borderRadius: 8,
                  color: "#ffffff",
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
