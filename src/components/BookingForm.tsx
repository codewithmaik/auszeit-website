"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

type Status = { type: "idle" | "success" | "error"; message: string };

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

const inputClass =
  "w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";
const eyebrowClass = "block font-sans text-[calc(0.72rem+2px)] tracking-[0.22em] uppercase text-gold mb-[0.9em]";
const submitBtnClass =
  "w-full flex justify-center items-center gap-2 px-[30px] py-[14px] bg-forest text-white font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors disabled:opacity-60";

export default function BookingForm({
  dict,
  submitLabel,
  showPhone = false,
  twoStep = false,
}: {
  dict: Dictionary["bookingForm"];
  submitLabel?: string;
  showPhone?: boolean;
  twoStep?: boolean;
}) {
  const submitText = submitLabel ?? dict.submitDefault;
  const formRef = useRef<HTMLFormElement>(null);
  const checkinRef = useRef<HTMLInputElement>(null);
  const checkoutRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [heights, setHeights] = useState<{ front?: number; back?: number }>({});

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

  useLayoutEffect(() => {
    if (!twoStep) return;
    setHeights({
      front: frontRef.current?.scrollHeight,
      back: backRef.current?.scrollHeight,
    });
  }, [twoStep]);

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
      setStatus({ type: "error", message: dict.errorValidation });
      return;
    }

    if (!FORM_ENDPOINT || FORM_ENDPOINT.includes("YOUR_FORM_ID")) {
      const data = Object.fromEntries(new FormData(form).entries());
      const body = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("%0D%0A");
      window.location.href = `mailto:info@auszeit-mosel.de?subject=Buchungsanfrage%20AUSZEIT&body=${body}`;
      setStatus({ type: "success", message: dict.successMailto });
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
        message: dict.successSent,
      });
      form.reset();
      setStep(1);
    } catch {
      setStatus({
        type: "error",
        message: dict.errorSend,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const tripFields = (
    <>
      <div className="grid grid-cols-2 gap-3.5 mb-4">
        <div>
          <label htmlFor="checkin" className={labelClass}>{dict.labelAnreise}</label>
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
          <label htmlFor="checkout" className={labelClass}>{dict.labelAbreise}</label>
          <input type="date" id="checkout" name="abreise" required ref={checkoutRef} className={inputClass} />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="gaeste" className={labelClass}>{dict.labelGaeste}</label>
        <select id="gaeste" name="gaeste" defaultValue={dict.guestOptions[1]} className={inputClass}>
          {dict.guestOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </>
  );

  const contactFields = (
    <>
      <div className="mb-4">
        <label htmlFor="name" className={labelClass}>{dict.labelName}</label>
        <input type="text" id="name" name="name" required className={inputClass} />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className={labelClass}>{dict.labelEmail}</label>
        <input type="email" id="email" name="email" required className={inputClass} />
      </div>
      {showPhone && (
        <div className="mb-4">
          <label htmlFor="telefon" className={labelClass}>{dict.labelTelefon}</label>
          <input type="tel" id="telefon" name="telefon" className={inputClass} />
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="nachricht" className={labelClass}>{dict.labelNachricht}</label>
        <textarea id="nachricht" name="nachricht" rows={3} className={inputClass} />
      </div>
    </>
  );

  const statusMessage = status.type !== "idle" && (
    <div
      role="status"
      className={`text-[0.85rem] mt-3 ${status.type === "success" ? "text-[#3c6b34]" : "text-[#a13c2f]"}`}
    >
      {status.message}
    </div>
  );

  if (!twoStep) {
    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white border border-line rounded-[2px] p-[30px] shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)]"
      >
        <span className={eyebrowClass}>{dict.eyebrow}</span>
        {contactFields}
        {tripFields}
        <button type="submit" disabled={submitting} className={`${submitBtnClass} mt-1.5`}>
          {submitting ? dict.submitting : submitText}
        </button>
        <p className="text-[0.78rem] text-ink-soft mt-3">
          {dict.consentNote}
        </p>
        {statusMessage}
      </form>
    );
  }

  const currentHeight = step === 1 ? heights.front : heights.back;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white border border-line rounded-[2px] shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)] p-[30px]"
    >
      <div className="[perspective:1600px]">
        <div
          className="relative transition-[height,transform] duration-500 ease-in-out motion-reduce:transition-none [transform-style:preserve-3d]"
          style={{
            transform: `rotateY(${step === 2 ? 180 : 0}deg)`,
            height: currentHeight ? `${currentHeight}px` : undefined,
            minHeight: currentHeight ? undefined : 360,
          }}
        >
          <div
            ref={frontRef}
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ WebkitBackfaceVisibility: "hidden" }}
            aria-hidden={step !== 1}
            inert={step !== 1 ? true : undefined}
          >
            <span className={eyebrowClass}>{dict.eyebrow}</span>
            {tripFields}
            <p className="text-[0.78rem] text-ink-soft mb-4">
              {dict.stepNote}
            </p>
            <button type="button" onClick={() => setStep(2)} className={submitBtnClass}>
              {dict.weiter}
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div
            ref={backRef}
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ WebkitBackfaceVisibility: "hidden" }}
            aria-hidden={step !== 2}
            inert={step !== 2 ? true : undefined}
          >
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-ink-soft text-[0.75rem] tracking-[0.05em] uppercase mb-4 hover:text-forest transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
              {dict.zurueck}
            </button>
            {contactFields}
            <button type="submit" disabled={submitting} className={submitBtnClass}>
              {submitting ? dict.submitting : submitText}
            </button>
            <p className="text-[0.78rem] text-ink-soft mt-3">
              {dict.consentNote}
            </p>
            {statusMessage}
          </div>
        </div>
      </div>
    </form>
  );
}
