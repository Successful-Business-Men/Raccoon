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
  title: "Seagull — A toolkit for trans Americans",
  description:
    "Document an incident for a lawyer or filing agency, score a business before you walk in, see where your state stands on gender-affirming care, and plan a move without losing access. Free, private, built by and for the trans community.",
  metadataBase: new URL("https://seagull.app"),
  icons: { icon: "/seagull.png" },
  openGraph: {
    title: "Seagull — A toolkit for trans Americans",
    description:
      "Document discrimination, score a business before you walk in, track state laws on gender-affirming care, and plan a move without losing access.",
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
