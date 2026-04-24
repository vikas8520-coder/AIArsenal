import QuizLibraryClient from "../../../src/components/QuizLibraryClient";

export const metadata = {
  title: "Your Quiz Library — AIArsenal",
  description:
    "Re-watch any saved Stack Quiz result. Scaffold, customize, or share past archetypes.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function QuizLibraryPage() {
  return <QuizLibraryClient />;
}
