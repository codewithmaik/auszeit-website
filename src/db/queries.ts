import { asc, desc, eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "./client";
import {
  apartments,
  apartmentImages,
  bookingRequests,
  bookingMessages,
  calendarDays,
  invoices,
  type Apartment,
  type ApartmentImage,
  type BookingRequest,
  type BookingMessage,
  type CalendarDay,
  type Invoice,
} from "./schema";
import { resolveInvoiceSettings, invoiceSettingsBaseFromSite, type InvoiceSettings } from "@/lib/invoice";
import type {
  HomeContent,
  HomeTextStyles,
  FooterContent,
  NavLabels,
  ButtonStyles,
  DesignDraft,
  LogoMode,
  IconOverrides,
} from "./home-content";
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
  logoTextScale: null as string | null,
  logoMode: "separate" as LogoMode,
  themePrimary: null as string | null,
  themePrimaryDark: null as string | null,
  themeAccent: null as string | null,
  themeBackground: null as string | null,
  homeHeroImageUrl: null as string | null,
  homeWohlfuehlImageUrl: null as string | null,
  homeHeroAnimation: null as string | null,
  homeWohlfuehlAnimation: null as string | null,
  homeContentDe: null as HomeContent | null,
  homeContentEn: null as HomeContent | null,
  homeTextStyles: null as HomeTextStyles | null,
  footerContentDe: null as FooterContent | null,
  footerContentEn: null as FooterContent | null,
  navLabelsDe: null as NavLabels | null,
  navLabelsEn: null as NavLabels | null,
  buttonBorderWidth: null as string | null,
  buttonColor: null as string | null,
  buttonBorderColor: null as string | null,
  buttonBorderRadius: null as string | null,
  buttonAnimation: null as string | null,
  buttonStyles: null as ButtonStyles | null,
  buttonsLinked: false,
  featureIconOverrides: null as IconOverrides | null,
  stepIconOverrides: null as IconOverrides | null,
  trustIconOverrides: null as IconOverrides | null,
  apartmentPhotoFilter: null as string | null,
  apartmentPhotoFilterDraft: null as string | null,
  invoiceSettings: null as InvoiceSettings | null,
  designDraft: null as DesignDraft | null,
  designDraftHistory: null as DesignDraft[] | null,
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

export async function getBookingRequests(): Promise<BookingRequest[]> {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.query.bookingRequests.findMany({
      orderBy: [desc(bookingRequests.createdAt)],
    });
  } catch (error) {
    console.error("[db] getBookingRequests failed, falling back to an empty list:", error);
    return [];
  }
}

export async function getCalendarDays(): Promise<CalendarDay[]> {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.query.calendarDays.findMany({
      orderBy: [asc(calendarDays.date)],
    });
  } catch (error) {
    console.error("[db] getCalendarDays failed, falling back to an empty list:", error);
    return [];
  }
}

export async function getBookingMessages(requestId: number): Promise<BookingMessage[]> {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.query.bookingMessages.findMany({
      where: (m, { eq }) => eq(m.bookingRequestId, requestId),
      orderBy: [asc(bookingMessages.createdAt)],
    });
  } catch (error) {
    console.error(`[db] getBookingMessages(${requestId}) failed:`, error);
    return [];
  }
}

/** Alle Nachrichten aller Anfragen, gruppiert nach `bookingRequestId`. */
export async function getAllBookingMessages(): Promise<Map<number, BookingMessage[]>> {
  const map = new Map<number, BookingMessage[]>();
  if (!isDatabaseConfigured) return map;
  try {
    const rows = await db.query.bookingMessages.findMany({
      orderBy: [asc(bookingMessages.createdAt)],
    });
    for (const row of rows) {
      const list = map.get(row.bookingRequestId);
      if (list) list.push(row);
      else map.set(row.bookingRequestId, [row]);
    }
  } catch (error) {
    console.error("[db] getAllBookingMessages failed:", error);
  }
  return map;
}

export async function getInvoices(): Promise<Invoice[]> {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.query.invoices.findMany({ orderBy: [desc(invoices.createdAt)] });
  } catch (error) {
    console.error("[db] getInvoices failed, falling back to an empty list:", error);
    return [];
  }
}

export async function getInvoiceByToken(token: string): Promise<Invoice | undefined> {
  if (!isDatabaseConfigured) return undefined;
  try {
    return await db.query.invoices.findFirst({ where: (i) => eq(i.token, token) });
  } catch (error) {
    console.error("[db] getInvoiceByToken failed:", error);
    return undefined;
  }
}

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const settings = await getSiteSettings();
  return resolveInvoiceSettings(settings.invoiceSettings, invoiceSettingsBaseFromSite(settings));
}
