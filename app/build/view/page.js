import { Suspense } from "react";
import StackBuilderClient from "../../../src/components/StackBuilderClient";
import { decodeCustomStack } from "../../../src/utils/customStack";

export function generateMetadata({ searchParams }) {
  const encoded = typeof searchParams?.s === "string" ? searchParams.s : "";
  const decoded = decodeCustomStack(encoded);
  if (!decoded || !decoded.name) {
    return {
      title: "Shared AI Stack | AIArsenal",
      description: "A custom AI stack shared from AIArsenal's stack builder.",
    };
  }
  return {
    title: `${decoded.name} — Shared AI Stack | AIArsenal`,
    description:
      decoded.description ||
      `A custom AI stack with ${decoded.roles.length} tools, shared from AIArsenal.`,
    openGraph: {
      title: decoded.name,
      description:
        decoded.description ||
        `${decoded.roles.length}-tool custom AI stack.`,
    },
  };
}

export default function BuildViewPage({ searchParams }) {
  const encoded = typeof searchParams?.s === "string" ? searchParams.s : "";
  return (
    <Suspense fallback={null}>
      <StackBuilderClient readOnly initialEncoded={encoded} />
    </Suspense>
  );
}
