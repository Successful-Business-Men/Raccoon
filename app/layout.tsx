import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
    <html lang="en" className={`${nunito.variable} ${fredoka.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
