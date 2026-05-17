"use client";

import { useEffect } from "react";

export function SpotlightCursor() {
  useEffect(() => {
    const root = document.documentElement;
    const handleMove = (e: PointerEvent) => {
      root.style.setProperty("--spot-x", e.clientX.toFixed(2) + "px");
      root.style.setProperty("--spot-y", e.clientY.toFixed(2) + "px");
    };
    document.addEventListener("pointermove", handleMove);
    return () => document.removeEventListener("pointermove", handleMove);
  }, []);
  return null;
}
