import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Startseite" },
  { href: "/wohnung", label: "Die Wohnung" },
  { href: "/region", label: "Die Region" },
  { href: "/galerie", label: "Galerie" },
  { href: "/bewertungen", label: "Gästebewertungen" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
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
          <div>
            <h4 className="text-white font-sans text-[0.78rem] tracking-[0.12em] uppercase mb-3.5">
              Kontakt
            </h4>
            <p className="text-white/68 text-[0.88rem] mb-2">Moselstraße 12, 54470 Bernkastel-Kues</p>
            <p className="text-white/68 text-[0.88rem] mb-2">+49 (0) 6531 123456</p>
            <p className="text-white/68 text-[0.88rem] mb-2">info@auszeit-mosel.de</p>
          </div>
        </div>
        <div className="flex justify-between flex-wrap gap-2.5 pt-5 text-[0.78rem] text-white/50">
          <span>© {new Date().getFullYear()} AUSZEIT Ferienwohnung. Alle Rechte vorbehalten.</span>
          <span>
            <a href="#" className="hover:text-gold">Impressum</a> ·{" "}
            <a href="#" className="hover:text-gold">Datenschutz</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
