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
  title: "Seagull — A Translator Between You And Your Doctor",
  description:
    "Type your meds and surgeries once. Hand the doctor a card that explains your transition in 30 seconds. Find out if a weird lab number is actually a problem — or just normal for your hormones.",
  metadataBase: new URL("https://seagull.app"),
  icons: { icon: "/seagull.png" },
  openGraph: {
    title: "Seagull — A Translator Between You And Your Doctor",
    description:
      "A Previsit Card so doctors look at the thing that hurts. A lab checker so a weird number doesn't burn a month of your life. Built by trans people, for trans people.",
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
