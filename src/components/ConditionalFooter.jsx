"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() || "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Match SSR output on the first client render, then hide the
  // global footer on the homepage once hydrated. The DirectoryClient
  // renders its own footer inside the scrollable main area.
  const shouldShow = !mounted || pathname !== "/";
  if (!shouldShow) return null;
  return <Footer />;
}
