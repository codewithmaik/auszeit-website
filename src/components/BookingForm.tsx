"use client";

import { useEffect, useRef, useState } from "react";

const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

type Status = { type: "idle" | "success" | "error"; message: string };

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function BookingForm({
  submitLabel = "Verfügbarkeit anzeigen",
  showPhone = false,
}: {
  submitLabel?: string;
  showPhone?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const checkinRef = useRef<HTMLInputElement>(null);
  const checkoutRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  // Uncontrolled date inputs: "today" is only known on the client, so the
  // defaults are written directly to the DOM here instead of via state to
  // avoid a server/client hydration mismatch.
  useEffect(() => {
    const checkinEl = checkinRef.current;
    const checkoutEl = checkoutRef.current;
    if (!checkinEl || !checkoutEl) return;
    const today = new Date();
    const inDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const outDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
    checkinEl.min = fmt(today);
    checkoutEl.min = fmt(today);
    checkinEl.value = fmt(inDate);
    checkoutEl.value = fmt(outDate);
  }, []);

  function handleCheckinChange(value: string) {
    const checkoutEl = checkoutRef.current;
    if (!checkoutEl) return;
    const minOut = new Date(value);
    minOut.setDate(minOut.getDate() + 1);
    const minOutStr = fmt(minOut);
    checkoutEl.min = minOutStr;
    if (new Date(checkoutEl.value) <= new Date(value)) {
      checkoutEl.value = minOutStr;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !emailOk) {
      setStatus({ type: "error", message: "Bitte Name und eine gültige E-Mail-Adresse angeben." });
      return;
    }

    if (!FORM_ENDPOINT || FORM_ENDPOINT.includes("YOUR_FORM_ID")) {
      const data = Object.fromEntries(new FormData(form).entries());
      const body = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("%0D%0A");
      window.location.href = `mailto:info@auszeit-mosel.de?subject=Buchungsanfrage%20AUSZEIT&body=${body}`;
      setStatus({ type: "success", message: "Ihr E-Mail-Programm öffnet sich mit der ausgefüllten Anfrage." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus({
        type: "success",
        message: "Vielen Dank! Ihre Anfrage wurde versendet — wir melden uns schnellstmöglich.",
      });
      form.reset();
    } catch {
      setStatus({
        type: "error",
        message: "Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt eine E-Mail.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
  const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white border border-line rounded-[2px] p-[30px] shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)]">
      <span className="block font-sans text-[0.72rem] tracking-[0.22em] uppercase text-gold mb-[0.9em]">
        Verfügbarkeit prüfen
      </span>

      <div className="mb-4">
        <label htmlFor="name" className={labelClass}>Name</label>
        <input type="text" id="name" name="name" required className={inputClass} />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className={labelClass}>E-Mail</label>
        <input type="email" id="email" name="email" required className={inputClass} />
      </div>

      {showPhone && (
        <div className="mb-4">
          <label htmlFor="telefon" className={labelClass}>Telefon (optional)</label>
          <input type="tel" id="telefon" name="telefon" className={inputClass} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 mb-4">
        <div>
          <label htmlFor="checkin" className={labelClass}>Anreise</label>
          <input
            type="date"
            id="checkin"
            name="anreise"
            required
            ref={checkinRef}
            onChange={(e) => handleCheckinChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="checkout" className={labelClass}>Abreise</label>
          <input
            type="date"
            id="checkout"
            name="abreise"
            required
            ref={checkoutRef}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="gaeste" className={labelClass}>Gäste</label>
        <select id="gaeste" name="gaeste" defaultValue="2 Erwachsene" className={inputClass}>
          <option>1 Erwachsener</option>
          <option>2 Erwachsene</option>
          <option>2 Erwachsene, 1 Kind</option>
          <option>2 Erwachsene, 2 Kinder</option>
          <option>Andere (bitte in Nachricht angeben)</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="nachricht" className={labelClass}>Nachricht (optional)</label>
        <textarea id="nachricht" name="nachricht" rows={3} className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex justify-center items-center gap-2 px-[30px] py-[14px] mt-1.5 bg-forest text-white font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "Wird gesendet …" : submitLabel}
      </button>
      <p className="text-[0.78rem] text-ink-soft mt-3">
        Mit dem Absenden stimmen Sie zu, dass wir Sie zu Ihrer Anfrage kontaktieren.
      </p>
      {status.type !== "idle" && (
        <div
          role="status"
          className={`text-[0.85rem] mt-3 ${status.type === "success" ? "text-[#3c6b34]" : "text-[#a13c2f]"}`}
        >
          {status.message}
        </div>
      )}
    </form>
  );
}
