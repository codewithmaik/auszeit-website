"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { localeHref, swapLocale, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries";
import type { ButtonStyleOverride, NavLabels, LogoMode } from "@/db/home-content";
import Button from "@/components/Button";

export default function Header({
  locale,
  dict,
  logoImageUrl,
  logoTextImageUrl,
  logoTextScale,
  logoMode,
  navCtaStyle,
  navLabels,
}: {
  locale: Locale;
  dict: Dictionary;
  logoImageUrl?: string | null;
  logoTextImageUrl?: string | null;
  logoTextScale?: string | null;
  logoMode?: LogoMode;
  navCtaStyle?: ButtonStyleOverride | null;
  navLabels?: NavLabels | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  const navLinks = [
    { href: localeHref(locale, "/"), label: navLabels?.home ?? dict.nav.home },
    { href: localeHref(locale, "/wohnung"), label: navLabels?.wohnung ?? dict.nav.wohnung },
    { href: localeHref(locale, "/region"), label: navLabels?.region ?? dict.nav.region },
    { href: localeHref(locale, "/bewertungen"), label: navLabels?.bewertungen ?? dict.nav.bewertungen },
    { href: localeHref(locale, "/kontakt"), label: navLabels?.kontakt ?? dict.nav.kontakt },
  ];

  function switchLanguage() {
    // Header lives in the root layout, above the [lang] route segment, so its
    // locale/dict props don't refresh on a client-side (soft) navigation —
    // that's what caused the switch to get stuck after the first use. A full
    // navigation forces the whole tree, including the root layout, to
    // re-render with the new locale.
    const target: Locale = locale === "de" ? "en" : "de";
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
    window.location.href = swapLocale(pathname, target);
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-line">
      {/* Separate layer for the blur: backdrop-filter on the <header> itself would
          create a new containing block for position:fixed descendants (the mobile
          nav panel), breaking its viewport-relative positioning. */}
      <div className="absolute inset-0 -z-10 bg-bg/92 backdrop-blur-sm" />
      <div className="max-w-[1180px] mx-auto flex items-center justify-between px-8 max-[560px]:px-3 py-3.5 max-[560px]:py-2.5">
        <Link
          href={localeHref(locale, "/")}
          className="flex items-center gap-3.5 max-[560px]:gap-2 min-w-0"
          onClick={() => setOpen(false)}
        >
          {logoMode === "combined" ? (
            <span className="relative block w-[230px] max-[560px]:w-[140px] h-[46px] max-[560px]:h-8 flex-none">
              <Image
                src={logoImageUrl || "/images/logo.png"}
                alt="AUSZEIT"
                fill
                sizes="230px"
                className="object-contain object-left"
              />
            </span>
          ) : (
            <>
              <span className="relative w-[46px] h-[46px] max-[560px]:w-8 max-[560px]:h-8 rounded-full overflow-hidden flex-none">
                <Image src={logoImageUrl || "/images/logo.png"} alt="AUSZEIT Logo" fill sizes="46px" className="object-cover" />
              </span>
              {logoTextImageUrl ? (
                <span
                  className="relative block w-[170px] max-[560px]:w-[104px] h-[34px] max-[560px]:h-[22px] flex-none"
                  style={{ transform: `scale(${logoTextScale ? parseFloat(logoTextScale) : 1})`, transformOrigin: "left center" }}
                >
                  <Image
                    src={logoTextImageUrl}
                    alt="AUSZEIT"
                    fill
                    sizes="180px"
                    className="object-contain object-left"
                  />
                </span>
              ) : (
                <span
                  className="min-w-0"
                  style={{ transform: `scale(${logoTextScale ? parseFloat(logoTextScale) : 1})`, transformOrigin: "left center" }}
                >
                  <span className="block font-serif text-[1.25rem] max-[560px]:text-[0.85rem] tracking-[0.12em] max-[560px]:tracking-[0.06em] text-forest leading-none whitespace-nowrap">
                    AUSZEIT
                  </span>
                  <span className="block text-[0.56rem] max-[560px]:text-[0.4rem] leading-[1.15] tracking-[0.14em] max-[560px]:tracking-[0.04em] uppercase text-gold whitespace-nowrap">
                    Ferienwohnung
                    <br />
                    an der Mosel
                  </span>
                </span>
              )}
            </>
          )}
        </Link>

        <nav
          id="main-nav"
          className={`flex items-center gap-[30px] max-[900px]:fixed max-[900px]:inset-x-0 max-[900px]:top-[70px] max-[900px]:bottom-0 max-[900px]:bg-bg max-[900px]:flex-col max-[900px]:items-start max-[900px]:p-[30px] max-[900px]:gap-[22px] max-[900px]:transition-transform max-[900px]:duration-300 ${
            open ? "max-[900px]:translate-y-0" : "max-[900px]:translate-y-[-110%]"
          }`}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-[0.76rem] tracking-[0.1em] uppercase pb-1 border-b transition-colors ${
                  active ? "border-gold text-forest" : "border-transparent text-ink hover:border-gold hover:text-forest"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5 max-[560px]:gap-2 flex-none">
          {!isAdmin && (
            <button
              type="button"
              onClick={switchLanguage}
              aria-label={dict.nav.switchLabel}
              className="ml-[3px] text-[0.76rem] max-[560px]:text-[0.66rem] tracking-[0.1em] uppercase text-ink-soft hover:text-forest transition-colors cursor-pointer border border-line rounded-[2px] px-2.5 max-[560px]:px-1.5 py-1"
            >
              {dict.nav.switchTo}
            </button>
          )}
          <Heart className="w-[19px] h-[19px] text-forest max-[560px]:hidden" strokeWidth={1.5} aria-hidden="true" />
          <Button
            href={`${localeHref(locale, "/kontakt")}#buchen`}
            styleOverride={navCtaStyle}
            className="max-[560px]:px-3 max-[560px]:py-2 max-[560px]:text-[0.66rem] max-[560px]:tracking-[0.06em] whitespace-nowrap"
          >
            {dict.nav.anfragen}
          </Button>
          <button
            className="hidden max-[900px]:flex bg-transparent border-none text-forest cursor-pointer flex-none"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </header>
  );
}
