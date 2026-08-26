import { asc } from "drizzle-orm";
import { db } from "./client";
import { apartments, apartmentImages, type Apartment, type ApartmentImage } from "./schema";
import { BUSINESS } from "@/lib/site";

export type ApartmentWithImages = Apartment & { images: ApartmentImage[] };

export async function getApartments(): Promise<ApartmentWithImages[]> {
  const rows = await db.query.apartments.findMany({
    orderBy: [asc(apartments.sortOrder)],
    with: {
      images: { orderBy: [asc(apartmentImages.sortOrder)] },
    },
  });
  return rows as ApartmentWithImages[];
}

export async function getApartment(id: number): Promise<ApartmentWithImages | undefined> {
  const row = await db.query.apartments.findFirst({
    where: (a, { eq }) => eq(a.id, id),
    with: {
      images: { orderBy: [asc(apartmentImages.sortOrder)] },
    },
  });
  return row as ApartmentWithImages | undefined;
}

const DEFAULT_SETTINGS = {
  contactAddress: `${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}`,
  contactPhone: BUSINESS.telephone,
  contactEmail: BUSINESS.email,
  impressumContent: "",
  datenschutzContent: "",
};

export async function getSiteSettings() {
  const row = await db.query.siteSettings.findFirst();
  if (!row) return DEFAULT_SETTINGS;
  return row;
}
