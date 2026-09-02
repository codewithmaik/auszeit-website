import type { BookingRequestStatus } from "@/db/schema";

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
