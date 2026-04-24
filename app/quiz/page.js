import QuizClient from "../../src/components/QuizClient";

export const metadata = {
  title: "Stack Quiz — Find Your Perfect AI Stack in 60 Seconds | AIArsenal",
  description:
    "Answer 5 quick questions and get a personalized 5–7 tool AI stack curated from 206+ free tools. No signup. Customize, save, and share.",
  alternates: {
    canonical: "https://ai-arsenal-nu.vercel.app/quiz",
  },
  openGraph: {
    title: "Stack Quiz — AIArsenal",
    description:
      "Find your perfect AI stack in 60 seconds. Personalized from 206+ free tools.",
  },
};

export default function QuizPage() {
  return <QuizClient />;
}
