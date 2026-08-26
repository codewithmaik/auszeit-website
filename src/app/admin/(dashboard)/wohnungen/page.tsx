import Link from "next/link";
import Image from "next/image";
import { Plus, ImageOff, ArrowUp, ArrowDown } from "lucide-react";
import { getApartments } from "@/db/queries";
import { moveApartment } from "./actions";

export const metadata = { title: "Wohnungen" };
export const dynamic = "force-dynamic";

export default async function AdminWohnungenPage() {
  const units = await getApartments();

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-[1.8rem] m-0">Wohnungen</h1>
        <Link
          href="/admin/wohnungen/neu"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Neue Wohnung
        </Link>
      </div>

      {units.length === 0 ? (
        <p className="text-ink-soft">Noch keine Wohnungen angelegt.</p>
      ) : (
        <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-5">
          {units.map((unit, i) => {
            const cover = unit.images[0];
            const moveUp = moveApartment.bind(null, unit.id, "up");
            const moveDown = moveApartment.bind(null, unit.id, "down");
            return (
              <div
                key={unit.id}
                className="group bg-white border border-line rounded-[2px] overflow-hidden hover:border-gold transition-colors"
              >
                <Link href={`/admin/wohnungen/${unit.id}`}>
                  <div className="relative h-[150px] bg-bg-soft">
                    {cover ? (
                      <Image src={cover.url} alt={unit.name} fill sizes="300px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-ink-soft/50">
                        <ImageOff className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 pb-2">
                    <h2 className="text-[1rem] mb-1 group-hover:text-gold transition-colors">{unit.name}</h2>
                    <p className="text-[0.82rem] text-ink-soft m-0">
                      {unit.sizeSqm} · {unit.guests} · {unit.bedrooms}
                    </p>
                    <p className="text-[0.75rem] text-ink-soft/70 mt-1 m-0">
                      {unit.images.length} {unit.images.length === 1 ? "Foto" : "Fotos"}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center justify-between px-4 pb-3 pt-1">
                  <span className="text-[0.68rem] tracking-[0.08em] uppercase text-ink-soft/60">
                    Position {i + 1} von {units.length}
                  </span>
                  <div className="flex gap-1">
                    <form action={moveUp}>
                      <button
                        type="submit"
                        disabled={i === 0}
                        aria-label="Nach oben"
                        className="p-1 text-ink-soft hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </form>
                    <form action={moveDown}>
                      <button
                        type="submit"
                        disabled={i === units.length - 1}
                        aria-label="Nach unten"
                        className="p-1 text-ink-soft hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
