import { notFound } from "next/navigation";
import { locales, isLocale } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";
import CookieConsent from "@/components/cookies/CookieConsent";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      {children}
      <CookieConsent locale={lang} dict={dict.cookies} />
    </>
  );
}
