"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent, OPEN_SETTINGS_EVENT } from "@/lib/consent";
import { localeHref, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries";

export default function CookieConsent({ locale, dict }: { locale: Locale; dict: Dictionary["cookies"] }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mapsChecked, setMapsChecked] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) setVisible(true);
    else setMapsChecked(existing.maps);

    function onOpenSettings() {
      const current = getConsent();
      setMapsChecked(current?.maps ?? false);
      setExpanded(true);
      setVisible(true);
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpenSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpenSettings);
  }, []);

  if (!visible) return null;

  function acceptAll() {
    setConsent(true);
    setVisible(false);
    setExpanded(false);
  }

  function rejectAll() {
    setConsent(false);
    setVisible(false);
    setExpanded(false);
  }

  function saveSelection() {
    setConsent(mapsChecked);
    setVisible(false);
    setExpanded(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={dict.bannerTitle}
      className="fixed inset-x-0 bottom-0 z-[300] p-4 sm:p-6"
    >
      <div className="max-w-[680px] mx-auto bg-white border border-line rounded-[2px] shadow-[0_18px_50px_-16px_rgba(44,50,38,0.45)] p-5 sm:p-6">
        <h2 className="font-serif text-forest text-[1.05rem] mb-2">{dict.bannerTitle}</h2>
        <p className="text-ink-soft text-[0.86rem] mb-4">{dict.bannerText}</p>

        {expanded && (
          <div className="mb-4 space-y-3 border-t border-b border-line py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="block text-[0.85rem] font-sans text-ink">{dict.necessaryTitle}</span>
                <span className="block text-[0.78rem] text-ink-soft mt-0.5">{dict.necessaryText}</span>
              </div>
              <span className="flex-none text-[0.7rem] tracking-[0.08em] uppercase text-ink-soft/70 mt-1">
                {dict.alwaysOn}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="block text-[0.85rem] font-sans text-ink">{dict.mapsTitle}</span>
                <span className="block text-[0.78rem] text-ink-soft mt-0.5">{dict.mapsText}</span>
              </div>
              <input
                type="checkbox"
                checked={mapsChecked}
                onChange={(e) => setMapsChecked(e.target.checked)}
                aria-label={dict.mapsTitle}
                className="flex-none w-4 h-4 accent-forest mt-1 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            type="button"
            onClick={acceptAll}
            className="px-5 py-2.5 bg-forest text-white font-sans text-[0.76rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer"
          >
            {dict.acceptAll}
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="px-5 py-2.5 border border-line text-ink font-sans text-[0.76rem] tracking-[0.1em] uppercase rounded-[2px] hover:border-forest transition-colors cursor-pointer"
          >
            {dict.rejectAll}
          </button>
          {expanded ? (
            <button
              type="button"
              onClick={saveSelection}
              className="px-5 py-2.5 border border-line text-ink font-sans text-[0.76rem] tracking-[0.1em] uppercase rounded-[2px] hover:border-forest transition-colors cursor-pointer"
            >
              {dict.save}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="px-2.5 py-2.5 text-ink-soft font-sans text-[0.76rem] tracking-[0.1em] uppercase hover:text-forest transition-colors cursor-pointer"
            >
              {dict.settings}
            </button>
          )}
          <Link
            href={localeHref(locale, "/datenschutz")}
            className="ml-auto text-[0.78rem] text-ink-soft hover:text-forest underline underline-offset-2"
          >
            {dict.privacyLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
