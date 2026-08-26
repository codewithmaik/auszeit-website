import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BedDouble,
  ChefHat,
  ShowerHead,
  Sunrise,
  Wifi,
  Car,
  WashingMachine,
  Snowflake,
  PawPrint,
} from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import WohnungenSlider from "@/components/WohnungenSlider";
import GalleryGrid from "@/components/GalleryGrid";
import { getApartments } from "@/db/queries";
import { isLocale, localeHref } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";

const GALLERY_SRC: Record<string, string> = {
  wohnzimmer: "/images/wohnbereich.jpg",
  balkon: "/images/hero-mosel.jpg",
  kueche: "/images/kueche.jpg",
  schlaf1: "/images/schlafzimmer-1.jpg",
  schlaf2: "/images/schlafzimmer-2.jpg",
  bad: "/images/badezimmer.jpg",
  aussen: "/images/aussenansicht.jpg",
  weinberge: "/images/weinberge-sonnenuntergang.jpg",
  dorf: "/images/dorfblick.jpg",
};
const GALLERY_TALL = new Set(["wohnzimmer", "bad"]);

const AMENITY_ICONS: Record<string, typeof BedDouble> = {
  betten: BedDouble,
  kueche: ChefHat,
  bad: ShowerHead,
  balkon: Sunrise,
  wlan: Wifi,
  parkplatz: Car,
  waschmaschine: WashingMachine,
  klima: Snowflake,
  haustiere: PawPrint,
};

export async function generateMetadata({ params }: PageProps<"/[lang]/wohnung">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.wohnung.metaTitle, alternates: { canonical: localeHref(lang, "/wohnung") } };
}

export const dynamic = "force-dynamic";

export default async function WohnungPage({ params }: PageProps<"/[lang]/wohnung">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.wohnung;

  const apartments = await getApartments();
  const units = apartments.map((a) => ({
    slug: a.slug,
    name: a.name,
    images: a.images.map((img) => ({ url: img.url, alt: img.alt || a.name })),
    size: a.sizeSqm,
    guests: a.guests,
    bedrooms: a.bedrooms,
    text: a.description,
  }));

  const galleryPhotos = t.galleryPhotos.map((p) => ({
    src: GALLERY_SRC[p.key],
    alt: p.alt,
    tall: GALLERY_TALL.has(p.key),
  }));

  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle}>
        {t.heroText}
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          {units.length > 0 ? (
            <WohnungenSlider units={units} locale={lang} dict={t.slider} />
          ) : (
            <div className="text-center max-w-[480px] mx-auto py-10">
              <Eyebrow>{t.emptyEyebrow}</Eyebrow>
              <h2 className="mt-0">{t.emptyTitle}</h2>
              <Divider center />
              <p>{t.emptyText}</p>
              <Button href={`${localeHref(lang, "/kontakt")}#buchen`}>{t.emptyCta}</Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>{t.galleryEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.galleryTitle}</h2>
            <Divider center />
            <p>{t.galleryText}</p>
          </Reveal>
          <GalleryGrid photos={galleryPhotos} dict={dict.gallery} />
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>{t.amenitiesEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.amenitiesTitle}</h2>
            <Divider center />
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6 mt-2.5">
            {t.amenities.map((a, i) => {
              const Icon = AMENITY_ICONS[a.key];
              return (
                <Reveal key={a.key} delay={(i % 3) * 80} className="border border-line bg-white p-[26px] rounded-[2px]">
                  <Icon className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
                  <h3 className="text-[1rem]">{a.title}</h3>
                  <p className="text-[0.88rem] m-0">{a.text}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-bg-soft text-center">
        <div className="max-w-[1180px] mx-auto px-8">
          <Eyebrow>{t.ctaEyebrow}</Eyebrow>
          <h2 className="mt-0">{t.ctaTitle}</h2>
          <Divider center />
          <Button href={`${localeHref(lang, "/kontakt")}#buchen`}>{t.ctaButton}</Button>
        </div>
      </section>
    </>
  );
}
