import Link from "next/link";
import { Plus } from "lucide-react";
import { getApartments, getSiteSettings } from "@/db/queries";
import { effectivePhotoFilterKey } from "@/lib/photo-filters";
import WohnungenGrid from "./WohnungenGrid";
import PhotoFilterPanel from "./PhotoFilterPanel";

export const metadata = { title: "Wohnungen" };
export const dynamic = "force-dynamic";

export default async function AdminWohnungenPage() {
  const [units, settings] = await Promise.all([getApartments(), getSiteSettings()]);
  const effectiveFilter = effectivePhotoFilterKey(
    settings.apartmentPhotoFilter,
    settings.apartmentPhotoFilterDraft,
  );
  const previewImageUrl = units.find((u) => u.images[0])?.images[0]?.url ?? null;

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
        <WohnungenGrid units={units} photoFilter={effectiveFilter} />
      )}

      <div className="mt-10">
        <PhotoFilterPanel
          previewImageUrl={previewImageUrl}
          publishedKey={settings.apartmentPhotoFilter}
          hasDraft={settings.apartmentPhotoFilterDraft !== null}
          effectiveKey={effectiveFilter}
        />
      </div>
    </div>
  );
}
