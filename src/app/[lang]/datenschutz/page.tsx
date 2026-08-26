import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { getSiteSettings } from "@/db/queries";
import { isLocale, localeHref } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/datenschutz">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.datenschutz.metaTitle, alternates: { canonical: localeHref(lang, "/datenschutz") } };
}

export const revalidate = 3600;

export default async function DatenschutzPage({ params }: PageProps<"/[lang]/datenschutz">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = await getSiteSettings();
  const content =
    lang === "en" ? settings.datenschutzContentEn || settings.datenschutzContent : settings.datenschutzContent;

  return (
    <>
      <PageHero eyebrow={dict.datenschutz.eyebrow} title={dict.datenschutz.title} />
      <section className="py-20">
        <div className="max-w-[720px] mx-auto px-8">
          <p className="whitespace-pre-line text-ink-soft leading-relaxed">{content}</p>
        </div>
      </section>
    </>
  );
}
