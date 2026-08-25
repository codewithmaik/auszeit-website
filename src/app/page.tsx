import {
  ShieldCheck,
  CalendarCheck,
  MapPin,
  Wine,
  Check,
  ArrowRight,
  Send,
  CalendarCheck2,
  KeyRound,
} from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import BookingForm from "@/components/BookingForm";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import BrandIcon, { type BrandIconName } from "@/components/BrandIcon";

const FEATURES: { icon: BrandIconName; title: string; text: string }[] = [
  { icon: "trauben", title: "Traumhafte Lage", text: "Direkt an der Mosel – umgeben von Weinbergen & Natur." },
  { icon: "fachwerkhaus", title: "Komfortable Wohnung", text: "Modern, gemütlich und mit allem ausgestattet, was Sie brauchen." },
  { icon: "sonnenuntergang", title: "Erholung pur", text: "Entspannen, abschalten und die schönsten Momente genießen." },
  { icon: "herzen", title: "Persönlicher Service", text: "Wir sind für Sie da – vor, während und nach Ihrem Aufenthalt." },
];

const TRUST = [
  { icon: ShieldCheck, title: "Sichere Buchung", text: "Ihre Daten sind bei uns sicher und geschützt." },
  { icon: CalendarCheck, title: "Flexible An- & Abreise", text: "Nach Absprache sind individuelle An- und Abreisezeiten möglich." },
  { icon: MapPin, title: "Tolle Ausflugsziele", text: "Entdecken Sie die Mosel und ihre schönsten Seiten." },
  { icon: Wine, title: "Wein & Genuss", text: "Erleben Sie die Mosel mit ihren Weinen und kulinarischen Highlights." },
];

const STEPS = [
  {
    icon: Send,
    title: "1. Anfrage senden",
    text: "Wählen Sie Ihren Wunschzeitraum und schicken Sie uns eine unverbindliche Buchungsanfrage.",
  },
  {
    icon: CalendarCheck2,
    title: "2. Bestätigung erhalten",
    text: "Wir prüfen die Verfügbarkeit und melden uns meist innerhalb weniger Stunden persönlich zurück.",
  },
  {
    icon: KeyRound,
    title: "3. Ankommen & genießen",
    text: "Schlüssel abholen, durchatmen und Ihre Auszeit an der Mosel in vollen Zügen genießen.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="grid grid-cols-[minmax(320px,42%)_1fr] max-[900px]:grid-cols-1 items-stretch">
        <div className="flex items-center order-1 max-[900px]:order-2">
          <div className="w-full max-w-[520px] py-16 max-[900px]:py-12 pr-8 pl-[max(2rem,calc((100vw-1180px)/2+2rem))]">
            <h1 className="text-[clamp(2.8rem,5.2vw,4.4rem)] leading-[1.05] mb-7">
              Ihre Auszeit
              <br />
              an der Mosel.
            </h1>
            <p className="text-ink text-[1.1rem]">Gemütlich. Stilvoll. Unvergesslich.</p>
            <p>
              Unsere Ferienwohnung bietet Ihnen Erholung pur – mit traumhaftem Moselblick, moderner Ausstattung
              und viel Liebe zum Detail.
            </p>
            <div className="flex gap-3.5 mt-6 flex-wrap">
              <Button href="/wohnung">Zu den Wohnungen</Button>
              <Button href="/kontakt#buchen" variant="outline">Buchen &amp; Anfragen</Button>
            </div>
          </div>
        </div>
        <div className="relative min-h-[420px] max-[900px]:min-h-[360px] order-2 max-[900px]:order-1">
          <Photo
            src="/images/hero-mosel.jpg"
            alt="Moselblick vom Balkon bei Sonnenuntergang"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 58vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="py-[60px] border-b border-line">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[30px]">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80} className="flex gap-3.5 items-start">
              <BrandIcon name={f.icon} alt="" size={48} />
              <div>
                <h3 className="text-[0.95rem] font-sans uppercase tracking-[0.06em] text-forest mb-1">{f.title}</h3>
                <p className="text-[0.88rem] m-0">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>So einfach geht&apos;s</Eyebrow>
            <h2 className="mt-0">Ihre Auszeit in drei Schritten</h2>
            <hr className="w-[46px] h-px bg-gold border-none my-[18px] mx-auto" />
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-1 gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100} className="text-center px-4">
                <span className="inline-flex w-14 h-14 rounded-full bg-bg-soft border border-line items-center justify-center text-forest mb-4">
                  <s.icon className="w-6 h-6" strokeWidth={1.5} />
                </span>
                <h3 className="text-[1.05rem]">{s.title}</h3>
                <p className="text-[0.92rem]">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-bg-soft" id="buchen">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-3 max-[980px]:grid-cols-1 gap-10 items-start">
          <Reveal>
            <Eyebrow>Buchen Sie Ihre Auszeit</Eyebrow>
            <h2 className="mt-0">Jetzt Urlaub anfragen</h2>
            <hr className="w-[46px] h-px bg-gold border-none my-[18px]" />
            <p>
              Wählen Sie Ihren gewünschten Zeitraum und senden Sie uns eine unverbindliche Anfrage. Wir melden uns
              schnellstmöglich bei Ihnen zurück.
            </p>
            <ul className="list-none m-0 mt-5 p-0">
              {["Unverbindlich & schnell", "Beste Preise direkt bei uns", "Persönliche Beratung", "Sichere & einfache Anfrage"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[0.92rem] text-ink-soft py-1.5">
                    <Check className="w-4 h-4 text-gold flex-none" strokeWidth={2} /> {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <BookingForm />
          </Reveal>

          <Reveal delay={200} className="rounded-[2px] overflow-hidden shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)]">
            <div className="relative aspect-4/3">
              <Photo
                src="/images/wohnzimmer-balkon.jpg"
                alt="Wohnzimmer mit Balkon"
                fill
                sizes="(max-width: 980px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <div className="bg-white p-5">
              <h3 className="text-forest">Ihre Wohlfühloase</h3>
              <p className="text-[0.9rem] m-0">
                Lichtdurchflutete Räume, ein Balkon mit Moselblick und eine Ausstattung zum Ankommen und Wohlfühlen.
              </p>
              <p className="mt-2.5">
                <a
                  href="/wohnung"
                  className="inline-flex items-center gap-1.5 text-gold text-[0.85rem] tracking-[0.05em] uppercase"
                >
                  Mehr erfahren <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-[46px] bg-forest">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[30px]">
          {TRUST.map((t, i) => (
            <Reveal key={t.title} delay={i * 80} className="flex gap-3 items-start text-white">
              <t.icon className="w-5 h-5 text-gold flex-none" strokeWidth={1.5} />
              <div>
                <h3 className="text-white font-sans text-[0.82rem] tracking-[0.08em] uppercase mb-1">{t.title}</h3>
                <p className="text-white/72 text-[0.85rem] m-0">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
