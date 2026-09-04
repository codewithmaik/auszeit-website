"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone, Trash2, FileText, Download } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { addDays, formatDate } from "@/lib/booking";
import type { CalendarDay } from "@/db/schema";
import BookingForm, { type ApartmentOption } from "./BookingForm";
import { createManualBooking, releaseBooking, updateBooking } from "./actions";

/** Minimale Belegung ohne Zusatzangaben — für den schnellen Doppelklick-Toggle. */
function blankBookingData(apartmentId: number, date: string) {
  return {
    apartmentId,
    checkIn: date,
    checkOut: addDays(date, 1),
    guests: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    note: "",
  };
}

const DOUBLE_CLICK_MS = 320;

/**
 * Unterscheidet Einzel- von Doppelklick auf demselben Tag: der erste Klick wartet
 * `DOUBLE_CLICK_MS`, bevor `onSingle` feuert — folgt ein zweiter Klick auf denselben
 * Tag rechtzeitig, wird stattdessen `onDouble` ausgelöst und der Timer verworfen.
 */
function useDayClick(onSingle: (date: string) => void, onDouble: (date: string) => void) {
  const pending = useRef<{ date: string; timer: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current.timer);
    },
    [],
  );

  return function handle(date: string) {
    if (pending.current && pending.current.date === date) {
      clearTimeout(pending.current.timer);
      pending.current = null;
      onDouble(date);
      return;
    }
    if (pending.current) clearTimeout(pending.current.timer);
    const timer = setTimeout(() => {
      pending.current = null;
      onSingle(date);
    }, DOUBLE_CLICK_MS);
    pending.current = { date, timer };
  };
}

export type CalendarInvoice = {
  id: number;
  token: string;
  status: "entwurf" | "final";
  pdfUrl: string | null;
  invoiceNumber: string | null;
};

function InvoiceRow({ invoice }: { invoice: CalendarInvoice | undefined }) {
  if (!invoice) return null;
  return (
    <div className="flex items-center gap-3 mt-2 text-[0.78rem]">
      <span className="inline-flex items-center gap-1 text-ink-soft">
        <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
        Rechnung {invoice.status === "final" ? invoice.invoiceNumber ?? "" : "(Entwurf)"}
      </span>
      <a
        href={`/de/rechnung/${invoice.token}`}
        target="_blank"
        rel="noreferrer"
        className="text-forest hover:underline"
      >
        Ansehen
      </a>
      {invoice.pdfUrl && (
        <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-forest hover:underline">
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> PDF
        </a>
      )}
    </div>
  );
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_FORMAT = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });

function toIsoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function buildMonthGrid(monthStart: Date): (string | null)[] {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Montag = 0 … Sonntag = 6
  const leadingBlanks = (firstOfMonth.getUTCDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIsoDate(new Date(Date.UTC(year, month, day))));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Kalender({
  days,
  apartments,
  invoices,
}: {
  days: CalendarDay[];
  apartments: ApartmentOption[];
  invoices: Record<number, CalendarInvoice>;
}) {
  const today = new Date();
  const [monthStart, setMonthStart] = useState(() => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const [view, setView] = useState<number | "alle">(apartments[0]?.id ?? "alle");
  const [isToggling, startToggle] = useTransition();
  const [popup, setPopup] = useState<
    | { kind: "create"; date: string; apartmentId: number }
    | { kind: "edit"; day: CalendarDay }
    | { kind: "overview"; date: string }
    | { kind: "chooseApartment"; date: string }
    | { kind: "confirmChoice"; date: string; apartmentId: number }
    | null
  >(null);

  const apartmentName = useMemo(
    () => new Map(apartments.map((a) => [a.id, a.name])),
    [apartments],
  );

  /** Belegung einer bestimmten Wohnung an einem bestimmten Tag, unabhängig von `view`. */
  const dayByApartmentDate = useMemo(() => {
    const m = new Map<string, CalendarDay>();
    for (const d of days) m.set(`${d.apartmentId}|${d.date}`, d);
    return m;
  }, [days]);

  function findDay(apartmentId: number, date: string): CalendarDay | undefined {
    return dayByApartmentDate.get(`${apartmentId}|${date}`);
  }

  /** Schneller Belegt/Frei-Toggle ohne weitere Angaben (Doppelklick). */
  function toggleQuick(apartmentId: number, date: string) {
    const entry = findDay(apartmentId, date);
    startToggle(async () => {
      if (entry) await releaseBooking(entry.bookingGroupId);
      else await createManualBooking(blankBookingData(apartmentId, date));
    });
  }

  function openBookingInfo(apartmentId: number, date: string) {
    const entry = findDay(apartmentId, date);
    if (entry) setPopup({ kind: "edit", day: entry });
    else setPopup({ kind: "create", date, apartmentId });
  }

  const visibleDays = view === "alle" ? days : days.filter((d) => d.apartmentId === view);

  // Für die Einzelansicht: ein Eintrag pro Tag. Für "alle": Liste pro Tag.
  const singleByDate = useMemo(() => {
    const m = new Map<string, CalendarDay>();
    if (view !== "alle") for (const d of visibleDays) m.set(d.date, d);
    return m;
  }, [visibleDays, view]);

  const multiByDate = useMemo(() => {
    const m = new Map<string, CalendarDay[]>();
    if (view === "alle") {
      for (const d of days) {
        const list = m.get(d.date);
        if (list) list.push(d);
        else m.set(d.date, [d]);
      }
    }
    return m;
  }, [days, view]);

  const cells = buildMonthGrid(monthStart);
  const todayIso = toIsoDate(today);

  function changeMonth(delta: number) {
    setMonthStart((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + delta, 1)));
  }

  function handleDaySingleClick(date: string) {
    if (view === "alle") {
      if (multiByDate.has(date)) setPopup({ kind: "overview", date });
      return;
    }
    openBookingInfo(view, date);
  }

  function handleDayDoubleClick(date: string) {
    if (view === "alle") {
      setPopup({ kind: "chooseApartment", date });
      return;
    }
    toggleQuick(view, date);
  }

  const handleDayClick = useDayClick(handleDaySingleClick, handleDayDoubleClick);

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="cal-view" className="block text-[0.68rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
          Kalender
        </label>
        <select
          id="cal-view"
          value={String(view)}
          onChange={(e) => setView(e.target.value === "alle" ? "alle" : Number(e.target.value))}
          className="w-full px-3 py-[10px] border border-line rounded-[2px] font-sans text-[0.9rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
        >
          <option value="alle">Alle Wohnungen (Übersicht)</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {view === "alle" && (
          <p className="text-[0.72rem] text-ink-soft mt-1.5 m-0">
            Übersicht aller Wohnungen — zum Bearbeiten eine einzelne Wohnung wählen.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="p-1.5 text-ink-soft hover:text-forest transition-colors cursor-pointer"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h2 className="text-[1rem] m-0 capitalize">{MONTH_FORMAT.format(monthStart)}</h2>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="p-1.5 text-ink-soft hover:text-forest transition-colors cursor-pointer"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[0.68rem] tracking-[0.06em] uppercase text-ink-soft py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const day = Number(date.split("-")[2]);
          const isToday = date === todayIso;
          const count = view === "alle" ? (multiByDate.get(date)?.length ?? 0) : singleByDate.has(date) ? 1 : 0;
          const belegt = count > 0;
          return (
            <button
              key={date}
              type="button"
              disabled={isToggling}
              onClick={() => handleDayClick(date)}
              className={`relative aspect-square rounded-[2px] text-[0.8rem] transition-colors cursor-pointer border disabled:cursor-wait disabled:opacity-70 ${
                belegt
                  ? "bg-[#a13c2f]/10 border-[#a13c2f]/30 text-[#a13c2f] hover:border-[#a13c2f]"
                  : "bg-white border-line text-ink hover:border-forest"
              } ${isToday ? "ring-1 ring-gold ring-offset-1" : ""}`}
            >
              {day}
              {view === "alle" && count > 1 && (
                <span className="absolute bottom-0.5 right-1 text-[0.6rem] leading-none font-sans">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-[0.75rem] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[2px] bg-white border border-line inline-block" />
          Frei
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[2px] bg-[#a13c2f]/10 border border-[#a13c2f]/30 inline-block" />
          Belegt
        </span>
      </div>
      <p className="text-[0.72rem] text-ink-soft mt-1.5 m-0">Doppelklick auf einen Tag: Status sofort umschalten.</p>

      {popup?.kind === "create" && (
        <Modal onClose={() => setPopup(null)} title={`${formatDate(popup.date)} — belegen`} size="cal" align="left">
          <BookingForm
            apartments={apartments}
            initial={{
              apartmentId: popup.apartmentId,
              checkIn: popup.date,
              checkOut: addDays(popup.date, 1),
            }}
            submitLabel="Als belegt übernehmen"
            onCancel={() => setPopup(null)}
            onSubmit={async (data) => {
              await createManualBooking(data);
              setPopup(null);
            }}
          />
        </Modal>
      )}

      {popup?.kind === "edit" && (
        <Modal
          onClose={() => setPopup(null)}
          title={`Belegung — ${formatDate(popup.day.checkIn ?? popup.day.date)}`}
          size="cal"
          align="left"
        >
          {popup.day.bookingRequestId && (
            <p className="text-[0.72rem] text-ink-soft mb-1 -mt-1">Aus einer Buchungsanfrage übernommen.</p>
          )}
          {popup.day.invoiceId != null && (
            <div className="mb-3">
              <InvoiceRow invoice={invoices[popup.day.invoiceId]} />
            </div>
          )}
          <BookingForm
            apartments={apartments}
            initial={{
              apartmentId: popup.day.apartmentId,
              checkIn: popup.day.checkIn ?? popup.day.date,
              checkOut: popup.day.checkOut ?? addDays(popup.day.date, 1),
              guests: popup.day.guests,
              guestName: popup.day.guestName,
              guestEmail: popup.day.guestEmail,
              guestPhone: popup.day.guestPhone,
              note: popup.day.note,
            }}
            submitLabel="Speichern"
            onCancel={() => setPopup(null)}
            onSubmit={async (data) => {
              await updateBooking(popup.day.bookingGroupId, data);
              setPopup(null);
            }}
            secondaryAction={
              <ReleaseButton
                bookingGroupId={popup.day.bookingGroupId}
                onDone={() => setPopup(null)}
              />
            }
          />
        </Modal>
      )}

      {popup?.kind === "chooseApartment" && (
        <Modal onClose={() => setPopup(null)} title={`${formatDate(popup.date)} — Wohnung wählen`} size="cal" align="left">
          <p className="text-[0.8rem] text-ink-soft mb-3 mt-0">Welche Wohnung ist an diesem Tag belegt?</p>
          <ul className="space-y-2 m-0 p-0 list-none">
            {apartments.map((a) => {
              const occupied = Boolean(findDay(a.id, popup.date));
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setPopup({ kind: "confirmChoice", date: popup.date, apartmentId: a.id })}
                    className={`w-full text-left flex items-center justify-between gap-2 px-4 py-2.5 border rounded-[2px] font-sans text-[0.85rem] transition-colors cursor-pointer ${
                      occupied
                        ? "border-[#a13c2f]/30 text-[#a13c2f] hover:bg-[#a13c2f]/10"
                        : "border-line text-ink hover:border-forest"
                    }`}
                  >
                    {a.name}
                    <span className="text-[0.68rem] tracking-[0.06em] uppercase opacity-70">
                      {occupied ? "Belegt" : "Frei"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}

      {popup?.kind === "confirmChoice" && (
        <Modal
          onClose={() => setPopup(null)}
          title={`${apartmentName.get(popup.apartmentId) ?? "Wohnung"} — ${formatDate(popup.date)}`}
          size="cal"
          align="left"
        >
          {(() => {
            const occupied = Boolean(findDay(popup.apartmentId, popup.date));
            return (
              <>
                <p className="text-[0.8rem] text-ink-soft mb-4 mt-0">
                  Aktuell{" "}
                  <strong className={occupied ? "text-[#a13c2f]" : "text-forest"}>
                    {occupied ? "belegt" : "frei"}
                  </strong>
                  . „Bestätigen&ldquo; schaltet den Status direkt um, ohne weitere Angaben — für Details
                  „Buchungsinformationen&ldquo; wählen.
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => {
                      toggleQuick(popup.apartmentId, popup.date);
                      setPopup(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-forest text-white font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Bestätigen
                  </button>
                  <button
                    type="button"
                    onClick={() => openBookingInfo(popup.apartmentId, popup.date)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors cursor-pointer"
                  >
                    Buchungsinformationen
                  </button>
                </div>
              </>
            );
          })()}
        </Modal>
      )}

      {popup?.kind === "overview" && (
        <Modal onClose={() => setPopup(null)} title={formatDate(popup.date)} size="cal" align="left">
          <ul className="space-y-3 m-0 p-0 list-none">
            {(multiByDate.get(popup.date) ?? []).map((d) => (
              <li key={d.id} className="border border-line rounded-[2px] p-3">
                <p className="text-[0.8rem] font-semibold text-ink m-0 mb-1">
                  {apartmentName.get(d.apartmentId) ?? `Wohnung ${d.apartmentId}`}
                </p>
                <p className="text-[0.82rem] text-ink-soft m-0">
                  {d.guestName || "Ohne Namen"}
                  {d.guests ? ` · ${d.guests}` : ""}
                </p>
                {(d.checkIn || d.checkOut) && (
                  <p className="text-[0.78rem] text-ink-soft m-0">
                    {formatDate(d.checkIn ?? d.date)} – {formatDate(d.checkOut ?? d.date)}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[0.78rem] text-ink-soft mt-1">
                  {d.guestEmail && (
                    <a href={`mailto:${d.guestEmail}`} className="flex items-center gap-1.5 hover:text-forest">
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {d.guestEmail}
                    </a>
                  )}
                  {d.guestPhone && (
                    <a href={`tel:${d.guestPhone}`} className="flex items-center gap-1.5 hover:text-forest">
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {d.guestPhone}
                    </a>
                  )}
                </div>
                {d.note && <p className="text-[0.8rem] text-ink mt-1 mb-0 whitespace-pre-wrap">{d.note}</p>}
                {d.invoiceId != null && <InvoiceRow invoice={invoices[d.invoiceId]} />}
              </li>
            ))}
          </ul>
          <p className="text-[0.72rem] text-ink-soft mt-3 mb-0">
            Zum Bearbeiten oben die betreffende Wohnung wählen.
          </p>
        </Modal>
      )}
    </div>
  );
}

function ReleaseButton({ bookingGroupId, onDone }: { bookingGroupId: string; onDone: () => void }) {
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        startTransition(async () => {
          await releaseBooking(bookingGroupId);
          onDone();
        });
      }}
      className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#a13c2f]/40 text-[#a13c2f] font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:bg-[#a13c2f]/10 transition-colors cursor-pointer disabled:opacity-50 ml-auto"
    >
      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
      {armed ? "Wirklich freigeben?" : "Freigeben"}
    </button>
  );
}
