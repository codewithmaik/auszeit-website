"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { bookingRequests, calendarDays, type BookingRequestStatus } from "@/db/schema";
import { dateRange, type BookingFormData } from "@/lib/booking";

export async function setRequestStatus(id: number, status: BookingRequestStatus) {
  if (status === "gebucht") throw new Error("Dafür bitte confirmBooking() verwenden.");
  await db
    .update(bookingRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookingRequests.id, id));
  revalidatePath("/admin/posteingang");
}

// --- Belegungen (Kalendertage) -------------------------------------------------

function normalizeGuestFields(data: BookingFormData) {
  return {
    guests: data.guests.trim() || null,
    guestName: data.guestName.trim() || null,
    guestEmail: data.guestEmail.trim() || null,
    guestPhone: data.guestPhone.trim() || null,
    note: data.note.trim() || null,
  };
}

/**
 * Trägt für den Zeitraum `data.checkIn … data.checkOut` (Abreise exklusiv) je
 * einen belegten Tag in den Kalender der gewählten Wohnung ein. Vorhandene
 * Belegungen derselben Wohnung an denselben Tagen werden überschrieben.
 */
async function writeBookingDays(
  data: BookingFormData,
  meta: { bookingGroupId: string; bookingRequestId: number | null },
) {
  const days = dateRange(data.checkIn, data.checkOut);
  if (days.length === 0) throw new Error("Der Zeitraum muss mindestens eine Nacht umfassen.");

  const guest = normalizeGuestFields(data);
  await db
    .insert(calendarDays)
    .values(
      days.map((date) => ({
        apartmentId: data.apartmentId,
        date,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        bookingGroupId: meta.bookingGroupId,
        bookingRequestId: meta.bookingRequestId,
        ...guest,
      })),
    )
    .onConflictDoUpdate({
      target: [calendarDays.apartmentId, calendarDays.date],
      set: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        bookingGroupId: meta.bookingGroupId,
        bookingRequestId: meta.bookingRequestId,
        ...guest,
        updatedAt: new Date(),
      },
    });
}

function assertValid(data: BookingFormData) {
  if (!data.apartmentId) throw new Error("Bitte eine Wohnung wählen.");
  if (!data.checkIn || !data.checkOut) throw new Error("Anreise und Abreise sind erforderlich.");
  if (data.checkOut <= data.checkIn) throw new Error("Die Abreise muss nach der Anreise liegen.");
}

/**
 * Buchungsanfrage bestätigen: Daten ggf. angepasst übernehmen, Wohnung zuordnen,
 * Kalendertage der Wohnung belegen und die Anfrage auf „gebucht" setzen.
 */
export async function confirmBooking(id: number, data: BookingFormData) {
  assertValid(data);

  const request = await db.query.bookingRequests.findFirst({
    where: (r, { eq }) => eq(r.id, id),
  });
  if (!request || request.status === "gebucht") return;

  await writeBookingDays(data, {
    bookingGroupId: crypto.randomUUID(),
    bookingRequestId: id,
  });

  await db
    .update(bookingRequests)
    .set({
      status: "gebucht",
      apartmentId: data.apartmentId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests.trim(),
      name: data.guestName.trim() || request.name,
      email: data.guestEmail.trim() || request.email,
      phone: data.guestPhone.trim(),
      message: data.note.trim(),
      updatedAt: new Date(),
    })
    .where(eq(bookingRequests.id, id));

  revalidatePath("/admin/posteingang");
}

/** Manuelle Belegung ohne zugrundeliegende Anfrage. */
export async function createManualBooking(data: BookingFormData) {
  assertValid(data);
  await writeBookingDays(data, {
    bookingGroupId: crypto.randomUUID(),
    bookingRequestId: null,
  });
  revalidatePath("/admin/posteingang");
}

/**
 * Bestehende Belegung bearbeiten. Deckt geänderten Zeitraum UND geänderte
 * Wohnung ab: alle bisherigen Tage der Gruppe werden entfernt und für die neuen
 * Werte neu geschrieben. Ein evtl. `bookingRequestId`-Link bleibt erhalten.
 */
export async function updateBooking(bookingGroupId: string, data: BookingFormData) {
  assertValid(data);

  const existing = await db.query.calendarDays.findFirst({
    where: (d, { eq }) => eq(d.bookingGroupId, bookingGroupId),
  });
  if (!existing) return;

  await db.delete(calendarDays).where(eq(calendarDays.bookingGroupId, bookingGroupId));
  await writeBookingDays(data, {
    bookingGroupId,
    bookingRequestId: existing.bookingRequestId,
  });

  revalidatePath("/admin/posteingang");
}

/**
 * Belegung freigeben: alle Tage der Gruppe löschen. Stammt sie aus einer
 * Buchungsanfrage, wird diese wieder auf „neu" gesetzt.
 */
export async function releaseBooking(bookingGroupId: string) {
  const existing = await db.query.calendarDays.findFirst({
    where: (d, { eq }) => eq(d.bookingGroupId, bookingGroupId),
  });
  if (!existing) return;

  await db.delete(calendarDays).where(eq(calendarDays.bookingGroupId, bookingGroupId));

  if (existing.bookingRequestId) {
    await db
      .update(bookingRequests)
      .set({ status: "neu", apartmentId: null, updatedAt: new Date() })
      .where(eq(bookingRequests.id, existing.bookingRequestId));
  }

  revalidatePath("/admin/posteingang");
}
