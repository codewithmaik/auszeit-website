import { notFound } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import BookingForm from "@/components/BookingForm";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import Image from "next/image";
import { ICONS as BRAND_ICON_SRC } from "@/components/BrandIcon";
import { isLocale, localeHref } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";
import { getSiteSettings } from "@/db/queries";
import { FEATURE_ICONS, FEATURE_ICON_FRAME, TRUST_ICONS, STEP_ICONS } from "@/lib/home-icons";
import type { HomeTextStyles } from "@/db/home-content";
import { fontFamilyFor } from "@/lib/fonts";

// Wendet einen im Adminpanel gesetzten Textstil-Override (falls vorhanden)
// auf ein Startseiten-Textfeld an — Feldpfade siehe
// src/components/admin/home-editor/fields.ts.
function styleFor(styles: HomeTextStyles | null | undefined, id: string): React.CSSProperties {
  const override = styles?.[id];
  if (!override) return {};
  const family = fontFamilyFor(override.fontFamily);
  return {
    ...(override.fontSize && { fontSize: override.fontSize }),
    ...(override.color && { color: override.color }),
    ...(override.bold && { fontWeight: 700 }),
    ...(override.italic && { fontStyle: "italic" }),
    ...(override.underline && { textDecoration: "underline" }),
    ...(family && { fontFamily: family }),
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = await getSiteSettings();
  const homeOverride = lang === "de" ? settings.homeContentDe : settings.homeContentEn;
  const t = homeOverride ?? dict.home;
  const heroImageSrc = settings.homeHeroImageUrl || "/images/hero-mosel.jpg";
  const wohlfuehlImageSrc = settings.homeWohlfuehlImageUrl || "/images/wohnzimmer-balkon.jpg";
  const styles = settings.homeTextStyles;

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[64vh] flex items-end overflow-hidden">
        <Photo
          src={heroImageSrc}
          alt="Moselblick vom Balkon bei Sonnenuntergang"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-[1.18] origin-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
        <div className="relative z-10 max-w-[1180px] mx-auto w-full px-8 py-[70px]">
          <h1 className="text-white text-[clamp(2.4rem,4.4vw,3.8rem)] leading-[1.05] mb-7">
            <span style={styleFor(styles, "hero.title1")}>{t.hero.title1}</span>
            <br />
            <span style={styleFor(styles, "hero.title2")}>{t.hero.title2}</span>
          </h1>
          <p className="text-white/90 text-[1.1rem] max-w-[460px]" style={styleFor(styles, "hero.lead1")}>
            {t.hero.lead1}
          </p>
          <p className="text-white/80 max-w-[460px]" style={styleFor(styles, "hero.lead2")}>
            {t.hero.lead2}
          </p>
          <div className="flex gap-3.5 mt-6 flex-wrap">
            <Button href={localeHref(lang, "/wohnung")} styleOverride={settings.buttonStyles?.["hero.ctaWohnungen"]}>
              {t.hero.ctaWohnungen}
            </Button>
            <Button
              href={`${localeHref(lang, "/kontakt")}#buchen`}
              variant="outline-light"
              styleOverride={settings.buttonStyles?.["hero.ctaBuchen"]}
            >
              {t.hero.ctaBuchen}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-[60px] border-b border-line">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[30px]">
          {t.features.map((f, i) => (
            <Reveal key={f.key} delay={i * 80} className="flex gap-3.5 items-start">
              <span className="relative block w-12 h-12 rounded-full overflow-hidden border-2 border-khaki flex-none">
                <Image
                  src={BRAND_ICON_SRC[FEATURE_ICONS[f.key]]}
                  alt=""
                  width={FEATURE_ICON_FRAME[f.key].size}
                  height={FEATURE_ICON_FRAME[f.key].size}
                  className="absolute max-w-none"
                  style={{ left: FEATURE_ICON_FRAME[f.key].left, top: FEATURE_ICON_FRAME[f.key].top }}
                />
              </span>
              <div>
                <h3
                  className="text-[0.95rem] font-sans uppercase tracking-[0.06em] text-forest mb-1"
                  style={styleFor(styles, `features.${i}.title`)}
                >
                  {f.title}
                </h3>
                <p className="text-[0.88rem] m-0" style={styleFor(styles, `features.${i}.text`)}>
                  {f.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20 max-[860px]:order-last">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow style={styleFor(styles, "stepsEyebrow")}>{t.stepsEyebrow}</Eyebrow>
            <h2 className="mt-0" style={styleFor(styles, "stepsTitle")}>
              {t.stepsTitle}
            </h2>
            <hr className="w-[46px] h-px bg-gold border-none my-[18px] mx-auto" />
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-1 gap-8">
            {t.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <Reveal key={s.title} delay={i * 100} className="text-center px-4">
                  <span className="inline-flex w-14 h-14 rounded-full bg-bg-soft border border-line items-center justify-center text-forest mb-4">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </span>
                  <h3 className="text-[1.05rem]" style={styleFor(styles, `steps.${i}.title`)}>
                    {s.title}
                  </h3>
                  <p className="text-[0.92rem]" style={styleFor(styles, `steps.${i}.text`)}>
                    {s.text}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-bg-soft" id="buchen">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-3 max-[980px]:grid-cols-1 gap-10 items-center">
          <Reveal>
            <Eyebrow style={styleFor(styles, "bookEyebrow")}>{t.bookEyebrow}</Eyebrow>
            <h2 className="mt-0" style={styleFor(styles, "bookTitle")}>
              {t.bookTitle}
            </h2>
            <hr className="w-[46px] h-px bg-gold border-none my-[18px]" />
            <p style={styleFor(styles, "bookText")}>{t.bookText}</p>
            <ul
              className="list-none m-0 mt-5 p-0 text-[0.92rem] text-ink-soft"
              style={styleFor(styles, "bookBullets")}
            >
              {t.bookBullets.map((item) => (
                <li key={item} className="flex items-center gap-2.5 py-1.5">
                  <Check className="w-4 h-4 text-gold flex-none" strokeWidth={2} /> {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <BookingForm dict={dict.bookingForm} twoStep />
          </Reveal>

          <Reveal delay={200} className="rounded-[2px] overflow-hidden shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)]">
            <div className="relative aspect-4/3">
              <Photo
                src={wohlfuehlImageSrc}
                alt="Wohnzimmer mit Balkon"
                fill
                sizes="(max-width: 980px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <div className="bg-white p-5">
              <h3 className="text-forest" style={styleFor(styles, "wohlfuehl.title")}>
                {t.wohlfuehl.title}
              </h3>
              <p className="text-[0.9rem] m-0" style={styleFor(styles, "wohlfuehl.text")}>
                {t.wohlfuehl.text}
              </p>
              <p className="mt-2.5">
                <a
                  href={localeHref(lang, "/wohnung")}
                  className="inline-flex items-center gap-1.5 text-gold text-[calc(0.85rem+2px)] tracking-[0.05em] uppercase"
                  style={styleFor(styles, "wohlfuehl.more")}
                >
                  {t.wohlfuehl.more} <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-[46px] bg-forest">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[30px]">
          {t.trust.map((item, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <Reveal key={item.title} delay={i * 80} className="flex gap-3 items-start text-white">
                <Icon className="w-5 h-5 text-gold flex-none" strokeWidth={1.5} />
                <div>
                  <h3
                    className="text-white font-sans text-[0.82rem] tracking-[0.08em] uppercase mb-1"
                    style={styleFor(styles, `trust.${i}.title`)}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/72 text-[0.85rem] m-0" style={styleFor(styles, `trust.${i}.text`)}>
                    {item.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
