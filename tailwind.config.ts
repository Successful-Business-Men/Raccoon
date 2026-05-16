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
        status: {
          protected: "#34C759",
          legal: "#A7D8A7",
          restricted: "#FF9500",
          banned: "#FF3B30",
          litigation: "#8E8E93",
        },
        divider: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        hero: ["56px", { lineHeight: "1.05", fontWeight: "600", letterSpacing: "-0.02em" }],
        section: ["32px", { lineHeight: "1.15", fontWeight: "600", letterSpacing: "-0.01em" }],
        body: ["17px", { lineHeight: "1.5", fontWeight: "400" }],
        meta: ["14px", { lineHeight: "1.4", fontWeight: "400" }],
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
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
