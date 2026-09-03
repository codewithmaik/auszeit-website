"use client";

import { useState, useTransition } from "react";
import type { BookingFormData } from "@/lib/booking";

export type ApartmentOption = { id: number; name: string };

const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";
const fieldClass =
  "w-full px-3 py-[10px] border border-line rounded-[2px] font-sans text-[0.9rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const primaryButtonClass =
  "inline-flex items-center gap-1.5 px-4 py-2.5 bg-forest text-white font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const ghostButtonClass =
  "inline-flex items-center gap-1.5 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors cursor-pointer disabled:opacity-50";

export type BookingFormInitial = {
  apartmentId?: number | null;
  checkIn: string;
  checkOut: string;
  guests?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  note?: string | null;
};

export default function BookingForm({
  apartments,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  secondaryAction,
}: {
  apartments: ApartmentOption[];
  initial: BookingFormInitial;
  submitLabel: string;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel: () => void;
  secondaryAction?: React.ReactNode;
}) {
  const [apartmentId, setApartmentId] = useState<string>(
    initial.apartmentId != null ? String(initial.apartmentId) : "",
  );
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [guests, setGuests] = useState(initial.guests ?? "");
  const [guestName, setGuestName] = useState(initial.guestName ?? "");
  const [guestEmail, setGuestEmail] = useState(initial.guestEmail ?? "");
  const [guestPhone, setGuestPhone] = useState(initial.guestPhone ?? "");
  const [note, setNote] = useState(initial.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = apartmentId !== "" && checkIn !== "" && checkOut !== "" && checkOut > checkIn;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({
          apartmentId: Number(apartmentId),
          checkIn,
          checkOut,
          guests: guests.trim(),
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          note: note.trim(),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="bf-apartment" className={labelClass}>
          Wohnung *
        </label>
        <select
          id="bf-apartment"
          value={apartmentId}
          onChange={(e) => setApartmentId(e.target.value)}
          className={fieldClass}
        >
          <option value="">Wohnung wählen …</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bf-checkin" className={labelClass}>
            Anreise
          </label>
          <input
            id="bf-checkin"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="bf-checkout" className={labelClass}>
            Abreise
          </label>
          <input
            id="bf-checkout"
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => setCheckOut(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bf-guests" className={labelClass}>
          Gästezahl
        </label>
        <input
          id="bf-guests"
          type="text"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          placeholder="z. B. 2 Erwachsene"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="bf-name" className={labelClass}>
          Gastname
        </label>
        <input
          id="bf-name"
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bf-email" className={labelClass}>
            E-Mail
          </label>
          <input
            id="bf-email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="bf-phone" className={labelClass}>
            Telefon
          </label>
          <input
            id="bf-phone"
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bf-note" className={labelClass}>
          Notiz
        </label>
        <textarea
          id="bf-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className={fieldClass}
        />
      </div>

      {error && <p className="text-[0.8rem] text-[#a13c2f] m-0">{error}</p>}

      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        <button type="button" onClick={handleSubmit} disabled={!canSubmit || isPending} className={primaryButtonClass}>
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={isPending} className={ghostButtonClass}>
          Abbrechen
        </button>
        {secondaryAction}
      </div>
    </div>
  );
}
