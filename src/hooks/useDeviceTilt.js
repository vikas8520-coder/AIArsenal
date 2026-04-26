"use client";
import { useEffect, useState, useRef } from "react";

/**
 * Listens to deviceorientation events on touch devices and returns a
 * normalized {x, y} pair where each value is between 0..1. x maps from
 * gamma (left/right tilt) and y from beta (front/back tilt).
 *
 * Returns null on platforms that don't expose orientation. iOS 13+
 * requires explicit permission — we attempt to request it on the first
 * user touch, falling back silently if it isn't granted.
 *
 * Same shape as the cursor-driven {x, y} HolographicCard already uses,
 * so a component can swap them with one ternary.
 */
export default function useDeviceTilt({ enabled = true } = {}) {
  const [tilt, setTilt] = useState(null);
  const askedRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (typeof DeviceOrientationEvent === "undefined") return;

    const onOrientation = (e) => {
      // gamma: -90..90 (left/right)  beta: -180..180 (front/back)
      const g = Math.max(-30, Math.min(30, e.gamma ?? 0));
      const b = Math.max(-30, Math.min(30, (e.beta ?? 0) - 30));
      setTilt({
        x: 0.5 + g / 60, // 0..1
        y: 0.5 + b / 60, // 0..1
      });
    };

    // iOS 13+ Safari requires explicit permission on a user gesture
    const requestIfNeeded = async () => {
      if (askedRef.current) return;
      askedRef.current = true;
      try {
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          const r = await DeviceOrientationEvent.requestPermission();
          if (r !== "granted") return;
        }
        window.addEventListener("deviceorientation", onOrientation);
      } catch {
        // Quiet fallback — non-iOS browsers fire events without permission
        window.addEventListener("deviceorientation", onOrientation);
      }
    };

    // Non-iOS: just attach. iOS: attach on first touch.
    if (typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", onOrientation);
    } else {
      const onceTouch = () => {
        requestIfNeeded();
        window.removeEventListener("touchstart", onceTouch);
      };
      window.addEventListener("touchstart", onceTouch, { passive: true });
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [enabled]);

  return tilt;
}
