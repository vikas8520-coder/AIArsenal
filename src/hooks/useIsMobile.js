"use client";
import { useEffect, useState } from "react";

/**
 * Returns true once mounted if viewport is mobile-width.
 * Returns false on SSR / server render so we never desync layouts.
 */
export default function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
