import { Suspense } from "react";
import StackBuilderClient from "../../src/components/StackBuilderClient";

export const metadata = {
  title: "Build Your AI Stack — Interactive Composer | AIArsenal",
  description:
    "Compose your own AI stack from 206+ curated tools. Add roles, pick tools, save locally, and share via link. No account required.",
  alternates: {
    canonical: "https://ai-arsenal-nu.vercel.app/build",
  },
  openGraph: {
    title: "Build Your AI Stack — AIArsenal",
    description:
      "Interactive composer to assemble and share your own AI stack from 206+ tools.",
  },
};

export default function BuildPage() {
  return (
    <Suspense fallback={null}>
      <StackBuilderClient />
    </Suspense>
  );
}
