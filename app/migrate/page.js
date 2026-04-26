import MigrateClient from "../../src/components/MigrateClient";

export const metadata = {
  title: "Migration Assistant — Replace Paid AI Tools for $0 | AIArsenal",
  description:
    "Tell us what paid AI tool you're cancelling and we'll find the closest free alternative, the honest tradeoffs, and concrete migration steps. Powered by AI over 207+ vetted free tools.",
  alternates: {
    canonical: "https://ai-arsenal-nu.vercel.app/migrate",
  },
  openGraph: {
    title: "AI Migration Assistant — AIArsenal",
    description:
      "Replace any paid AI tool with a free alternative. Honest tradeoffs + concrete migration steps.",
  },
};

export default function MigratePage() {
  return <MigrateClient />;
}
