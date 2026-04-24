import ChatClient from "../../src/components/ChatClient";

export const dynamic = "force-dynamic";

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

export default async function AskPage({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp?.q === "string" ? sp.q : "";
  return <ChatClient initialQuery={q} />;
}
