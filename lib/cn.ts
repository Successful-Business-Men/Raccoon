import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Tell tailwind-merge that our custom `text-*` tokens (defined in
// tailwind.config.ts under `fontSize`) are font-size utilities — not
// text-color utilities. Without this, `cn("text-white", "text-meta")`
// collapses to just `text-meta`, which leaves primary buttons rendering
// dark-ink text on a dark accent background.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["hero", "section", "subsection", "card", "lede", "body", "meta"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
