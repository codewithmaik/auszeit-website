import { getBookingRequests } from "@/db/queries";
import RequestList from "./RequestList";

export const metadata = { title: "Posteingang" };
export const dynamic = "force-dynamic";

export default async function AdminPosteingangPage() {
  const requests = await getBookingRequests();

  return (
    <div>
      <h1 className="text-[1.8rem] mb-2">Posteingang</h1>
      <p className="text-ink-soft mb-8 max-w-[640px]">
        Buchungsanfragen aus dem Kontaktformular. Das Formular sendet aktuell noch nicht produktiv —
        die Anfragen unten sind Beispieldaten, damit sich der Ablauf schon jetzt testen lässt.
      </p>

      <RequestList requests={requests} />
    </div>
  );
}
