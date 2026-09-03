import {
  getApartments,
  getBookingRequests,
  getCalendarDays,
  getAllBookingMessages,
  getInvoices,
  getInvoiceSettings,
} from "@/db/queries";
import { emailDeliveryLimited } from "@/lib/email";
import RequestList from "./RequestList";
import Kalender, { type CalendarInvoice } from "./Kalender";

export const metadata = { title: "Posteingang" };
export const dynamic = "force-dynamic";

export default async function AdminPosteingangPage() {
  const [requests, calendarDays, apartments, messagesByRequest, invoices, invoiceSettings] =
    await Promise.all([
      getBookingRequests(),
      getCalendarDays(),
      getApartments(),
      getAllBookingMessages(),
      getInvoices(),
      getInvoiceSettings(),
    ]);

  const apartmentOptions = apartments.map((a) => ({ id: a.id, name: a.name }));
  const messages = Object.fromEntries(messagesByRequest);
  const mailLimited = emailDeliveryLimited();
  const invoicesById: Record<number, CalendarInvoice> = Object.fromEntries(
    invoices.map((i) => [
      i.id,
      { id: i.id, token: i.token, status: i.status, pdfUrl: i.pdfUrl, invoiceNumber: i.invoiceNumber },
    ]),
  );

  return (
    <div>
      <h1 className="text-[1.8rem] mb-2">Posteingang</h1>
      <p className="text-ink-soft mb-8 max-w-[640px]">
        Buchungsanfragen aus dem Kontaktformular. Klick auf eine Anfrage öffnet den Verlauf — dort
        kannst du direkt per E-Mail antworten, den Status setzen und die Buchung übernehmen.
      </p>

      {mailLimited && (
        <div className="mb-6 rounded-[2px] border border-gold/40 bg-gold/10 px-4 py-3 text-[0.82rem] text-[#8a6a1a] max-w-[720px]">
          <strong>Hinweis zum E-Mail-Versand:</strong> Es wird derzeit über die Resend-Testdomain
          gesendet. Benachrichtigungen an die eigene Adresse funktionieren, Antworten an Gäste werden
          protokolliert, aber erst nach Verifizierung einer eigenen Absender-Domain zugestellt.
        </div>
      )}

      <div className="grid grid-cols-[1fr_360px] max-[900px]:grid-cols-1 gap-8 items-start">
        <RequestList
          requests={requests}
          apartments={apartmentOptions}
          messages={messages}
          mailLimited={mailLimited}
          invoiceSettings={invoiceSettings}
        />

        <div className="bg-white border border-line rounded-[2px] p-5 sticky top-6 max-[900px]:static">
          <h2 className="text-[1.05rem] mb-1">Belegungskalender</h2>
          <p className="text-[0.78rem] text-ink-soft mb-4">
            Wohnung wählen · Klick auf freien Tag: belegen · Klick auf belegten Tag: bearbeiten
          </p>
          {apartmentOptions.length === 0 ? (
            <p className="text-[0.85rem] text-ink-soft">
              Noch keine Wohnungen angelegt — dafür bitte zuerst unter „Wohnungen&ldquo; eine anlegen.
            </p>
          ) : (
            <Kalender days={calendarDays} apartments={apartmentOptions} invoices={invoicesById} />
          )}
        </div>
      </div>
    </div>
  );
}
