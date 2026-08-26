import Link from "next/link";
import { Home, Settings } from "lucide-react";

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
    </div>
  );
}
