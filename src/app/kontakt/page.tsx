import type { Metadata } from "next";
import { MapPinned, Phone, Mail, Clock } from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import BookingForm from "@/components/BookingForm";
import Reveal from "@/components/Reveal";
import Faq, { type FaqItem } from "@/components/Faq";

export const metadata: Metadata = { title: "Kontakt" };

const CONTACT_INFO = [
  { icon: MapPinned, label: "Adresse", value: "Moselstraße 12, 54470 Bernkastel-Kues" },
  { icon: Phone, label: "Telefon", value: "+49 (0) 6531 123456" },
  { icon: Mail, label: "E-Mail", value: "info@auszeit-mosel.de" },
  { icon: Clock, label: "Erreichbarkeit", value: "Täglich 9:00 – 20:00 Uhr" },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Sind Haustiere erlaubt?",
    answer: "Ja, nach Absprache sind kleine bis mittelgroße Haustiere herzlich willkommen. Geben Sie uns bei Ihrer Anfrage bitte kurz Bescheid.",
  },
  {
    question: "Gibt es einen Parkplatz?",
    answer: "Ja, direkt am Haus steht Ihnen ein kostenloser Privatparkplatz zur Verfügung.",
  },
  {
    question: "Wie funktioniert der Check-in?",
    answer: "Der Check-in ist ab 15:00 Uhr möglich, der Check-out bis 11:00 Uhr. Individuelle Zeiten sind nach Absprache oft machbar.",
  },
  {
    question: "Gibt es eine Mindestaufenthaltsdauer?",
    answer: "Die Wohnung ist ab einer Mindestaufenthaltsdauer von 3 Nächten buchbar.",
  },
  {
    question: "Ist WLAN vorhanden?",
    answer: "Ja, schnelles WLAN sowie ein Smart-TV mit Streaming-Möglichkeiten sind in der Wohnung inklusive.",
  },
  {
    question: "Wie und wann bezahle ich meinen Aufenthalt?",
    answer: "Nach Bestätigung Ihrer Anfrage erhalten Sie von uns alle Details zu Zahlung und Anreise per E-Mail.",
  },
];

export default function KontaktPage() {
  return (
    <>
      <PageHero eyebrow="Kontakt" title="Wir freuen uns auf Sie">
        Haben Sie Fragen oder möchten Sie direkt anfragen? Schreiben Sie uns — wir melden uns schnellstmöglich
        zurück.
      </PageHero>

      <section className="py-20" id="buchen">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-2 max-[860px]:grid-cols-1 gap-[50px]">
          <Reveal>
            <Eyebrow>Direkt erreichbar</Eyebrow>
            <h2 className="mt-0">Kontaktdaten</h2>
            <Divider />
            <dl className="space-y-5 mt-6">
              {CONTACT_INFO.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <c.icon className="w-5 h-5 text-gold flex-none mt-0.5" strokeWidth={1.5} />
                  <div>
                    <dt className="text-[0.72rem] tracking-[0.1em] uppercase text-gold">{c.label}</dt>
                    <dd className="mt-0.5 ml-0 text-ink-soft">{c.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={100}>
            <BookingForm submitLabel="Anfrage senden" showPhone />
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Häufige Fragen</Eyebrow>
            <h2 className="mt-0">Gut zu wissen</h2>
            <Divider center />
          </Reveal>
          <Reveal delay={100} className="max-w-[760px] mx-auto">
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Anfahrt</Eyebrow>
            <h2 className="mt-0">So finden Sie uns</h2>
            <Divider center />
          </Reveal>
          <Reveal delay={100} className="min-h-[340px] rounded-[2px] overflow-hidden border border-line">
            <iframe
              title="Anfahrt zur Ferienwohnung AUSZEIT"
              src="https://maps.google.com/maps?q=Moselstra%C3%9Fe%2012%2C%2054470%20Bernkastel-Kues&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-[340px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
