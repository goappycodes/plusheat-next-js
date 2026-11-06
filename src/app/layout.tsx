import type { Metadata } from "next";
import { Roboto, Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.plusheat.co.uk"),
  title: {
    default: "Home Emergency Cover | Starting From £4.99 A Month | PlusHeat",
    template: "%s | PlusHeat",
  },
  description:
    "Reliable protection for your boiler, central heating system and much more – all in one place. Boiler cover from £4.99 a month with a free annual boiler service.",
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${rubik.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
