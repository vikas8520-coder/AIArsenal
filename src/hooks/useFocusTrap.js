"use client";
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled]):not([aria-hidden="true"])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function isVisible(el) {
  if (el.disabled || el.getAttribute("aria-hidden") === "true") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function useFocusTrap({ open, containerRef, restoreFocus = true }) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      const container = containerRef.current;
      if (!container) return;

      // Wait for the panel to mount and any initial focus to settle, then
      // move focus into the container if it isn't already inside.
      const timer = setTimeout(() => {
        if (container.contains(document.activeElement)) return;
        const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible);
        if (focusable.length > 0) focusable[0].focus();
      }, 0);

      const onKeyDown = (e) => {
        if (e.key !== "Tab") return;
        const container = containerRef.current;
        if (!container) return;
        const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !container.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !container.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", onKeyDown, true);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("keydown", onKeyDown, true);
      };
    }

    // Restore focus on close
    if (restoreFocus) {
      const prev = previousFocusRef.current;
      if (prev && document.contains(prev) && typeof prev.focus === "function") {
        setTimeout(() => prev.focus(), 0);
      }
      previousFocusRef.current = null;
    }
  }, [open, restoreFocus, containerRef]);
}
