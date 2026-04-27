import { Suspense } from "react";
import CheckoutSuccessClient from "../../../src/components/CheckoutSuccessClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Received — AIArsenal",
  description: "Your Featured listing payment was received. We're reviewing.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
