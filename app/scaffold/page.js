import { Suspense } from "react";
import ScaffoldClient from "../../src/components/ScaffoldClient";

export const metadata = {
  title: "AI Starter Kit Generator — Turn Any Stack Into Code | AIArsenal",
  description:
    "Generate a complete starter kit for your AI stack — architecture diagram, env vars, step-by-step setup code, integration example, and deployment guide. Download as Markdown.",
  alternates: {
    canonical: "https://ai-arsenal-nu.vercel.app/scaffold",
  },
  openGraph: {
    title: "AI Starter Kit Generator — AIArsenal",
    description:
      "Gemini turns your chosen AI stack into a runnable starter kit with real code.",
  },
};

export default function ScaffoldPage() {
  return (
    <Suspense fallback={null}>
      <ScaffoldClient />
    </Suspense>
  );
}
