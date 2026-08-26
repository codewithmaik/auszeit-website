import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star, Quote } from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { isLocale, localeHref } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/bewertungen">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.bewertungen.metaTitle, alternates: { canonical: localeHref(lang, "/bewertungen") } };
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-gold mb-3.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-gold" strokeWidth={0} />
      ))}
    </div>
  );
}

export default async function BewertungenPage({ params }: PageProps<"/[lang]/bewertungen">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.bewertungen;

  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle}>
        {t.heroText}
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="flex items-center justify-center gap-3 mb-14 text-center">
            <Stars />
            <span className="text-forest font-serif text-[1.1rem]">5,0</span>
            <span className="text-ink-soft text-[0.9rem]">
              · {t.reviews.length} {t.ratingLabel}
            </span>
          </Reveal>

          <div className="grid grid-cols-3 max-[860px]:grid-cols-1 gap-6">
            {t.reviews.map((r, i) => (
              <Reveal
                key={r.name}
                delay={i * 100}
                className="relative bg-white border border-line p-[26px] rounded-[2px]"
              >
                <Quote className="w-6 h-6 text-gold/40 mb-2" strokeWidth={1.5} />
                <Stars />
                <p className="text-[0.92rem]">&bdquo;{r.text}&ldquo;</p>
                <div className="font-serif text-forest text-[0.95rem]">— {r.name}</div>
              </Reveal>
            ))}
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
