"use client";
import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Listens to deviceorientation events on touch devices and returns
 * { tilt, needsPermission, request } where:
 *   - tilt: normalized {x, y} 0..1 derived from gamma/beta, or null
 *   - needsPermission: true on iOS 13+ until permission has been granted
 *   - request: call from a user gesture to trigger the iOS prompt
 *
 * On non-iOS browsers we attach immediately and ignore needsPermission.
 */
export default function useDeviceTilt({ enabled = true } = {}) {
  const [tilt, setTilt] = useState(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const attachedRef = useRef(false);

  const onOrientation = useCallback((e) => {
    const g = Math.max(-30, Math.min(30, e.gamma ?? 0));
    const b = Math.max(-30, Math.min(30, (e.beta ?? 0) - 30));
    setTilt({
      x: 0.5 + g / 60,
      y: 0.5 + b / 60,
    });
  }, []);

  const attach = useCallback(() => {
    if (attachedRef.current) return;
    attachedRef.current = true;
    window.addEventListener("deviceorientation", onOrientation);
    setNeedsPermission(false);
  }, [onOrientation]);

  // Public: request iOS permission. Must be called from a user gesture.
  const request = useCallback(async () => {
    if (typeof window === "undefined") return false;
    if (typeof DeviceOrientationEvent === "undefined") return false;
    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== "granted") return false;
      }
      attach();
      return true;
    } catch {
      attach();
      return true;
    }
  }, [attach]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (typeof DeviceOrientationEvent === "undefined") return;

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // iOS 13+ — wait for explicit user gesture
      setNeedsPermission(true);
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      attachedRef.current = false;
    };
  }, [enabled, attach, onOrientation]);

  return { tilt, needsPermission, request };
}
