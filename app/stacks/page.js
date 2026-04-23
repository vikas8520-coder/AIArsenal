import StackIndexClient from "../../src/components/StackIndexClient";

const BASE_URL = "https://ai-arsenal-nu.vercel.app";

export const metadata = {
  title: "AI Stack Recipes — Build Anything with Free AI Tools | AIArsenal",
  description:
    "Curated multi-tool recipes for AI builders. Ship a SaaS in a weekend, replace ChatGPT Plus for free, build a RAG bot, and more. Every stack has alternatives, quickstart steps, and hidden costs.",
  alternates: { canonical: `${BASE_URL}/stacks` },
  openGraph: {
    title: "AI Stack Recipes — AIArsenal",
    description:
      "Curated multi-tool recipes for AI builders. Every stack has role-by-role breakdowns, alternatives, and quickstart steps.",
    url: `${BASE_URL}/stacks`,
  },
};

export default function StacksPage() {
  return <StackIndexClient />;
}
