"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, ImageOff } from "lucide-react";
import { PHOTO_FILTER_OPTIONS } from "@/lib/photo-filters";
import {
  setApartmentPhotoFilterDraft,
  publishApartmentPhotoFilter,
  discardApartmentPhotoFilterDraft,
} from "./filter-actions";

export default function PhotoFilterPanel({
  previewImageUrl,
  publishedKey,
  hasDraft,
  effectiveKey,
}: {
  previewImageUrl: string | null;
  publishedKey: string | null;
  hasDraft: boolean;
  effectiveKey: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  function selectFilter(key: string | null) {
    setPendingAction(key ?? "none");
    startTransition(async () => {
      await setApartmentPhotoFilterDraft(key);
      setPendingAction(null);
    });
  }

  function publish() {
    setPendingAction("publish");
    startTransition(async () => {
      await publishApartmentPhotoFilter();
      setPendingAction(null);
    });
  }

  function discard() {
    setPendingAction("discard");
    startTransition(async () => {
      await discardApartmentPhotoFilterDraft();
      setPendingAction(null);
    });
  }

  const options = [{ key: null, label: "Kein Filter", css: "" }, ...PHOTO_FILTER_OPTIONS];

  return (
    <div className="bg-white border border-line rounded-[2px] p-6 mb-8">
      <h2 className="text-[1.15rem] mb-1">Foto-Filter</h2>
      <p className="text-[0.85rem] text-ink-soft mb-4">
        Gilt global für alle Titelbilder und Galerie-Fotos aller Wohnungen. Die Vorschau unten und auf
        den Titelbildern der Übersicht zeigt den Entwurf sofort — auf der Website wird der Filter erst
        nach „Veröffentlichen&quot; sichtbar.
      </p>

      <div className="grid grid-cols-4 max-[860px]:grid-cols-3 max-[560px]:grid-cols-2 gap-3 mb-2">
        {options.map((opt) => {
          const active = effectiveKey === opt.key;
          const busy = isPending && pendingAction === (opt.key ?? "none");
          return (
            <button
              key={opt.key ?? "none"}
              type="button"
              onClick={() => selectFilter(opt.key)}
              disabled={isPending}
              className={`group relative border rounded-[2px] overflow-hidden text-left transition-colors disabled:cursor-wait ${
                active ? "border-gold ring-1 ring-gold" : "border-line hover:border-forest"
              }`}
            >
              <div className="relative h-[70px] bg-bg-soft">
                {previewImageUrl ? (
                  <Image
                    src={previewImageUrl}
                    alt={opt.label}
                    fill
                    sizes="140px"
                    className="object-cover"
                    data-photo-filter={opt.key ?? undefined}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-ink-soft/40">
                    <ImageOff className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                )}
                {active && (
                  <span className="absolute top-1 right-1 bg-gold text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                )}
                {busy && <span className="absolute inset-0 bg-white/60" />}
              </div>
              <span className="block px-2 py-1.5 text-[0.72rem] text-ink-soft group-hover:text-forest">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {hasDraft && (
        <div className="flex items-center justify-between flex-wrap gap-3 mt-4 pt-4 border-t border-line">
          <p className="text-[0.8rem] text-ink-soft m-0">
            Entwurf geändert — noch nicht veröffentlicht (aktuell live:{" "}
            {publishedKey
              ? PHOTO_FILTER_OPTIONS.find((f) => f.key === publishedKey)?.label ?? publishedKey
              : "Kein Filter"}
            ).
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={discard}
              disabled={isPending}
              className="px-4 py-2 bg-transparent text-ink-soft border border-line font-sans text-[0.76rem] tracking-[0.08em] uppercase rounded-[2px] hover:border-forest hover:text-forest transition-colors cursor-pointer disabled:cursor-wait"
            >
              Entwurf verwerfen
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={isPending}
              className="px-4 py-2 bg-forest text-white font-sans text-[0.76rem] tracking-[0.08em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer disabled:cursor-wait"
            >
              Veröffentlichen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
