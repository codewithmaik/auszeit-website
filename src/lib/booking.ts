import type { BookingRequestStatus } from "@/db/schema";

/**
 * Belegungsdaten, wie sie aus dem Belegungs-Popup (manuell wie beim Bestätigen
 * einer Anfrage) an die Server Actions übergeben werden. Gastfelder sind
 * optional — nur `apartmentId` und der Zeitraum sind Pflicht.
 */
export type BookingFormData = {
  apartmentId: number;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  note: string;
};

/** ISO-Datum + n Tage, z. B. addDays("2026-09-20", 1) -> "2026-09-21". */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Alle Tage von `checkIn` (inklusive) bis `checkOut` (exklusive) — die
 * Anreise-Nacht zählt, die Abreise selbst nicht mehr (Standard-Konvention
 * für Übernachtungen).
 */
export function dateRange(checkIn: string, checkOut: string): string[] {
  const days: string[] = [];
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  for (let d = start; d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export const STATUS_LABELS: Record<BookingRequestStatus, string> = {
  neu: "Neu",
  gebucht: "Gebucht",
  abgelehnt: "Abgelehnt",
  archiviert: "Archiviert",
};

export const STATUS_BADGE_CLASS: Record<BookingRequestStatus, string> = {
  neu: "bg-gold/15 text-[#8a6a1a]",
  gebucht: "bg-forest/10 text-forest",
  abgelehnt: "bg-[#a13c2f]/10 text-[#a13c2f]",
  archiviert: "bg-ink-soft/10 text-ink-soft",
};

/** "2026-09-20" -> "20.09.2026" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}
