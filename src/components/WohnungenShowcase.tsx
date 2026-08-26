"use client";

import { useState } from "react";
import WohnungenSlider, { type WohnungUnit } from "@/components/WohnungenSlider";
import GalleryGrid from "@/components/GalleryGrid";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import Reveal from "@/components/Reveal";
import { formatTemplate, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries";

export default function WohnungenShowcase({
  units,
  locale,
  dict,
  galleryDict,
}: {
  units: WohnungUnit[];
  locale: Locale;
  dict: Dictionary["wohnung"];
  galleryDict: Dictionary["gallery"];
}) {
  const [index, setIndex] = useState(0);
  const activeUnit = units[index];
  // images[0] is the Titelbild, already shown as the cover photo in the
  // slider above — the gallery below shows only the remaining photos.
  const photos = activeUnit.images.slice(1).map((img) => ({ src: img.url, alt: img.alt }));

  return (
    <>
      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <WohnungenSlider units={units} locale={locale} dict={dict.slider} index={index} onChange={setIndex} />
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[30px] text-center">
            <Eyebrow>{dict.galleryEyebrow}</Eyebrow>
            <h2 className="mt-0">{formatTemplate(dict.galleryTitle, { name: activeUnit.name })}</h2>
            <Divider center />
            <p>{formatTemplate(dict.galleryText, { name: activeUnit.name })}</p>
          </Reveal>

          <div className="flex justify-center flex-wrap gap-2.5 mb-[38px]">
            {units.map((u, i) => (
              <button
                key={u.slug}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                className={`px-4 py-2 text-[0.76rem] tracking-[0.08em] uppercase rounded-[2px] border transition-colors cursor-pointer ${
                  i === index
                    ? "bg-forest text-white border-forest"
                    : "bg-transparent text-ink-soft border-line hover:border-gold hover:text-forest"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>

          <GalleryGrid key={activeUnit.slug} photos={photos} dict={galleryDict} />
        </div>
      </section>
    </>
  );
}
