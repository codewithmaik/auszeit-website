import Link from "next/link";
import { Home, Palette, RotateCcw, Settings } from "lucide-react";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { resetToFactorySettings } from "./actions";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-[1.8rem] mb-2">Übersicht</h1>
      <p className="text-ink-soft mb-8">Willkommen im Admin-Bereich der AUSZEIT-Website.</p>

      <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
        <Link
          href="/admin/wohnungen"
          className="group bg-white border border-line rounded-[2px] p-6 hover:border-gold transition-colors"
        >
          <Home className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
          <h2 className="text-[1.1rem] mb-1 group-hover:text-gold transition-colors">Wohnungen</h2>
          <p className="text-[0.9rem] text-ink-soft m-0">
            Wohnungen anlegen, bearbeiten, Fotos verwalten oder entfernen.
          </p>
        </Link>

        <Link
          href="/admin/design"
          className="group bg-white border border-line rounded-[2px] p-6 hover:border-gold transition-colors"
        >
          <Palette className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
          <h2 className="text-[1.1rem] mb-1 group-hover:text-gold transition-colors">Design</h2>
          <p className="text-[0.9rem] text-ink-soft m-0">
            Farbpalette, Logo und alle Startseiten-Bilder und -Texte pflegen.
          </p>
        </Link>

        <Link
          href="/admin/einstellungen"
          className="group bg-white border border-line rounded-[2px] p-6 hover:border-gold transition-colors"
        >
          <Settings className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
          <h2 className="text-[1.1rem] mb-1 group-hover:text-gold transition-colors">Einstellungen</h2>
          <p className="text-[0.9rem] text-ink-soft m-0">
            Kontaktdaten, Impressum und Datenschutzerklärung pflegen.
          </p>
        </Link>
      </div>

      <div className="mt-10 border border-[#a13c2f]/30 bg-[#a13c2f]/5 rounded-[2px] p-6">
        <h2 className="text-[1.05rem] mb-2 text-[#a13c2f]">Werkseinstellungen</h2>
        <p className="text-[0.85rem] text-ink-soft mb-4 max-w-[600px]">
          Setzt Design (Farbpalette, Logo, Startseiten-Bilder und -Texte) sowie die Einstellungen-Seite
          (Kontaktdaten, Impressum, Datenschutzerklärung) auf den Stand zurück, wie wir die Website deployed
          haben. Die Wohnungen (Fotos, Beschreibungen) sind davon nicht betroffen. Das kann nicht rückgängig
          gemacht werden.
        </p>
        <form action={resetToFactorySettings}>
          <ConfirmSubmitButton
            confirmMessage="Design und Einstellungen wirklich auf Werkseinstellungen zurücksetzen? Alle eigenen Farben, Logos, Startseiten-Texte, Kontaktdaten sowie Impressum/Datenschutz gehen dabei verloren. Die Wohnungen bleiben unangetastet. Das kann nicht rückgängig gemacht werden."
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a13c2f] text-white font-sans text-[0.76rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-[#8a3227] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            Auf Werkseinstellungen zurücksetzen
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
