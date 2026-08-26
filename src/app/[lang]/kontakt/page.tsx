import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPinned, Phone, Mail, Clock } from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import BookingForm from "@/components/BookingForm";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import MapEmbed from "@/components/MapEmbed";
import { getSiteSettings } from "@/db/queries";
import { isLocale, localeHref } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";

const MAPS_SRC =
  "https://maps.google.com/maps?q=Moselstra%C3%9Fe%2012%2C%2054470%20Bernkastel-Kues&t=&z=13&ie=UTF8&iwloc=&output=embed";

export async function generateMetadata({ params }: PageProps<"/[lang]/kontakt">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.kontakt.metaTitle, alternates: { canonical: localeHref(lang, "/kontakt") } };
}

export const dynamic = "force-dynamic";

export default async function KontaktPage({ params }: PageProps<"/[lang]/kontakt">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.kontakt;

  const settings = await getSiteSettings();
  const CONTACT_INFO = [
    { icon: MapPinned, label: t.labelAdresse, value: settings.contactAddress },
    { icon: Phone, label: t.labelTelefon, value: settings.contactPhone },
    { icon: Mail, label: t.labelEmail, value: settings.contactEmail },
    { icon: Clock, label: t.labelErreichbarkeit, value: t.erreichbarkeitValue },
  ];

  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle}>
        {t.heroText}
      </PageHero>

      <section className="py-20" id="buchen">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-2 max-[860px]:grid-cols-1 gap-[50px]">
          <Reveal>
            <Eyebrow>{t.infoEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.infoTitle}</h2>
            <Divider />
            <dl className="space-y-5 mt-6">
              {CONTACT_INFO.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <c.icon className="w-5 h-5 text-gold flex-none mt-0.5" strokeWidth={1.5} />
                  <div>
                    <dt className="text-[calc(0.72rem+2px)] tracking-[0.1em] uppercase text-gold">{c.label}</dt>
                    <dd className="mt-0.5 ml-0 text-ink-soft">{c.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={100}>
            <BookingForm dict={dict.bookingForm} submitLabel={t.submitLabel} showPhone twoStep />
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>{t.faqEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.faqTitle}</h2>
            <Divider center />
          </Reveal>
          <Reveal delay={100} className="max-w-[760px] mx-auto">
            <Faq items={t.faqItems} />
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>{t.anfahrtEyebrow}</Eyebrow>
            <h2 className="mt-0">{t.anfahrtTitle}</h2>
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
