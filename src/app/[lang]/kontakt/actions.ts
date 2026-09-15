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
  /** Honeypot: unsichtbares Formularfeld, das nur Bots ausfüllen (siehe BookingForm.tsx). */
  website?: string;
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const cap = (s: string, max: number) => s.slice(0, max);

/**
 * Nimmt eine Anfrage aus dem öffentlichen Kontaktformular entgegen:
 * schreibt sie in `booking_requests` (Status „neu"), legt die Formular-Nachricht
 * als erste Zeile des Chatverlaufs an und benachrichtigt den Betreiber per
 * E-Mail. E-Mail-Fehler lassen die Anfrage nie scheitern.
 */
export async function submitBookingRequest(payload: BookingRequestPayload): Promise<SubmitResult> {
  // Honeypot ausgefüllt -> vermutlich ein Bot. Erfolg vortäuschen (kein
  // Hinweis, dass die Anfrage verworfen wurde) statt sie zu verarbeiten.
  if (payload.website?.trim()) {
    return { ok: true };
  }

  const name = cap(payload.name?.trim() ?? "", 200);
  const email = cap(payload.email?.trim() ?? "", 200);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk) {
    return { ok: false, error: "Bitte Name und eine gültige E-Mail-Adresse angeben." };
  }

  const checkIn = ISO_DATE.test(payload.checkIn ?? "") ? payload.checkIn : "";
  const checkOut = ISO_DATE.test(payload.checkOut ?? "") ? payload.checkOut : "";
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return { ok: false, error: "Bitte gültige An- und Abreisedaten wählen." };
  }

  const phone = cap(payload.phone?.trim() ?? "", 50);
  const guests = cap(payload.guests?.trim() ?? "", 100);
  const message = cap(payload.message?.trim() ?? "", 5000);
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
