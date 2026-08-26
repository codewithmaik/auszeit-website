import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createApartment } from "../actions";
import ApartmentFormFields from "../ApartmentFormFields";

export const metadata = { title: "Neue Wohnung" };

export default function NewApartmentPage() {
  return (
    <div className="max-w-[640px]">
      <Link href="/admin/wohnungen" className="inline-flex items-center gap-1.5 text-ink-soft text-[0.8rem] mb-6 hover:text-forest transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Zurück zur Übersicht
      </Link>
      <h1 className="text-[1.8rem] mb-6">Neue Wohnung</h1>

      <form action={createApartment} className="bg-white border border-line rounded-[2px] p-6">
        <ApartmentFormFields />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
        >
          Wohnung anlegen
        </button>
        <p className="text-[0.8rem] text-ink-soft mt-3">
          Fotos können Sie im nächsten Schritt hochladen.
        </p>
      </form>
    </div>
  );
}
