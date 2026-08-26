"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Ruler, Users, BedDouble } from "lucide-react";
import Photo from "@/components/Photo";
import Button from "@/components/Button";
import { localeHref, formatTemplate, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries";

export type WohnungImage = { url: string; alt: string };

export type WohnungUnit = {
  slug: string;
  name: string;
  images: WohnungImage[];
  size: string;
  guests: string;
  bedrooms: string;
  text: string;
};

export default function WohnungenSlider({
  units,
  locale,
  dict,
}: {
  units: WohnungUnit[];
  locale: Locale;
  dict: Dictionary["wohnung"]["slider"];
}) {
  const [index, setIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const total = units.length;

  // Reset the active photo whenever the slide changes. Adjusting state
  // during render (rather than in an effect) avoids an extra render pass.
  const [lastIndex, setLastIndex] = useState(index);
  if (index !== lastIndex) {
    setLastIndex(index);
    setPhotoIndex(0);
  }

  function goTo(i: number) {
    setIndex(((i % total) + total) % total);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  }

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={dict.ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative overflow-hidden rounded-[2px] border border-line shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)] focus:outline-2 focus:outline-gold focus:outline-offset-2"
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {units.map((u, i) => {
            const active = i === index;
            const photos = u.images.length > 0 ? u.images : [{ url: "/images/wohnbereich.jpg", alt: u.name }];
            const currentPhoto = photos[Math.min(photoIndex, photos.length - 1)];
            return (
              <div
                key={u.slug}
                className="w-full flex-none grid grid-cols-2 max-[860px]:grid-cols-1"
                aria-hidden={!active}
                inert={!active ? true : undefined}
              >
                <div className="relative min-h-[380px] max-[860px]:min-h-[260px]">
                  <Photo
                    src={currentPhoto.url}
                    alt={currentPhoto.alt || u.name}
                    fill
                    sizes="(max-width: 860px) 100vw, 590px"
                    priority={i === 0}
                    className="object-cover"
                  />
                  {active && photos.length > 1 && (
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {photos.map((photo, pi) => (
                        <button
                          key={photo.url + pi}
                          type="button"
                          onClick={() => setPhotoIndex(pi)}
                          aria-label={formatTemplate(dict.photoLabel, { i: pi + 1, total: photos.length })}
                          aria-current={pi === photoIndex}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            pi === photoIndex ? "w-5 bg-white" : "bg-white/60 hover:bg-white/90"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white flex flex-col justify-center p-10 max-[860px]:p-6">
                  <span className="block text-[calc(0.72rem+2px)] tracking-[0.22em] uppercase text-gold mb-2">
                    {formatTemplate(dict.unitLabel, { i: i + 1, total })}
                  </span>
                  <h2 className="mt-0 mb-3">{u.name}</h2>
                  <div className="flex gap-5 mb-4 flex-wrap text-ink-soft text-[0.85rem]">
                    <span className="flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-gold" strokeWidth={1.5} />
                      {u.size}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gold" strokeWidth={1.5} />
                      {u.guests}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-gold" strokeWidth={1.5} />
                      {u.bedrooms}
                    </span>
                  </div>
                  <p>{u.text}</p>
                  <Button href={`${localeHref(locale, "/kontakt")}#buchen`} className="mt-2 self-start">
                    {dict.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label={dict.prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-forest cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label={dict.next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-forest cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex justify-center items-center gap-2.5 mt-6">
        {units.map((u, i) => (
          <button
            key={u.slug}
            type="button"
            onClick={() => goTo(i)}
            aria-label={formatTemplate(dict.goTo, { name: u.name })}
            aria-current={i === index}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              i === index ? "w-6 bg-forest" : "w-2.5 bg-line hover:bg-sage"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
