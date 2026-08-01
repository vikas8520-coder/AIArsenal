import CanvasEditor from "@/src/components/canvas/CanvasEditor";

export const metadata = {
  title: "Stack Canvas — Visual AI Workflow Builder | AIArsenal",
  description:
    "Drag AI tools onto an infinite canvas, connect them into workflows, and see how your stack fits together. Load starter templates or build from scratch.",
  openGraph: {
    title: "Stack Canvas — Visual AI Workflow Builder | AIArsenal",
    description:
      "Compose AI tools visually: drag, connect, and export workflows. Free, no signup.",
    type: "website",
    url: "/canvas",
  },
  alternates: { canonical: "/canvas" },
  robots: { index: false, follow: true },
};

export default function CanvasPage() {
  return (
    <main style={{ height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <CanvasEditor />
    </main>
  );
}
