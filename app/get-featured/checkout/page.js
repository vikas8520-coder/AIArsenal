import { Suspense } from "react";
import CheckoutFormClient from "../../../src/components/CheckoutFormClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Get Featured | AIArsenal",
  description:
    "Submit your tool details and complete payment to get featured on AIArsenal. Live in 48 hours.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFormClient />
    </Suspense>
  );
}
