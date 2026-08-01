import AutomationGallery from "@/src/components/automations/AutomationGallery";

export const metadata = {
  title: "Automation Templates — Visual AI Workflows | AIArsenal",
  description:
    "Browse 12 pre-built automation templates connecting AI tools. From research assistants to full-stack AI apps. Open any template in the visual canvas and customize.",
  openGraph: {
    title: "Automation Templates — Visual AI Workflows | AIArsenal",
    description:
      "12 ready-to-use workflows for research, content, code, data, and more. Free templates, visual canvas.",
    type: "website",
    url: "/automations",
  },
  alternates: { canonical: "/automations" },
};

export default function AutomationsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <AutomationGallery />
    </main>
  );
}