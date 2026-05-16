"use client";

import { useEffect, useRef } from "react";

/*
 * Two stacked <video> elements that crossfade so the loop seam of one is
 * hidden behind the other. When the currently-visible video has less than
 * CROSSFADE_LEAD_S left to play, the second video starts from frame 0 and
 * we swap opacity over TRANSITION_MS. The finished video pauses itself on
 * `ended` so it's ready to take the next handoff.
 */

const CROSSFADE_LEAD_S = 0.6;
const TRANSITION_MS = 700;

export function WaveVideo() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<"a" | "b">("a");

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    a.play().catch(() => {});

    const onTimeUpdate = () => {
      const active = activeRef.current === "a" ? a : b;
      const inactive = activeRef.current === "a" ? b : a;
      const inactiveName = activeRef.current === "a" ? "b" : "a";
      if (!Number.isFinite(active.duration)) return;
      const remaining = active.duration - active.currentTime;
      if (remaining <= CROSSFADE_LEAD_S && inactive.paused) {
        inactive.currentTime = 0;
        inactive.play().catch(() => {});
        active.style.opacity = "0";
        inactive.style.opacity = "1";
        activeRef.current = inactiveName;
      }
    };

    const onEnded = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      v.pause();
      v.currentTime = 0;
    };

    a.addEventListener("timeupdate", onTimeUpdate);
    b.addEventListener("timeupdate", onTimeUpdate);
    a.addEventListener("ended", onEnded);
    b.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTimeUpdate);
      b.removeEventListener("timeupdate", onTimeUpdate);
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
    };
  }, []);

  const cls =
    "absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity ease-linear";

  return (
    <>
      <video
        ref={aRef}
        aria-hidden
        muted
        playsInline
        preload="auto"
        poster="/wave-poster.jpg"
        className={cls}
        style={{ opacity: 1, transitionDuration: `${TRANSITION_MS}ms` }}
      >
        <source src="/wave.mp4" type="video/mp4" />
      </video>
      <video
        ref={bRef}
        aria-hidden
        muted
        playsInline
        preload="auto"
        className={cls}
        style={{ opacity: 0, transitionDuration: `${TRANSITION_MS}ms` }}
      >
        <source src="/wave.mp4" type="video/mp4" />
      </video>
    </>
  );
}
