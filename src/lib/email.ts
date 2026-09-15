import "server-only";
import { Resend } from "resend";
import type { BookingRequest } from "@/db/schema";
import { SITE_URL } from "./site";

// Ausgehender E-Mail-Versand über Resend (Vercel Marketplace). Bewusst nur
// ausgehend: Kundenantworten landen im normalen Postfach und werden im
// Adminpanel bei Bedarf manuell nachgetragen (booking_messages, channel "note").
//
// Ohne verifizierte Absender-Domain nutzt Resend die Testdomain
// `onboarding@resend.dev` und stellt AUSSCHLIESSLICH an die eigene
// Resend-Account-Adresse zu. Die Admin-Benachrichtigung funktioniert damit
// sofort, Kundenmails erst nach Domain-Verifizierung. `emailDeliveryLimited()`
// meldet diesen Zustand an die UI.

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.EMAIL_FROM ?? "AUSZEIT Ferienwohnung <onboarding@resend.dev>";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export function isEmailConfigured(): boolean {
  return resend !== null;
}

/** true, solange über die Resend-Testdomain gesendet wird (keine echte Zustellung an Fremdadressen). */
export function emailDeliveryLimited(): boolean {
  return !isEmailConfigured() || /@resend\.dev>?\s*$/i.test(FROM);
}

export type SendResult = {
  ok: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
};

async function send(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY nicht gesetzt — E-Mail wird nur geloggt:", opts.subject);
    return { ok: false, skipped: true, error: "E-Mail-Versand nicht konfiguriert." };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[email] Resend-Fehler:", error);
      return { ok: false, error: error.message ?? "Versand fehlgeschlagen." };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[email] Versand-Ausnahme:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Versand fehlgeschlagen." };
  }
}

/** Benachrichtigt den Betreiber über eine neue Anfrage aus dem Kontaktformular. */
export async function sendAdminNotification(params: {
  request: BookingRequest;
  fallbackEmail: string;
}): Promise<SendResult> {
  const to = NOTIFY_EMAIL || params.fallbackEmail;
  if (!to) return { ok: false, skipped: true, error: "Kein Benachrichtigungs-Empfänger." };

  const r = params.request;
  const lines = [
    `Neue Buchungsanfrage über das Kontaktformular (${r.locale === "en" ? "englisch" : "deutsch"}):`,
    "",
    `Name:     ${r.name}`,
    `E-Mail:   ${r.email}`,
    `Telefon:  ${r.phone || "—"}`,
    `Anreise:  ${r.checkIn}`,
    `Abreise:  ${r.checkOut}`,
    `Gäste:    ${r.guests || "—"}`,
    "",
    "Nachricht:",
    r.message || "—",
    "",
    `Im Adminpanel öffnen: ${SITE_URL.replace(/\/$/, "")}/admin/posteingang`,
  ];
  return send({
    to,
    subject: `Neue Anfrage von ${r.name}`,
    text: lines.join("\n"),
    replyTo: r.email || undefined,
  });
}

/** Antwort des Betreibers an den Gast (aus dem Chatverlauf im Posteingang). */
export async function sendCustomerEmail(params: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<SendResult> {
  return send({
    to: params.to,
    subject: params.subject,
    text: params.body,
    replyTo: params.replyTo,
  });
}
