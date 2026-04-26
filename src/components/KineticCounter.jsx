"use client";
import { useEffect, useState, useRef } from "react";

/**
 * Counts from 0 up to `target` over `duration` ms with eased animation.
 * Pads to `pad` digits.
 */
export default function KineticCounter({
  target,
  duration = 1400,
  pad = 0,
  delay = 0,
}) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now() + delay;
    const tick = () => {
      const now = Date.now();
      if (now < start) {
        requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [target, duration, delay]);

  const text = pad > 0 ? String(val).padStart(pad, "0") : String(val);
  return <>{text}</>;
}
