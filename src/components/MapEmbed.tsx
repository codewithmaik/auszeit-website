"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { getConsent, setConsent, CONSENT_EVENT } from "@/lib/consent";
import { localeHref, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries";

export default function MapEmbed({
  src,
  title,
  locale,
  dict,
}: {
  src: string;
  title: string;
  locale: Locale;
  dict: Dictionary["map"];
}) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(getConsent()?.maps ?? false);
    function onChange(e: Event) {
      setAllowed((e as CustomEvent).detail?.maps ?? false);
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (allowed) {
    return (
      <iframe
        title={title}
        src={src}
        className="w-full h-[340px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="w-full h-[340px] bg-bg-soft flex flex-col items-center justify-center text-center px-6">
      <MapPin className="w-7 h-7 text-gold mb-3" strokeWidth={1.5} />
      <h3 className="text-[1rem] mb-1.5">{dict.placeholderTitle}</h3>
      <p className="text-[0.85rem] text-ink-soft max-w-[420px] mb-4">{dict.placeholderText}</p>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => setConsent(true)}
          className="px-5 py-2.5 bg-forest text-white font-sans text-[0.76rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer"
        >
          {dict.loadButton}
        </button>
        <Link
          href={localeHref(locale, "/datenschutz")}
          className="text-[0.78rem] text-ink-soft hover:text-forest underline underline-offset-2"
        >
          {dict.privacyLinkText}
        </Link>
      </div>
    </div>
  );
}
