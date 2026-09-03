"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { formatDate } from "@/lib/booking";
import type { CalendarDay } from "@/db/schema";
import { saveCalendarDay, toggleCalendarDay } from "./actions";

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

export default function Kalender({ days }: { days: CalendarDay[] }) {
  const today = new Date();
  const [monthStart, setMonthStart] = useState(() => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const byDate = new Map(days.map((d) => [d.date, d]));
  const cells = buildMonthGrid(monthStart);
  const todayIso = toIsoDate(today);
  const selected = selectedDate ? (byDate.get(selectedDate) ?? null) : null;

  function changeMonth(delta: number) {
    setMonthStart((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + delta, 1)));
  }

  function handleDayClick(date: string) {
    if (clickTimer.current) return;
    clickTimer.current = setTimeout(() => {
      setSelectedDate(date);
      clickTimer.current = null;
    }, 220);
  }

  function handleDayDoubleClick(date: string) {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    startTransition(() => {
      toggleCalendarDay(date);
    });
  }

  return (
    <div>
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
          const belegt = byDate.has(date);
          const day = Number(date.split("-")[2]);
          const isToday = date === todayIso;
          return (
            <button
              key={date}
              type="button"
              onClick={() => handleDayClick(date)}
              onDoubleClick={() => handleDayDoubleClick(date)}
              disabled={isPending}
              title="Klick: Details · Doppelklick: frei/belegt umschalten"
              className={`aspect-square rounded-[2px] text-[0.8rem] transition-colors cursor-pointer border ${
                belegt
                  ? "bg-[#a13c2f]/10 border-[#a13c2f]/30 text-[#a13c2f] hover:border-[#a13c2f]"
                  : "bg-white border-line text-ink hover:border-forest"
              } ${isToday ? "ring-1 ring-gold ring-offset-1" : ""}`}
            >
              {day}
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

      {selectedDate && (
        <DayPopup
          date={selectedDate}
          entry={selected}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

function DayPopup({
  date,
  entry,
  onClose,
}: {
  date: string;
  entry: CalendarDay | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [guestName, setGuestName] = useState(entry?.guestName ?? "");
  const [note, setNote] = useState(entry?.note ?? "");

  const linkedToRequest = Boolean(entry?.bookingRequestId);

  function handleSave() {
    startTransition(() => {
      saveCalendarDay(date, { guestName, note }).then(() => onClose());
    });
  }

  return (
    <Modal onClose={onClose} title={formatDate(date)}>
      {!entry && (
        <p className="text-[0.85rem] text-ink-soft">
          Dieser Tag ist frei. Zum Markieren als belegt den Tag im Kalender doppelklicken.
        </p>
      )}

      {entry && linkedToRequest && (
        <div className="space-y-2 text-[0.85rem]">
          <p className="text-ink m-0">
            <strong>{entry.guestName}</strong>
          </p>
          <div className="flex items-center gap-3 text-ink-soft">
            {entry.guestEmail && (
              <a href={`mailto:${entry.guestEmail}`} className="flex items-center gap-1.5 hover:text-forest transition-colors">
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                {entry.guestEmail}
              </a>
            )}
            {entry.guestPhone && (
              <a href={`tel:${entry.guestPhone}`} className="flex items-center gap-1.5 hover:text-forest transition-colors">
                <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                {entry.guestPhone}
              </a>
            )}
          </div>
          {entry.guests && <p className="text-ink-soft m-0">{entry.guests}</p>}
          {entry.note && <p className="text-ink m-0 whitespace-pre-wrap">{entry.note}</p>}
          <p className="text-[0.75rem] text-ink-soft pt-2">Aus einer bestätigten Buchungsanfrage übernommen.</p>
        </div>
      )}

      {entry && !linkedToRequest && (
        <div className="space-y-4">
          <div>
            <label htmlFor="guestName" className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
              Gastname
            </label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
            />
          </div>
          <div>
            <label htmlFor="note" className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
              Notiz
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors disabled:opacity-50"
          >
            Speichern
          </button>
        </div>
      )}
    </Modal>
  );
}
