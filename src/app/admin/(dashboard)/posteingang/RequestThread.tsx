"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Mail, Phone, Send, StickyNote, Check, X as XIcon, Archive, RotateCcw, Loader2 } from "lucide-react";
import { STATUS_LABELS, STATUS_BADGE_CLASS, formatDate } from "@/lib/booking";
import type { BookingRequest, BookingRequestStatus, BookingMessage } from "@/db/schema";
import { sendThreadReply, logIncomingMessage, setRequestStatus } from "./actions";

const LOCALE_LABEL: Record<string, string> = { de: "Deutsch", en: "Englisch" };

const chipBtn =
  "inline-flex items-center gap-1.5 px-3 py-1.5 border border-line text-ink-soft font-sans text-[0.68rem] tracking-[0.06em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const primaryBtn =
  "inline-flex items-center gap-1.5 px-3.5 py-2 bg-forest text-white font-sans text-[0.7rem] tracking-[0.06em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

function fmtDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RequestThread({
  request,
  messages,
  mailLimited,
  onMarkBooked,
}: {
  request: BookingRequest;
  messages: BookingMessage[];
  mailLimited: boolean;
  onMarkBooked: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("Ihre Anfrage bei AUSZEIT");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [logName, setLogName] = useState(request.name);
  const [logBody, setLogBody] = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [messages],
  );

  function runStatus(status: Exclude<BookingRequestStatus, "gebucht">) {
    startTransition(async () => {
      await setRequestStatus(request.id, status);
    });
  }

  function submitReply() {
    setFeedback(null);
    startTransition(async () => {
      const res = await sendThreadReply(request.id, { subject, body });
      if (!res.ok) {
        setFeedback({ type: "err", text: res.error ?? "Senden fehlgeschlagen." });
        return;
      }
      setBody("");
      setFeedback({
        type: "ok",
        text: res.delivered
          ? "Antwort gesendet."
          : "Antwort im Verlauf gespeichert — Zustellung an den Gast erst nach Domain-Verifizierung.",
      });
    });
  }

  function submitLog() {
    setFeedback(null);
    startTransition(async () => {
      const res = await logIncomingMessage(request.id, { fromName: logName, body: logBody });
      if (!res.ok) {
        setFeedback({ type: "err", text: res.error ?? "Speichern fehlgeschlagen." });
        return;
      }
      setLogBody("");
      setShowLog(false);
    });
  }

  const detailRows: [string, string][] = [
    ["E-Mail", request.email],
    ["Telefon", request.phone || "—"],
    ["Zeitraum", `${formatDate(request.checkIn)} – ${formatDate(request.checkOut)}`],
    ["Gäste", request.guests || "—"],
    ["Sprache", LOCALE_LABEL[request.locale] ?? request.locale],
    ["Eingegangen", fmtDateTime(request.createdAt)],
  ];

  return (
    <div className="space-y-5">
      {/* Kopf: Anfrage-Details */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span
          className={`px-2 py-0.5 rounded-[2px] font-sans text-[0.66rem] tracking-[0.06em] uppercase ${STATUS_BADGE_CLASS[request.status]}`}
        >
          {STATUS_LABELS[request.status]}
        </span>
        <a href={`mailto:${request.email}`} className="inline-flex items-center gap-1.5 text-[0.8rem] text-ink-soft hover:text-forest">
          <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
          {request.email}
        </a>
        {request.phone && (
          <a href={`tel:${request.phone}`} className="inline-flex items-center gap-1.5 text-[0.8rem] text-ink-soft hover:text-forest">
            <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
            {request.phone}
          </a>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.82rem] max-[520px]:grid-cols-1">
        {detailRows.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="text-ink-soft min-w-[92px]">{k}</dt>
            <dd className="m-0 text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Verlauf */}
      <div>
        <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft mb-2">Verlauf</h3>
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {sorted.map((m) => {
            const outgoing = m.direction === "outgoing";
            return (
              <div
                key={m.id}
                className={`rounded-[3px] border px-3 py-2 text-[0.83rem] ${
                  outgoing
                    ? "border-forest/25 bg-forest/[0.06] ml-8"
                    : "border-line bg-bg-soft mr-8"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 text-[0.68rem] text-ink-soft">
                  <span className="uppercase tracking-[0.05em]">
                    {outgoing ? m.fromName || "AUSZEIT" : m.fromName || request.name}
                    {m.channel === "note" && " · Notiz"}
                    {m.channel === "form" && " · Formular"}
                    {m.channel === "email" && " · E-Mail"}
                  </span>
                  <span>{fmtDateTime(m.createdAt)}</span>
                </div>
                {m.subject && m.channel === "email" && (
                  <p className="m-0 mb-1 text-[0.78rem] font-semibold text-ink">{m.subject}</p>
                )}
                <p className="m-0 whitespace-pre-wrap text-ink">{m.body}</p>
              </div>
            );
          })}
          {sorted.length === 0 && <p className="text-[0.82rem] text-ink-soft m-0">Noch keine Nachrichten.</p>}
        </div>
      </div>

      {/* Antwort-Composer */}
      <div className="border-t border-line pt-4">
        <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft mb-2">Per E-Mail antworten</h3>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Betreff"
          className="w-full mb-2 px-3 py-2 border border-line rounded-[2px] font-sans text-[0.85rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
        />
        <textarea
          ref={composerRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder={`Hallo ${request.name.split(" ")[0] || ""},`}
          className="w-full px-3 py-2 border border-line rounded-[2px] font-sans text-[0.85rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
        />
        {mailLimited && (
          <p className="text-[0.72rem] text-ink-soft mt-1 mb-0">
            Wird gespeichert; echte Zustellung an <span className="whitespace-nowrap">{request.email}</span> erst
            nach Domain-Verifizierung.
          </p>
        )}
        {feedback && (
          <p className={`text-[0.8rem] mt-2 mb-0 ${feedback.type === "ok" ? "text-[#3c6b34]" : "text-[#a13c2f]"}`}>
            {feedback.text}
          </p>
        )}
        <div className="flex items-center gap-2.5 flex-wrap mt-3">
          <button type="button" onClick={submitReply} disabled={isPending || !body.trim()} className={primaryBtn}>
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" strokeWidth={2} />}
            Antwort senden
          </button>
          <button type="button" onClick={() => setShowLog((v) => !v)} disabled={isPending} className={chipBtn}>
            <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} />
            Nachricht nachtragen
          </button>
        </div>

        {showLog && (
          <div className="mt-3 rounded-[3px] border border-line bg-bg-soft p-3">
            <p className="text-[0.75rem] text-ink-soft mb-2 m-0">
              Eine im normalen Postfach eingegangene Antwort des Gasts hier festhalten.
            </p>
            <input
              type="text"
              value={logName}
              onChange={(e) => setLogName(e.target.value)}
              placeholder="Absender"
              className="w-full mb-2 px-3 py-2 border border-line rounded-[2px] font-sans text-[0.83rem] bg-bg text-ink"
            />
            <textarea
              value={logBody}
              onChange={(e) => setLogBody(e.target.value)}
              rows={3}
              placeholder="Nachrichtentext …"
              className="w-full px-3 py-2 border border-line rounded-[2px] font-sans text-[0.83rem] bg-bg text-ink"
            />
            <button type="button" onClick={submitLog} disabled={isPending || !logBody.trim()} className={`${chipBtn} mt-2`}>
              Nachtragen
            </button>
          </div>
        )}
      </div>

      {/* Status / Buchung */}
      <div className="border-t border-line pt-4 flex items-center gap-2.5 flex-wrap">
        {request.status !== "gebucht" && (
          <button type="button" onClick={onMarkBooked} disabled={isPending} className={primaryBtn}>
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
            Als gebucht markieren
          </button>
        )}
        {request.status !== "in_bearbeitung" && request.status !== "gebucht" && (
          <button type="button" onClick={() => runStatus("in_bearbeitung")} disabled={isPending} className={chipBtn}>
            In Bearbeitung
          </button>
        )}
        {request.status !== "abgelehnt" && request.status !== "archiviert" && (
          <button type="button" onClick={() => runStatus("abgelehnt")} disabled={isPending} className={chipBtn}>
            <XIcon className="w-3.5 h-3.5" strokeWidth={2} />
            Ablehnen
          </button>
        )}
        {request.status !== "archiviert" && (
          <button type="button" onClick={() => runStatus("archiviert")} disabled={isPending} className={chipBtn}>
            <Archive className="w-3.5 h-3.5" strokeWidth={1.5} />
            Archivieren
          </button>
        )}
        {request.status !== "neu" && request.status !== "gebucht" && (
          <button type="button" onClick={() => runStatus("neu")} disabled={isPending} className={chipBtn}>
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            Zurück zu Neu
          </button>
        )}
      </div>
    </div>
  );
}
