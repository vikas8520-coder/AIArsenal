import { Suspense } from "react";
import MultiCompareClient from "../../../src/components/MultiCompareClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare Multiple AI Tools — Bulk Comparison | AIArsenal",
  description:
    "Compare up to 5 AI tools side-by-side. Free tier, OSS status, privacy, editorial decision guides — all in one view.",
  alternates: {
    canonical: "https://ai-arsenal-nu.vercel.app/compare/multi",
  },
  openGraph: {
    title: "Compare Multiple AI Tools — AIArsenal",
    description:
      "Compare up to 5 AI tools side-by-side. Free tier, OSS, privacy, decision guides.",
  },
};

export default function MultiComparePage() {
  return (
    <Suspense fallback={null}>
      <MultiCompareClient />
    </Suspense>
  );
}
