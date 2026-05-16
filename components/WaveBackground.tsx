/*
 * Four bottom-anchored wave bands stacked to create a parallax ocean.
 * All the visual logic (colors, heights, scroll speeds, wave shapes)
 * lives in the .wave-layer-* CSS classes in globals.css.
 */
export function WaveBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <div className="wave-layer wave-layer-1" />
      <div className="wave-layer wave-layer-2" />
      <div className="wave-layer wave-layer-3" />
      <div className="wave-layer wave-layer-4" />
    </div>
  );
}
