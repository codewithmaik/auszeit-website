import type { Metadata } from "next";
import { headers } from "next/headers";
import { Jost, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, BUSINESS } from "@/lib/site";
import { getSiteSettings } from "@/db/queries";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";
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

async function currentLocale(): Promise<Locale> {
  const headerLocale = (await headers()).get("x-locale") ?? "";
  return isLocale(headerLocale) ? headerLocale : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.defaultTitle,
      template: dict.meta.titleTemplate,
    },
    description: dict.meta.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: dict.meta.ogLocale,
      url: SITE_URL,
      siteName: dict.meta.siteName,
      title: dict.meta.defaultTitle,
      description: dict.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.defaultTitle,
      description: dict.meta.description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const settings = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: BUSINESS.name,
    description: dict.meta.description,
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
    <html lang={locale} className={`${playfair.variable} ${jost.variable}`}>
      <body className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Header locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
