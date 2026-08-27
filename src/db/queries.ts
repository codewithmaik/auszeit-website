import { asc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "./client";
import { apartments, apartmentImages, type Apartment, type ApartmentImage } from "./schema";
import type { HomeContent } from "./home-content";
import { BUSINESS } from "@/lib/site";

export type ApartmentWithImages = Apartment & { images: ApartmentImage[] };

const DEFAULT_SETTINGS = {
  contactAddress: `${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}`,
  contactPhone: BUSINESS.telephone,
  contactEmail: BUSINESS.email,
  impressumContent: "",
  impressumContentEn: "",
  datenschutzContent: "",
  datenschutzContentEn: "",
  logoImageUrl: null as string | null,
  logoTextImageUrl: null as string | null,
  themePrimary: null as string | null,
  themePrimaryDark: null as string | null,
  themeAccent: null as string | null,
  themeBackground: null as string | null,
  homeHeroImageUrl: null as string | null,
  homeWohlfuehlImageUrl: null as string | null,
  homeContentDe: null as HomeContent | null,
  homeContentEn: null as HomeContent | null,
};

export async function getApartments(): Promise<ApartmentWithImages[]> {
  if (!isDatabaseConfigured) return [];
  try {
    const rows = await db.query.apartments.findMany({
      orderBy: [asc(apartments.sortOrder)],
      with: {
        images: { orderBy: [asc(apartmentImages.sortOrder)] },
      },
    });
    return rows as ApartmentWithImages[];
  } catch (error) {
    console.error("[db] getApartments failed, falling back to an empty list:", error);
    return [];
  }
}

export async function getApartment(id: number): Promise<ApartmentWithImages | undefined> {
  if (!isDatabaseConfigured) return undefined;
  try {
    const row = await db.query.apartments.findFirst({
      where: (a, { eq }) => eq(a.id, id),
      with: {
        images: { orderBy: [asc(apartmentImages.sortOrder)] },
      },
    });
    return row as ApartmentWithImages | undefined;
  } catch (error) {
    console.error(`[db] getApartment(${id}) failed:`, error);
    return undefined;
  }
}

export async function getSiteSettings() {
  if (!isDatabaseConfigured) return DEFAULT_SETTINGS;
  try {
    const row = await db.query.siteSettings.findFirst();
    return row ?? DEFAULT_SETTINGS;
  } catch (error) {
    console.error("[db] getSiteSettings failed, falling back to defaults:", error);
    return DEFAULT_SETTINGS;
  }
}
