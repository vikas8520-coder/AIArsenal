import ChatClient from "../../src/components/ChatClient";

export const metadata = {
  title: "Ask AIArsenal — Conversational AI Tool Advisor",
  description:
    "Ask natural questions about free AI tools, get cited recommendations from 206+ vetted tools. Multi-turn chat with AIArsenal's curator.",
  openGraph: {
    title: "Ask AIArsenal — Conversational AI Tool Advisor",
    description:
      "Ask natural questions about free AI tools, get cited recommendations from 206+ vetted tools.",
  },
  alternates: {
    canonical: "https://aiarsenal.dev/ask",
  },
};

export default function AskPage({ searchParams }) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  return <ChatClient initialQuery={q} />;
}
