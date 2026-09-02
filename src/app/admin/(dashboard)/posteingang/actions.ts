"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { bookingRequests, calendarDays, type BookingRequestStatus } from "@/db/schema";
import { dateRange } from "@/lib/booking";

export async function setRequestStatus(id: number, status: BookingRequestStatus) {
  if (status === "gebucht") throw new Error("Dafür bitte confirmBooking() verwenden.");
  await db
    .update(bookingRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookingRequests.id, id));
  revalidatePath("/admin/posteingang");
}

export async function confirmBooking(id: number) {
  const request = await db.query.bookingRequests.findFirst({
    where: (r, { eq }) => eq(r.id, id),
  });
  if (!request || request.status === "gebucht") return;

  const days = dateRange(request.checkIn, request.checkOut);
  if (days.length > 0) {
    await db
      .insert(calendarDays)
      .values(
        days.map((date) => ({
          date,
          guestName: request.name,
          guestEmail: request.email,
          guestPhone: request.phone,
          guests: request.guests,
          note: request.message,
          bookingRequestId: request.id,
        })),
      )
      .onConflictDoUpdate({
        target: calendarDays.date,
        set: {
          guestName: request.name,
          guestEmail: request.email,
          guestPhone: request.phone,
          guests: request.guests,
          note: request.message,
          bookingRequestId: request.id,
          updatedAt: new Date(),
        },
      });
  }

  await db
    .update(bookingRequests)
    .set({ status: "gebucht", updatedAt: new Date() })
    .where(eq(bookingRequests.id, id));

  revalidatePath("/admin/posteingang");
}

export async function toggleCalendarDay(date: string) {
  const existing = await db.query.calendarDays.findFirst({
    where: (d, { eq }) => eq(d.date, date),
  });
  if (existing) {
    await db.delete(calendarDays).where(eq(calendarDays.id, existing.id));
  } else {
    await db.insert(calendarDays).values({ date });
  }
  revalidatePath("/admin/posteingang");
}

export async function saveCalendarDay(
  date: string,
  fields: { guestName: string; note: string },
) {
  const existing = await db.query.calendarDays.findFirst({
    where: (d, { eq }) => eq(d.date, date),
  });
  const values = {
    guestName: fields.guestName.trim() || null,
    note: fields.note.trim() || null,
    updatedAt: new Date(),
  };
  if (existing) {
    await db.update(calendarDays).set(values).where(eq(calendarDays.id, existing.id));
  } else {
    await db.insert(calendarDays).values({ date, ...values });
  }
  revalidatePath("/admin/posteingang");
}
