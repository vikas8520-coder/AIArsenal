import GetFeaturedClient from "../../src/components/GetFeaturedClient";

export const metadata = {
  title: "Get Featured on AIArsenal — Reach 20K+ AI Builders",
  description:
    "Featured placement in the AIArsenal directory reaches 20,000+ high-intent AI builders actively choosing tools. Tiers from $99/mo. Live in 48 hours.",
  openGraph: {
    title: "Get Featured on AIArsenal",
    description:
      "Featured placement reaches 20,000+ high-intent AI builders. Tiers from $99/mo. Live in 48 hours.",
  },
  alternates: {
    canonical: "https://aiarsenal.dev/get-featured",
  },
};

export default function GetFeaturedPage() {
  return <GetFeaturedClient />;
}
