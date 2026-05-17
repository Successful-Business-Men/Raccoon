import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          primary: "#1D1D1F",
          secondary: "#6E6E73",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          inset: "#FAFAFA",
        },
        accent: {
          DEFAULT: "#2C2C2E",
          hover: "#1D1D1F",
        },
        brand: {
          DEFAULT: "#218cff",
          hover: "#6ab4ff",
          active: "#1a70cc",
        },
        status: {
          protected: "#34C759",
          legal: "#A7D8A7",
          restricted: "#FF9500",
          banned: "#FF3B30",
          litigation: "#8E8E93",
        },
        sea: {
          sky: "#F0F9FF",
          foam: "#E0F2FE",
          mist: "#BAE6FD",
          tide: "#7DD3FC",
          deep: "#38BDF8",
          ink: "#0F2A3D",
        },
        divider: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        hero: ["64px", { lineHeight: "1.08", fontWeight: "700", letterSpacing: "-0.02em" }],
        section: ["40px", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.015em" }],
        subsection: ["26px", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "-0.005em" }],
        card: ["20px", { lineHeight: "1.35", fontWeight: "700" }],
        lede: ["20px", { lineHeight: "1.5", fontWeight: "400" }],
        body: ["17px", { lineHeight: "1.55", fontWeight: "400" }],
        meta: ["14px", { lineHeight: "1.45", fontWeight: "400" }],
      },
      borderRadius: {
        card: "20px",
        btn: "12px",
        chip: "999px",
        icon: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        cardHover: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
        nav: "0 1px 0 rgba(0,0,0,0.06)",
      },
      maxWidth: {
        page: "1200px",
        prose: "720px",
        plan: "800px",
      },
      spacing: {
        section: "96px",
        subsection: "48px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-25%)" },
        },
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        "btn-bounce": {
          "0%":   { transform: "scale(1)" },
          "30%":  { transform: "scale(1.08)" },
          "60%":  { transform: "scale(0.94)" },
          "80%":  { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        aurora: "aurora 60s linear infinite",
        "btn-bounce": "btn-bounce 0.4s ease-in-out both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
