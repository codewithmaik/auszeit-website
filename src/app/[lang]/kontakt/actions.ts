"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { bookingRequests, bookingMessages } from "@/db/schema";
import { getSiteSettings } from "@/db/queries";
import { sendAdminNotification } from "@/lib/email";

export type BookingRequestPayload = {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
  locale: "de" | "en";
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Nimmt eine Anfrage aus dem öffentlichen Kontaktformular entgegen:
 * schreibt sie in `booking_requests` (Status „neu"), legt die Formular-Nachricht
 * als erste Zeile des Chatverlaufs an und benachrichtigt den Betreiber per
 * E-Mail. E-Mail-Fehler lassen die Anfrage nie scheitern.
 */
export async function submitBookingRequest(payload: BookingRequestPayload): Promise<SubmitResult> {
  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk) {
    return { ok: false, error: "Bitte Name und eine gültige E-Mail-Adresse angeben." };
  }

  const checkIn = ISO_DATE.test(payload.checkIn ?? "") ? payload.checkIn : "";
  const checkOut = ISO_DATE.test(payload.checkOut ?? "") ? payload.checkOut : "";
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return { ok: false, error: "Bitte gültige An- und Abreisedaten wählen." };
  }

  const phone = payload.phone?.trim() ?? "";
  const guests = payload.guests?.trim() ?? "";
  const message = payload.message?.trim() ?? "";
  const locale: "de" | "en" = payload.locale === "en" ? "en" : "de";

  const rawPayload: Record<string, string> = {
    name,
    email,
    phone,
    checkIn,
    checkOut,
    guests,
    message,
    locale,
    submittedAt: new Date().toISOString(),
  };

  try {
    const [request] = await db
      .insert(bookingRequests)
      .values({
        name,
        email,
        phone,
        checkIn,
        checkOut,
        guests,
        message,
        locale,
        rawPayload,
        status: "neu",
      })
      .returning();

    const summary = [
      `Anreise: ${checkIn}`,
      `Abreise: ${checkOut}`,
      guests ? `Gäste: ${guests}` : null,
      phone ? `Telefon: ${phone}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await db.insert(bookingMessages).values({
      bookingRequestId: request.id,
      direction: "incoming",
      channel: "form",
      fromName: name,
      fromEmail: email,
      subject: "Anfrage über das Kontaktformular",
      body: [summary, "", message || "(keine Nachricht)"].join("\n").trim(),
    });

    const settings = await getSiteSettings();
    await sendAdminNotification({ request, fallbackEmail: settings.contactEmail });

    revalidatePath("/admin/posteingang");
    return { ok: true };
  } catch (err) {
    console.error("[submitBookingRequest] failed:", err);
    return { ok: false, error: "Die Anfrage konnte nicht gespeichert werden. Bitte später erneut versuchen." };
  }
}
