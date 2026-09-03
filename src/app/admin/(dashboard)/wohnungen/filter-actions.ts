"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { BUSINESS } from "@/lib/site";
import { isValidPhotoFilter } from "@/lib/photo-filters";

// Entwurf/Veröffentlichen für den globalen Wohnungs-Foto-Filter — leicht-
// gewichtige Variante des Musters aus design/actions.ts (dort ein kompletter
// Snapshot in `designDraft`, hier nur ein einzelner Filter-Key). Siehe
// apartmentPhotoFilter/-Draft in src/db/schema.ts für die Wertebedeutung.

async function ensureSettingsId(): Promise<number> {
  const existing = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (existing.length > 0) return existing[0].id;

  const [created] = await db
    .insert(siteSettings)
    .values({
      contactAddress: `${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}`,
      contactPhone: BUSINESS.telephone,
      contactEmail: BUSINESS.email,
    })
    .returning({ id: siteSettings.id });
  return created.id;
}

function revalidatePhotoFilter() {
  revalidatePath("/admin/wohnungen");
  for (const locale of ["de", "en"]) {
    revalidatePath(`/${locale}/wohnung`);
  }
}

export async function setApartmentPhotoFilterDraft(key: string | null) {
  if (key !== null && !isValidPhotoFilter(key)) throw new Error("Ungültiger Filter.");

  const id = await ensureSettingsId();
  await db
    .update(siteSettings)
    .set({ apartmentPhotoFilterDraft: key ?? "none", updatedAt: new Date() })
    .where(eq(siteSettings.id, id));

  revalidatePhotoFilter();
}

export async function publishApartmentPhotoFilter() {
  const id = await ensureSettingsId();
  const [row] = await db
    .select({
      published: siteSettings.apartmentPhotoFilter,
      draft: siteSettings.apartmentPhotoFilterDraft,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, id))
    .limit(1);
  if (!row || row.draft === null) return;

  const effective = row.draft === "none" ? null : row.draft;
  await db
    .update(siteSettings)
    .set({ apartmentPhotoFilter: effective, apartmentPhotoFilterDraft: null, updatedAt: new Date() })
    .where(eq(siteSettings.id, id));

  revalidatePhotoFilter();
}

export async function discardApartmentPhotoFilterDraft() {
  const id = await ensureSettingsId();
  await db
    .update(siteSettings)
    .set({ apartmentPhotoFilterDraft: null, updatedAt: new Date() })
    .where(eq(siteSettings.id, id));

  revalidatePhotoFilter();
}
