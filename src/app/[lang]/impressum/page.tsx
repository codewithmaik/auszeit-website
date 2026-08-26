import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { getSiteSettings } from "@/db/queries";
import { isLocale, localeHref } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/impressum">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.impressum.metaTitle, alternates: { canonical: localeHref(lang, "/impressum") } };
}

export const revalidate = 3600;

export default async function ImpressumPage({ params }: PageProps<"/[lang]/impressum">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = await getSiteSettings();
  const content = lang === "en" ? settings.impressumContentEn || settings.impressumContent : settings.impressumContent;

  return (
    <>
      <PageHero eyebrow={dict.impressum.eyebrow} title={dict.impressum.title} />
      <section className="py-20">
        <div className="max-w-[720px] mx-auto px-8">
          <p className="whitespace-pre-line text-ink-soft leading-relaxed">{content}</p>
        </div>
      </section>
    </>
  );
}
