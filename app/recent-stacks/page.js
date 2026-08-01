import RecentStacksClient from "../../src/components/RecentStacksClient";

const BASE_URL = "https://ai-arsenal-nu.vercel.app";

export const metadata = {
  title: "Recent Stacks — Grouped & Compatibility-Checked | AIArsenal",
  description:
    "Recently added AI tools grouped by category with automatic stack compatibility checks. See which roles are filled, what's missing, and stack them in one click.",
  alternates: { canonical: `${BASE_URL}/recent-stacks` },
  openGraph: {
    title: "Recent Stacks — AIArsenal",
    description:
      "Recently added AI tools grouped by category with automatic stack compatibility checks.",
    url: `${BASE_URL}/recent-stacks`,
  },
};

export default function RecentStacksPage() {
  return <RecentStacksClient />;
}
