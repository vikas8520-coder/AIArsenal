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

/**
 * True if the user has enabled prefers-reduced-motion OR is on a coarse
 * pointer (mobile). We use this to disable expensive infinite animations
 * on devices that can't afford them.
 */
export function useShouldReduceMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq1 = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mq2 = window.matchMedia("(pointer: coarse)");
    const update = () => setReduced(mq1.matches || mq2.matches);
    update();
    mq1.addEventListener("change", update);
    mq2.addEventListener("change", update);
    return () => {
      mq1.removeEventListener("change", update);
      mq2.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}
