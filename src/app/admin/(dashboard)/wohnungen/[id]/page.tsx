import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUp, ArrowDown, Trash2, Upload } from "lucide-react";
import { getApartment, getSiteSettings } from "@/db/queries";
import { effectivePhotoFilterKey } from "@/lib/photo-filters";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import {
  updateApartment,
  deleteApartment,
  uploadApartmentImage,
  deleteApartmentImage,
  moveApartmentImage,
} from "../actions";
import ApartmentFormFields from "../ApartmentFormFields";

export const metadata = { title: "Wohnung bearbeiten" };
export const dynamic = "force-dynamic";

export default async function EditApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const [apartment, settings] = await Promise.all([getApartment(id), getSiteSettings()]);
  if (!apartment) notFound();
  const photoFilter = effectivePhotoFilterKey(
    settings.apartmentPhotoFilter,
    settings.apartmentPhotoFilterDraft,
  );

  const updateWithId = updateApartment.bind(null, id);
  const deleteThisApartment = deleteApartment.bind(null, id);
  const uploadWithId = uploadApartmentImage.bind(null, id);

  return (
    <div className="max-w-[720px]">
      <Link href="/admin/wohnungen" className="inline-flex items-center gap-1.5 text-ink-soft text-[0.8rem] mb-6 hover:text-forest transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Zurück zur Übersicht
      </Link>
      <h1 className="text-[1.8rem] mb-6">{apartment.name} bearbeiten</h1>

      <form action={updateWithId} className="bg-white border border-line rounded-[2px] p-6 mb-8">
        <ApartmentFormFields apartment={apartment} />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
          >
            Änderungen speichern
          </button>
          <button
            type="reset"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-ink-soft border border-line font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:border-forest hover:text-forest transition-colors cursor-pointer"
          >
            Zurücksetzen
          </button>
        </div>
      </form>

      <div className="bg-white border border-line rounded-[2px] p-6 mb-8">
        <h2 className="text-[1.15rem] mb-4">Fotos</h2>

        {apartment.images.length === 0 ? (
          <p className="text-[0.88rem] text-ink-soft mb-4">Noch keine Fotos hochgeladen.</p>
        ) : (
          <div className="grid grid-cols-3 max-[560px]:grid-cols-2 gap-4 mb-6">
            {apartment.images.map((image, i) => {
              const moveUp = moveApartmentImage.bind(null, image.id, id, "up");
              const moveDown = moveApartmentImage.bind(null, image.id, id, "down");
              const deleteThisImage = deleteApartmentImage.bind(null, image.id, id);
              return (
                <div key={image.id} className="border border-line rounded-[2px] overflow-hidden">
                  <div className="relative h-[110px] bg-bg-soft">
                    <Image
                      src={image.url}
                      alt={image.alt || apartment.name}
                      fill
                      sizes="200px"
                      className="object-cover"
                      data-photo-filter={photoFilter ?? undefined}
                    />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-forest text-white text-[0.62rem] tracking-[0.05em] uppercase px-2 py-0.5 rounded-[2px]">
                        Titelbild
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5">
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
                          disabled={i === apartment.images.length - 1}
                          aria-label="Nach unten"
                          className="p-1 text-ink-soft hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </form>
                    </div>
                    <form action={deleteThisImage}>
                      <ConfirmSubmitButton
                        confirmMessage="Dieses Foto löschen?"
                        className="p-1 text-ink-soft hover:text-[#a13c2f] cursor-pointer"
                      >
                        <span aria-label="Löschen">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        </span>
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <form action={uploadWithId} className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="text-[0.85rem] file:mr-3 file:px-4 file:py-2 file:border-0 file:rounded-[2px] file:bg-bg-soft file:text-ink file:text-[0.78rem] file:uppercase file:tracking-[0.05em] file:cursor-pointer"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white font-sans text-[0.76rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={2} />
            Hochladen
          </button>
        </form>
      </div>

      <div className="border border-[#a13c2f]/30 bg-[#a13c2f]/5 rounded-[2px] p-6">
        <h2 className="text-[1.05rem] mb-2 text-[#a13c2f]">Wohnung löschen</h2>
        <p className="text-[0.85rem] text-ink-soft mb-4">
          Diese Wohnung wird inklusive aller Fotos dauerhaft entfernt. Das kann nicht rückgängig gemacht werden.
        </p>
        <form action={deleteThisApartment}>
          <ConfirmSubmitButton
            confirmMessage={`„${apartment.name}" inklusive aller Fotos endgültig löschen? Das kann nicht rückgängig gemacht werden.`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a13c2f] text-white font-sans text-[0.76rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-[#8a3227] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            Endgültig löschen
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
