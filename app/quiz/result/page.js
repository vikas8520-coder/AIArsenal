import { Suspense } from "react";
import QuizResultClient from "../../../src/components/QuizResultClient";
import { decodeQuizResult } from "../../../src/utils/quizResult";
import { getArchetypeBySlug } from "../../../src/data/quiz-archetypes";

const BASE_URL = "https://ai-arsenal-nu.vercel.app";

// Always render on request — never cache stale results by s=
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const encoded = typeof sp?.s === "string" ? sp.s : "";
  const decoded = decodeQuizResult(encoded);
  const archetype = decoded ? getArchetypeBySlug(decoded.archetypeSlug) : null;

  if (!archetype) {
    return {
      title: "Quiz Result | AIArsenal",
      description: "Your personalized AI stack from AIArsenal's 5-question quiz.",
    };
  }

  const ogUrl = `${BASE_URL}/api/quiz/og?s=${encoded}`;

  return {
    title: `I'm ${archetype.name} — My AI Stack | AIArsenal`,
    description: `${archetype.identity} See the ${decoded.tools.length}-tool stack I got.`,
    openGraph: {
      title: `I'm ${archetype.name}`,
      description: archetype.tagline,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `I'm ${archetype.name} · AIArsenal Quiz`,
      description: archetype.tagline,
      images: [ogUrl],
    },
  };
}

export default async function QuizResultPage({ searchParams }) {
  const sp = await searchParams;
  const encoded = typeof sp?.s === "string" ? sp.s : "";
  const decoded = decodeQuizResult(encoded);

  return (
    <Suspense fallback={null}>
      <QuizResultClient result={decoded} />
    </Suspense>
  );
}
