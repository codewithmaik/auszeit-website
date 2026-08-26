import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/db/queries";

const NAV_LINKS = [
  { href: "/", label: "Startseite" },
  { href: "/wohnung", label: "Die Wohnungen" },
  { href: "/region", label: "Die Region" },
  { href: "/bewertungen", label: "Gästebewertungen" },
  { href: "/kontakt", label: "Kontakt" },
];

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-forest text-white/75 pt-[60px] pb-[26px]">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] max-[860px]:grid-cols-1 gap-10 pb-[34px] border-b border-white/14">
          <div>
            <span className="font-serif text-white text-[1.3rem] tracking-[0.1em]">AUSZEIT</span>
            <p className="text-white/65 text-[0.88rem] mt-2.5 max-w-[320px]">
              Ihre Ferienwohnung an der Mosel — Ankommen. Durchatmen. Genießen.
            </p>
          </div>
          <div>
            <h4 className="text-white font-sans text-[0.78rem] tracking-[0.12em] uppercase mb-3.5">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-x-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white/68 text-[0.88rem] mb-2 hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-sans text-[0.78rem] tracking-[0.12em] uppercase mb-3.5">
              Kontakt
            </h4>
            <p className="text-white/68 text-[0.88rem] mb-2">{settings.contactAddress}</p>
            <p className="text-white/68 text-[0.88rem] mb-2">{settings.contactPhone}</p>
            <p className="text-white/68 text-[0.88rem] mb-2">{settings.contactEmail}</p>
          </div>
        </div>
        <div className="flex justify-between flex-wrap gap-2.5 pt-5 text-[0.78rem] text-white/50">
          <span>© {new Date().getFullYear()} AUSZEIT Ferienwohnung. Alle Rechte vorbehalten.</span>
          <span>
            <Link href="/impressum" className="hover:text-gold">Impressum</Link> ·{" "}
            <Link href="/datenschutz" className="hover:text-gold">Datenschutz</Link>
          </span>
        </div>
        <div className="pt-5 mt-2 border-t border-white/10 text-center">
          <a
            href="https://codewithmaik.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 text-[0.72rem] tracking-[0.03em] text-white/40 hover:text-white/90 transition-colors duration-300"
          >
            <span>
              Technische Umsetzung:{" "}
              <span className="relative text-white/55 group-hover:text-gold transition-colors duration-300">
                codewithmaik
                <span className="absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </span>
            </span>
            <ArrowUpRight
              className="w-3 h-3 text-gold opacity-0 -translate-x-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0"
              strokeWidth={2}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
