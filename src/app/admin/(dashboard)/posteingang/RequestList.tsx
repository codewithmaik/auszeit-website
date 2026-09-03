"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, X as XIcon, Archive, RotateCcw, Mail, Phone } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { STATUS_LABELS, STATUS_BADGE_CLASS, formatDate } from "@/lib/booking";
import type { BookingRequest, BookingRequestStatus } from "@/db/schema";
import BookingForm, { type ApartmentOption } from "./BookingForm";
import { confirmBooking, setRequestStatus } from "./actions";

const TABS: { key: BookingRequestStatus | "alle"; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "neu", label: "Neu" },
  { key: "gebucht", label: "Gebucht" },
  { key: "abgelehnt", label: "Abgelehnt" },
  { key: "archiviert", label: "Archiviert" },
];

const actionButtonClass =
  "inline-flex items-center gap-1.5 px-3.5 py-2 border border-line text-ink-soft font-sans text-[0.7rem] tracking-[0.06em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButtonClass =
  "inline-flex items-center gap-1.5 px-3.5 py-2 bg-forest text-white font-sans text-[0.7rem] tracking-[0.06em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export default function RequestList({
  requests,
  apartments,
}: {
  requests: BookingRequest[];
  apartments: ApartmentOption[];
}) {
  const [tab, setTab] = useState<BookingRequestStatus | "alle">("alle");
  const [confirmTarget, setConfirmTarget] = useState<BookingRequest | null>(null);
  const [isPending, startTransition] = useTransition();

  const apartmentName = useMemo(() => new Map(apartments.map((a) => [a.id, a.name])), [apartments]);
  const filtered = tab === "alle" ? requests : requests.filter((r) => r.status === tab);

  function runStatusChange(id: number, status: Exclude<BookingRequestStatus, "gebucht">) {
    startTransition(() => {
      setRequestStatus(id, status);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 rounded-[2px] font-sans text-[0.72rem] tracking-[0.06em] uppercase transition-colors cursor-pointer ${
              tab === t.key ? "bg-forest text-white" : "bg-white border border-line text-ink-soft hover:border-forest"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-soft">Keine Anfragen in dieser Ansicht.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-line rounded-[2px] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-[1.02rem] m-0">{r.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-[2px] font-sans text-[0.66rem] tracking-[0.06em] uppercase ${STATUS_BADGE_CLASS[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                    {r.status === "gebucht" && r.apartmentId != null && (
                      <span className="text-[0.72rem] text-ink-soft">
                        {apartmentName.get(r.apartmentId) ?? `Wohnung ${r.apartmentId}`}
                      </span>
                    )}
                  </div>
                  <p className="text-[0.8rem] text-ink-soft m-0">
                    {formatDate(r.checkIn)} – {formatDate(r.checkOut)} · {r.guests}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[0.8rem] text-ink-soft">
                  <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 hover:text-forest transition-colors">
                    <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {r.email}
                  </a>
                  {r.phone && (
                    <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 hover:text-forest transition-colors">
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {r.phone}
                    </a>
                  )}
                </div>
              </div>

              {r.message && <p className="text-[0.85rem] text-ink mb-4 whitespace-pre-wrap">{r.message}</p>}

              <div className="flex items-center gap-2.5 flex-wrap">
                {r.status === "neu" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(r)}
                      className={primaryButtonClass}
                      disabled={isPending}
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                      Als gebucht markieren
                    </button>
                    <button
                      type="button"
                      onClick={() => runStatusChange(r.id, "abgelehnt")}
                      className={actionButtonClass}
                      disabled={isPending}
                    >
                      <XIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      Ablehnen
                    </button>
                  </>
                )}
                {r.status !== "archiviert" && (
                  <button
                    type="button"
                    onClick={() => runStatusChange(r.id, "archiviert")}
                    className={actionButtonClass}
                    disabled={isPending}
                  >
                    <Archive className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Archivieren
                  </button>
                )}
                {r.status !== "neu" && r.status !== "gebucht" && (
                  <button
                    type="button"
                    onClick={() => runStatusChange(r.id, "neu")}
                    className={actionButtonClass}
                    disabled={isPending}
                  >
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Zurück zu Neu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmTarget && (
        <Modal onClose={() => setConfirmTarget(null)} title="Als gebucht markieren">
          <p className="text-[0.85rem] text-ink-soft mb-4">
            Wohnung wählen und Daten prüfen. Beim Bestätigen wird die Anfrage als „Gebucht&rdquo; markiert
            und die Tage im Kalender der gewählten Wohnung belegt.
          </p>
          {apartments.length === 0 ? (
            <p className="text-[0.85rem] text-[#a13c2f]">
              Es sind noch keine Wohnungen angelegt — dafür bitte zuerst unter „Wohnungen&rdquo; eine anlegen.
            </p>
          ) : (
            <BookingForm
              apartments={apartments}
              initial={{
                apartmentId: confirmTarget.apartmentId,
                checkIn: confirmTarget.checkIn,
                checkOut: confirmTarget.checkOut,
                guests: confirmTarget.guests,
                guestName: confirmTarget.name,
                guestEmail: confirmTarget.email,
                guestPhone: confirmTarget.phone,
                note: confirmTarget.message,
              }}
              submitLabel="Bestätigen & übernehmen"
              onCancel={() => setConfirmTarget(null)}
              onSubmit={async (data) => {
                await confirmBooking(confirmTarget.id, data);
                setConfirmTarget(null);
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
