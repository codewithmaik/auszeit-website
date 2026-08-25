import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "AUSZEIT — Ferienwohnung an der Mosel",
    template: "%s — AUSZEIT Ferienwohnung an der Mosel",
  },
  description:
    "Ihre Auszeit an der Mosel. Gemütlich, stilvoll, unvergesslich — traumhafter Moselblick, moderne Ausstattung, viel Liebe zum Detail.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${playfair.variable} ${jost.variable}`}>
      <body className="flex flex-col min-h-screen">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
