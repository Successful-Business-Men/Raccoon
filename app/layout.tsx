import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "Seagull — Resourceful tools for hostile terrain",
  description:
    "Three tools to help you document discrimination, understand your state's laws, and plan for care continuity. Free, private, built with the trans community in mind.",
  metadataBase: new URL("https://seagull.app"),
  icons: { icon: "/seagull.png" },
  openGraph: {
    title: "Seagull — Resourceful tools for hostile terrain",
    description:
      "Document discrimination, understand state laws, and plan care continuity.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
