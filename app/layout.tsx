import type { Metadata } from "next";
import { Courier_Prime, Caveat_Brush } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

// Body font. Courier Prime ships weights 400 and 700 only.
const courier = Courier_Prime({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
  display: "swap",
});

// Display font for the "Seagull" wordmark. Caveat Brush is the closest
// free Google Fonts match for TT Milks Casual Script One — swap in
// the real TT Milks via @font-face if you have a license.
const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
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
    <html lang="en" className={`${courier.variable} ${caveatBrush.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
