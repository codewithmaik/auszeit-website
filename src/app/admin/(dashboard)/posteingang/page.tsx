import { getApartments, getBookingRequests, getCalendarDays } from "@/db/queries";
import RequestList from "./RequestList";
import Kalender from "./Kalender";

export const metadata = { title: "Posteingang" };
export const dynamic = "force-dynamic";

export default async function AdminPosteingangPage() {
  const [requests, calendarDays, apartments] = await Promise.all([
    getBookingRequests(),
    getCalendarDays(),
    getApartments(),
  ]);

  const apartmentOptions = apartments.map((a) => ({ id: a.id, name: a.name }));

  return (
    <div>
      <h1 className="text-[1.8rem] mb-2">Posteingang</h1>
      <p className="text-ink-soft mb-8 max-w-[640px]">
        Buchungsanfragen aus dem Kontaktformular. Das Formular sendet aktuell noch nicht produktiv —
        die Anfragen unten sind Beispieldaten, damit sich der Ablauf schon jetzt testen lässt.
      </p>

      <div className="grid grid-cols-[1fr_360px] max-[900px]:grid-cols-1 gap-8 items-start">
        <RequestList requests={requests} apartments={apartmentOptions} />

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
            <Kalender days={calendarDays} apartments={apartmentOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
