import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Landmark,
  Castle,
  Waves,
  Footprints,
  Wine,
  Building2,
  Bike,
  Sailboat,
  Utensils,
  PartyPopper,
} from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import BrandIcon from "@/components/BrandIcon";
import PhotoCard from "@/components/PhotoCard";
import Reveal from "@/components/Reveal";
import MapEmbed from "@/components/MapEmbed";
import { isLocale, localeHref } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";

const SIGHT_ICONS: Record<string, typeof Landmark> = {
  bernkastel: Landmark,
  landshut: Castle,
  bremm: Waves,
  wanderweg: Footprints,
  winzer: Wine,
  trier: Building2,
};
const SIGHT_IMAGES: Record<string, string> = {
  bernkastel: "/images/dorfblick.jpg",
  landshut: "/images/aussenansicht.jpg",
  bremm: "/images/weinberge-sonnenuntergang.jpg",
  wanderweg: "/images/aktivitaet-wandern.jpg",
  winzer: "/images/weinberge-region.jpg",
  trier: "/images/aktivitaet-weinprobe.jpg",
};

const ACTIVITY_ICONS: Record<string, typeof Footprints> = {
  wandern: Footprints,
  radfahren: Bike,
  weinproben: Wine,
  bootstouren: Sailboat,
  kulinarik: Utensils,
  feste: PartyPopper,
};
const ACTIVITY_IMAGES: Record<string, string> = {
  wandern: "/images/aktivitaet-wandern.jpg",
  radfahren: "/images/aktivitaet-radfahren.jpg",
  weinproben: "/images/aktivitaet-weinprobe.jpg",
  bootstouren: "/images/hero-mosel.jpg",
  kulinarik: "/images/aktivitaet-kulinarik.jpg",
  feste: "/images/aktivitaet-feste.jpg",
};

const MAPS_SRC =
  "https://maps.google.com/maps?q=Moselstra%C3%9Fe%2012%2C%2054470%20Bernkastel-Kues&t=&z=13&ie=UTF8&iwloc=&output=embed";

export async function generateMetadata({ params }: PageProps<"/[lang]/region">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.region.metaTitle, alternates: { canonical: localeHref(lang, "/region") } };
}

export default async function RegionPage({ params }: PageProps<"/[lang]/region">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.region;

  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle}>
        {t.heroText}
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-2 max-[860px]:grid-cols-1 gap-[50px] items-center">
          <Reveal className="relative min-h-[340px] rounded-[2px] overflow-hidden">
            <Photo
              src="/images/weinberge-region.jpg"
              alt="Weinberge an der Mosel"
              fill
              sizes="(max-width: 860px) 100vw, 550px"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={100}>
            <BrandIcon name="moselschleife" alt="" size={64} className="mb-4" />
            <Eyebrow>{t.weinEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.weinTitle}</h2>
            <Divider />
            <p>{t.weinText1}</p>
            <p>{t.weinText2}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>{t.activitiesEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.activitiesTitle}</h2>
            <Divider center />
            <p>{t.activitiesText}</p>
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6 mt-2.5">
            {t.activities.map((a, i) => (
              <PhotoCard
                key={a.key}
                delay={(i % 3) * 80}
                image={ACTIVITY_IMAGES[a.key]}
                imageAlt={a.title}
                icon={ACTIVITY_ICONS[a.key]}
                title={a.title}
                meta={a.meta}
                text={a.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>{t.sightsEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.sightsTitle}</h2>
            <Divider center />
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6 mt-2.5">
            {t.sights.map((s, i) => (
              <PhotoCard
                key={s.key}
                delay={(i % 3) * 80}
                image={SIGHT_IMAGES[s.key]}
                imageAlt={s.title}
                icon={SIGHT_ICONS[s.key]}
                brandIcon={s.key === "bernkastel" ? "dorfplatz" : undefined}
                title={s.title}
                text={s.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>{t.lageEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.lageTitle}</h2>
            <Divider center />
          </Reveal>
          <Reveal delay={100} className="min-h-[340px] rounded-[2px] overflow-hidden border border-line">
            <MapEmbed src={MAPS_SRC} title={t.mapTitle} locale={lang} dict={dict.map} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
