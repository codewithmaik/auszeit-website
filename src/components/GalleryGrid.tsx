"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import type { Dictionary } from "@/dictionaries";
import { formatTemplate } from "@/lib/i18n";

type GalleryPhoto = { src: string; alt: string; tall?: boolean };

export default function GalleryGrid({ photos, dict }: { photos: GalleryPhoto[]; dict: Dictionary["gallery"] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const showNext = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, showPrev, showNext]);

  const active = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[18px]">
        {photos.map((p, i) => (
          <Reveal
            key={p.alt}
            delay={(i % 3) * 80}
            className={`relative rounded-[2px] overflow-hidden min-h-[240px] ${
              p.tall ? "row-span-2 max-[560px]:row-span-1" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(i)}
              className="group absolute inset-0 w-full h-full cursor-zoom-in"
              aria-label={formatTemplate(dict.zoom, { alt: p.alt })}
            >
              <Photo
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 380px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Expand
                  className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  strokeWidth={1.5}
                />
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[200] bg-black/92 flex items-center justify-center p-4 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white cursor-pointer"
            aria-label={dict.close}
          >
            <X className="w-7 h-7" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer p-2"
            aria-label={dict.prev}
          >
            <ChevronLeft className="w-8 h-8" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer p-2"
            aria-label={dict.next}
          >
            <ChevronRight className="w-8 h-8" strokeWidth={1.5} />
          </button>

          <div
            className="relative w-full max-w-[1100px] h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Photo src={active.src} alt={active.alt} fill sizes="100vw" className="object-contain" />
          </div>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-[0.85rem] tracking-[0.05em]">
            {active.alt} · {activeIndex! + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
