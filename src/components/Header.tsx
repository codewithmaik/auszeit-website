"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Startseite" },
  { href: "/wohnung", label: "Die Wohnungen" },
  { href: "/region", label: "Die Region" },
  { href: "/galerie", label: "Galerie" },
  { href: "/bewertungen", label: "Gästebewertungen" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-line">
      {/* Separate layer for the blur: backdrop-filter on the <header> itself would
          create a new containing block for position:fixed descendants (the mobile
          nav panel), breaking its viewport-relative positioning. */}
      <div className="absolute inset-0 -z-10 bg-bg/92 backdrop-blur-sm" />
      <div className="max-w-[1180px] mx-auto flex items-center justify-between px-8 py-3.5">
        <Link href="/" className="flex items-center gap-3.5" onClick={() => setOpen(false)}>
          <span className="relative w-[46px] h-[46px] rounded-full overflow-hidden flex-none">
            <Image src="/images/logo.png" alt="AUSZEIT Logo" fill sizes="46px" className="object-cover" />
          </span>
          <span>
            <span className="block font-serif text-[1.25rem] tracking-[0.12em] text-forest leading-none">
              AUSZEIT
            </span>
            <span className="block text-[0.62rem] tracking-[0.16em] uppercase text-gold">
              Ferienwohnung an der Mosel
            </span>
          </span>
        </Link>

        <nav
          id="main-nav"
          className={`flex items-center gap-[30px] max-[900px]:fixed max-[900px]:inset-x-0 max-[900px]:top-[70px] max-[900px]:bottom-0 max-[900px]:bg-bg max-[900px]:flex-col max-[900px]:items-start max-[900px]:p-[30px] max-[900px]:gap-[22px] max-[900px]:transition-transform max-[900px]:duration-300 ${
            open ? "max-[900px]:translate-y-0" : "max-[900px]:translate-y-[-110%]"
          }`}
        >
          {NAV_LINKS.map((link) => {
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

        <div className="flex items-center gap-5">
          <Heart className="w-[19px] h-[19px] text-forest max-[560px]:hidden" strokeWidth={1.5} aria-hidden="true" />
          <Button href="/kontakt#buchen" />
          <button
            className="hidden max-[900px]:flex bg-transparent border-none text-forest cursor-pointer"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
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

function Button({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-[22px] py-[11px] bg-forest text-white font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
    >
      Buchen
    </Link>
  );
}
