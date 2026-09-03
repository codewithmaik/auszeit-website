"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, MessageSquare, ChevronRight } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { STATUS_LABELS, STATUS_BADGE_CLASS, formatDate } from "@/lib/booking";
import type { BookingRequest, BookingRequestStatus, BookingMessage } from "@/db/schema";
import BookingForm, { type ApartmentOption } from "./BookingForm";
import RequestThread from "./RequestThread";
import { confirmBooking } from "./actions";

const TABS: { key: BookingRequestStatus | "alle"; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "neu", label: "Neu" },
  { key: "in_bearbeitung", label: "In Bearbeitung" },
  { key: "gebucht", label: "Gebucht" },
  { key: "abgelehnt", label: "Abgelehnt" },
  { key: "archiviert", label: "Archiviert" },
];

export default function RequestList({
  requests,
  apartments,
  messages,
  mailLimited,
}: {
  requests: BookingRequest[];
  apartments: ApartmentOption[];
  messages: Record<number, BookingMessage[]>;
  mailLimited: boolean;
}) {
  const [tab, setTab] = useState<BookingRequestStatus | "alle">("alle");
  const [openId, setOpenId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<BookingRequest | null>(null);

  const apartmentName = useMemo(() => new Map(apartments.map((a) => [a.id, a.name])), [apartments]);
  const filtered = tab === "alle" ? requests : requests.filter((r) => r.status === tab);
  const open = openId != null ? requests.find((r) => r.id === openId) ?? null : null;

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
        <div className="space-y-3">
          {filtered.map((r) => {
            const msgs = messages[r.id] ?? [];
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setOpenId(r.id)}
                className="w-full text-left bg-white border border-line rounded-[2px] p-4 hover:border-forest transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <h3 className="text-[1rem] m-0">{r.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-[2px] font-sans text-[0.64rem] tracking-[0.06em] uppercase ${STATUS_BADGE_CLASS[r.status]}`}
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
                      {formatDate(r.checkIn)} – {formatDate(r.checkOut)}
                      {r.guests ? ` · ${r.guests}` : ""}
                    </p>
                    {r.message && (
                      <p className="text-[0.8rem] text-ink/80 m-0 mt-1 line-clamp-1">{r.message}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[0.74rem] text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {r.email}
                      </span>
                      {r.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {r.phone}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {msgs.length}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-soft flex-none mt-1 group-hover:text-forest transition-colors" strokeWidth={1.5} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <Modal onClose={() => setOpenId(null)} title={open.name} size="lg">
          <RequestThread
            request={open}
            messages={messages[open.id] ?? []}
            mailLimited={mailLimited}
            onMarkBooked={() => {
              setConfirmTarget(open);
              setOpenId(null);
            }}
          />
        </Modal>
      )}

      {confirmTarget && (
        <Modal onClose={() => setConfirmTarget(null)} title="Als gebucht markieren" size="md">
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
