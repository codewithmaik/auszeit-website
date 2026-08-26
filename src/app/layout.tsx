import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, BUSINESS } from "@/lib/site";
import { getSiteSettings } from "@/db/queries";
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

const description =
  "Ihre Auszeit an der Mosel. Gemütlich, stilvoll, unvergesslich — traumhafter Moselblick, moderne Ausstattung, viel Liebe zum Detail.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AUSZEIT — Ferienwohnung an der Mosel",
    template: "%s — AUSZEIT Ferienwohnung an der Mosel",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "AUSZEIT Ferienwohnung an der Mosel",
    title: "AUSZEIT — Ferienwohnung an der Mosel",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "AUSZEIT — Ferienwohnung an der Mosel",
    description,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: BUSINESS.name,
    description,
    url: SITE_URL,
    telephone: settings.contactPhone,
    email: settings.contactEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contactAddress,
      addressCountry: BUSINESS.addressCountry,
    },
    image: `${SITE_URL}/images/hero-mosel.jpg`,
  };

  return (
    <html lang="de" className={`${playfair.variable} ${jost.variable}`}>
      <body className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
