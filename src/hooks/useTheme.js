"use client";

import { useSyncExternalStore } from "react";

function getTheme() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") || "dark";
}

function subscribe(callback) {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "data-theme") {
        callback();
        return;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });
  return () => observer.disconnect();
}

export default function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => "dark");
}
