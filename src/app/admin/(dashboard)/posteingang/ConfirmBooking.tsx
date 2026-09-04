"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus, Trash2, ArrowLeft, Check, FileText, Send, Download, Loader2 } from "lucide-react";
import type { BookingRequest } from "@/db/schema";
import type { BookingFormData } from "@/lib/booking";
import {
  buildInvoiceData,
  computeInvoiceTotals,
  formatEuro,
  nightsBetween,
  type InvoiceInput,
  type InvoiceLineItem,
  type InvoiceSettings,
} from "@/lib/invoice";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";
import type { ApartmentOption } from "./BookingForm";
import { confirmBooking, confirmBookingWithInvoice, type InvoiceFlowMode } from "./actions";

const label = "block text-[0.68rem] tracking-[0.09em] uppercase text-ink-soft mb-1";
const field =
  "w-full px-3 py-2 border border-line rounded-[2px] font-sans text-[0.86rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const primaryBtn =
  "inline-flex items-center gap-1.5 px-4 py-2.5 bg-forest text-white font-sans text-[0.72rem] tracking-[0.07em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const ghostBtn =
  "inline-flex items-center gap-1.5 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.07em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors cursor-pointer disabled:opacity-50";

type View = "booking" | "invoice" | "preview";

export default function ConfirmBooking({
  request,
  apartments,
  invoiceSettings,
  onDone,
}: {
  request: BookingRequest;
  apartments: ApartmentOption[];
  invoiceSettings: InvoiceSettings;
  onDone: () => void;
}) {
  const [view, setView] = useState<View>("booking");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Buchungsfelder
  const [apartmentId, setApartmentId] = useState(request.apartmentId != null ? String(request.apartmentId) : "");
  const [checkIn, setCheckIn] = useState(request.checkIn);
  const [checkOut, setCheckOut] = useState(request.checkOut);
  const [guests, setGuests] = useState(request.guests ?? "");
  const [guestName, setGuestName] = useState(request.name ?? "");
  const [guestEmail, setGuestEmail] = useState(request.email ?? "");
  const [guestPhone, setGuestPhone] = useState(request.phone ?? "");
  const [note, setNote] = useState(request.message ?? "");
  const [prepareInvoice, setPrepareInvoice] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);
  const isKleinunternehmer = invoiceSettings.taxMode === "kleinunternehmer";

  // Rechnungsfelder
  const [rcpName, setRcpName] = useState(request.name ?? "");
  const [rcpAddr, setRcpAddr] = useState("");
  const [rcpZip, setRcpZip] = useState("");
  const [rcpCity, setRcpCity] = useState("");
  const [rcpCountry, setRcpCountry] = useState("Deutschland");
  const [rcpEmail, setRcpEmail] = useState(request.email ?? "");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() => [
    {
      description: `Übernachtung${nights > 0 ? ` (${nights} ${nights === 1 ? "Nacht" : "Nächte"})` : ""}`,
      qty: nights > 0 ? nights : 1,
      unitPrice: 0,
      vatRate: invoiceSettings.vatRateAccommodation,
    },
  ]);

  const bookingData: BookingFormData = {
    apartmentId: Number(apartmentId),
    checkIn,
    checkOut,
    guests: guests.trim(),
    guestName: guestName.trim(),
    guestEmail: guestEmail.trim(),
    guestPhone: guestPhone.trim(),
    note: note.trim(),
  };

  const apartmentName = apartments.find((a) => a.id === Number(apartmentId))?.name ?? "";

  const invoiceInput: InvoiceInput = {
    recipient: {
      name: rcpName.trim(),
      addressLine: rcpAddr.trim(),
      zip: rcpZip.trim(),
      city: rcpCity.trim(),
      country: rcpCountry.trim() || "Deutschland",
      email: rcpEmail.trim(),
    },
    servicePeriod: { from: checkIn, to: checkOut },
    apartmentName,
    guests: guests.trim(),
    lineItems: lineItems.map((l) => ({ ...l, qty: Number(l.qty) || 0, unitPrice: Number(l.unitPrice) || 0 })),
    note: invoiceNote.trim(),
  };

  const previewData = buildInvoiceData(invoiceInput, invoiceSettings);
  const totals = computeInvoiceTotals(previewData);

  const bookingValid =
    apartmentId !== "" && checkIn !== "" && checkOut !== "" && checkOut > checkIn && guests.trim() !== "";

  function updateLine(i: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((items) => items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function addLine() {
    setLineItems((items) => [
      ...items,
      { description: "", qty: 1, unitPrice: 0, vatRate: invoiceSettings.vatRateExtras },
    ]);
  }
  function removeLine(i: number) {
    setLineItems((items) => (items.length > 1 ? items.filter((_, idx) => idx !== i) : items));
  }

  function toBooking() {
    setError(null);
    if (!bookingValid) {
      setError("Bitte Wohnung, gültigen Zeitraum und Gästezahl angeben.");
      return;
    }
    setView("invoice");
  }

  function toPreview() {
    setError(null);
    if (!rcpName.trim() || !rcpAddr.trim() || !rcpZip.trim() || !rcpCity.trim()) {
      setError("Bitte Name und vollständige Anschrift des Empfängers angeben.");
      return;
    }
    if (!lineItems.some((l) => Number(l.unitPrice) > 0)) {
      setError("Bitte mindestens eine Position mit Preis erfassen.");
      return;
    }
    setView("preview");
  }

  function confirmWithoutInvoice() {
    setError(null);
    if (!bookingValid) {
      setError("Bitte Wohnung, gültigen Zeitraum und Gästezahl angeben.");
      return;
    }
    startTransition(async () => {
      try {
        await confirmBooking(request.id, bookingData);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
      }
    });
  }

  function runInvoiceFlow(mode: InvoiceFlowMode) {
    setError(null);
    startTransition(async () => {
      const res = await confirmBookingWithInvoice(request.id, bookingData, invoiceInput, mode);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (mode === "download") {
        setDownloadUrl(res.pdfUrl ?? res.shareUrl);
        return;
      }
      onDone();
    });
  }

  // Löst den Download automatisch aus, sobald die PDF fertig ist.
  useEffect(() => {
    if (downloadUrl) downloadLinkRef.current?.click();
  }, [downloadUrl]);

  // ---- Ansicht: Buchung ----
  if (view === "booking") {
    return (
      <div className="space-y-3.5">
        <div>
          <label className={label}>Wohnung *</label>
          <select value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} className={field}>
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
            <label className={label}>Anreise *</label>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label}>Abreise *</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || undefined}
              onChange={(e) => setCheckOut(e.target.value)}
              className={field}
            />
          </div>
        </div>
        <div>
          <label className={label}>Gästezahl *</label>
          <input
            type="text"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="z. B. 2 Erwachsene"
            className={field}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Gastname</label>
            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label}>Telefon</label>
            <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={field} />
          </div>
        </div>
        <div>
          <label className={label}>E-Mail</label>
          <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={field} />
        </div>
        <div>
          <label className={label}>Notiz</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={field} />
        </div>

        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={prepareInvoice}
            onChange={(e) => setPrepareInvoice(e.target.checked)}
            className="w-4 h-4 accent-forest"
          />
          <span className="text-[0.85rem] text-ink">Rechnung vorbereiten</span>
        </label>
        {prepareInvoice && (
          <p className="text-[0.75rem] text-ink-soft m-0 -mt-1">
            Kalender und Status werden erst nach „PDF herunterladen&ldquo; oder „Absenden&ldquo; aktualisiert.
          </p>
        )}

        {error && <p className="text-[0.8rem] text-[#a13c2f] m-0">{error}</p>}

        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          {prepareInvoice ? (
            <button type="button" onClick={toBooking} disabled={isPending} className={primaryBtn}>
              Weiter zur Rechnung
            </button>
          ) : (
            <button type="button" onClick={confirmWithoutInvoice} disabled={isPending} className={primaryBtn}>
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2} />}
              Bestätigen &amp; übernehmen
            </button>
          )}
          <button type="button" onClick={onDone} disabled={isPending} className={ghostBtn}>
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  // ---- Ansicht: Rechnungsangaben ----
  if (view === "invoice") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setView("booking")}
          className="inline-flex items-center gap-1.5 text-ink-soft text-[0.75rem] uppercase tracking-[0.05em] hover:text-forest"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> Zurück zur Buchung
        </button>

        <div>
          <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft mb-2">Rechnungsempfänger</h3>
          <div className="space-y-3">
            <div>
              <label className={label}>Name / Firma *</label>
              <input type="text" value={rcpName} onChange={(e) => setRcpName(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>Straße &amp; Hausnr. *</label>
              <input type="text" value={rcpAddr} onChange={(e) => setRcpAddr(e.target.value)} className={field} />
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <div>
                <label className={label}>PLZ *</label>
                <input type="text" value={rcpZip} onChange={(e) => setRcpZip(e.target.value)} className={field} />
              </div>
              <div>
                <label className={label}>Ort *</label>
                <input type="text" value={rcpCity} onChange={(e) => setRcpCity(e.target.value)} className={field} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Land</label>
                <input type="text" value={rcpCountry} onChange={(e) => setRcpCountry(e.target.value)} className={field} />
              </div>
              <div>
                <label className={label}>E-Mail (für den Versand)</label>
                <input type="email" value={rcpEmail} onChange={(e) => setRcpEmail(e.target.value)} className={field} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft m-0">Positionen</h3>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-1 text-[0.72rem] text-forest hover:underline">
              <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Position
            </button>
          </div>
          <div className="space-y-2">
            {lineItems.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_58px_92px_66px_28px] gap-2 items-center max-[560px]:grid-cols-1">
                <input
                  type="text"
                  value={l.description}
                  onChange={(e) => updateLine(i, { description: e.target.value })}
                  placeholder="Beschreibung"
                  className={field}
                />
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={l.qty}
                  onChange={(e) => updateLine(i, { qty: Number(e.target.value) })}
                  className={field}
                  aria-label="Menge"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={l.unitPrice}
                  onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                  className={field}
                  aria-label="Einzelpreis (EUR)"
                />
                {isKleinunternehmer ? (
                  <span className="text-[0.72rem] text-ink-soft text-center">—</span>
                ) : (
                  <select
                    value={l.vatRate}
                    onChange={(e) => updateLine(i, { vatRate: Number(e.target.value) })}
                    className={field}
                    aria-label="USt-Satz"
                  >
                    {[0, invoiceSettings.vatRateAccommodation, invoiceSettings.vatRateExtras]
                      .filter((v, idx, arr) => arr.indexOf(v) === idx)
                      .map((v) => (
                        <option key={v} value={v}>
                          {v}%
                        </option>
                      ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="text-ink-soft hover:text-[#a13c2f] disabled:opacity-30"
                  disabled={lineItems.length === 1}
                  aria-label="Position entfernen"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[0.78rem] text-ink-soft mt-2 mb-0">
            Zwischensumme: <strong>{formatEuro(totals.grossTotal)}</strong>
            {isKleinunternehmer ? " (§ 19 UStG, ohne USt.)" : ` (inkl. ${formatEuro(totals.vatTotal)} USt.)`}
          </p>
        </div>

        <div>
          <label className={label}>Zusätzlicher Hinweis auf der Rechnung (optional)</label>
          <textarea value={invoiceNote} onChange={(e) => setInvoiceNote(e.target.value)} rows={2} className={field} />
        </div>

        {error && <p className="text-[0.8rem] text-[#a13c2f] m-0">{error}</p>}

        <div className="flex items-center gap-2.5 flex-wrap">
          <button type="button" onClick={toPreview} disabled={isPending} className={primaryBtn}>
            <FileText className="w-3.5 h-3.5" strokeWidth={1.75} /> Vorschau anzeigen
          </button>
          <button type="button" onClick={onDone} disabled={isPending} className={ghostBtn}>
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  // ---- Ansicht: Vorschau + Aktionen ----
  return (
    <div className="space-y-4">
      {downloadUrl ? (
        <div className="rounded-[3px] border border-forest/30 bg-forest/[0.06] p-4">
          <p className="text-[0.85rem] text-ink m-0 mb-2">
            Buchung übernommen. Der Download der Rechnung startet automatisch.
          </p>
          <a
            ref={downloadLinkRef}
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="text-forest text-[0.82rem] hover:underline break-all"
          >
            {downloadUrl}
          </a>
          <div>
            <button type="button" onClick={onDone} className={`${primaryBtn} mt-3`}>
              Fertig
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="border border-line rounded-[2px] bg-[#f3f3ec] overflow-auto max-h-[80vh] p-4 flex justify-center">
            <div
              style={{ width: "210mm" }}
              className="shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)] shrink-0 [zoom:0.92] max-[720px]:[zoom:0.5]"
            >
              <InvoiceDocument data={previewData} />
            </div>
          </div>

          {error && <p className="text-[0.8rem] text-[#a13c2f] m-0">{error}</p>}

          <div className="flex items-center gap-2.5 flex-wrap">
            <button type="button" onClick={() => setView("invoice")} disabled={isPending} className={ghostBtn}>
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> Anpassen
            </button>
            <button type="button" onClick={() => runInvoiceFlow("download")} disabled={isPending} className={ghostBtn}>
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" strokeWidth={1.75} />}
              PDF herunterladen
            </button>
            <button type="button" onClick={() => runInvoiceFlow("send")} disabled={isPending} className={primaryBtn}>
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" strokeWidth={2} />}
              Absenden
            </button>
          </div>
        </>
      )}
    </div>
  );
}
