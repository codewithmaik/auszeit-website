import { getBookingRequests, getCalendarDays } from "@/db/queries";
import RequestList from "./RequestList";
import Kalender from "./Kalender";

export const metadata = { title: "Posteingang" };
export const dynamic = "force-dynamic";

export default async function AdminPosteingangPage() {
  const [requests, calendarDays] = await Promise.all([getBookingRequests(), getCalendarDays()]);

  return (
    <div>
      <h1 className="text-[1.8rem] mb-2">Posteingang</h1>
      <p className="text-ink-soft mb-8 max-w-[640px]">
        Buchungsanfragen aus dem Kontaktformular. Das Formular sendet aktuell noch nicht produktiv —
        die Anfragen unten sind Beispieldaten, damit sich der Ablauf schon jetzt testen lässt.
      </p>

      <div className="grid grid-cols-[1fr_340px] max-[900px]:grid-cols-1 gap-8 items-start">
        <RequestList requests={requests} />

        <div className="bg-white border border-line rounded-[2px] p-5 sticky top-6 max-[900px]:static">
          <h2 className="text-[1.05rem] mb-1">Verfügbarkeitskalender</h2>
          <p className="text-[0.78rem] text-ink-soft mb-4">
            Klick: Details ansehen · Doppelklick: frei/belegt umschalten
          </p>
          <Kalender days={calendarDays} />
        </div>
      </div>
    </div>
  );
}
