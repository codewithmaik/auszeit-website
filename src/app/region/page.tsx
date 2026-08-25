import type { Metadata } from "next";
import {
  Landmark,
  Castle,
  Waves,
  Footprints,
  Wine,
  Building2,
  Bike,
  Sailboat,
  Utensils,
  PartyPopper,
} from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Die Region" };

const SIGHTS = [
  { icon: Landmark, title: "Bernkastel-Kues", text: "Historischer Marktplatz mit Fachwerkhäusern, ca. 10 Min. entfernt." },
  { icon: Castle, title: "Burg Landshut", text: "Ruine oberhalb von Bernkastel mit Panoramablick über das Moseltal." },
  { icon: Waves, title: "Moselschleife bei Bremm", text: "Eine der spektakulärsten Flussschleifen Europas, ca. 30 Min. entfernt." },
  { icon: Footprints, title: "Moseltal-Wanderweg", text: "Ausgeschilderte Wander- und Radwege direkt entlang des Flusses." },
  { icon: Wine, title: "Weinprobe beim Winzer", text: "Zahlreiche Weingüter in Laufnähe bieten geführte Verkostungen an." },
  { icon: Building2, title: "Trier", text: "Deutschlands älteste Stadt mit römischem Erbe, ca. 45 Min. entfernt." },
];

const ACTIVITIES = [
  {
    icon: Footprints,
    title: "Wandern im Moseltal",
    meta: "Ganzjährig · alle Schwierigkeitsgrade",
    text: "Der Moselsteig und zahlreiche Traumpfade führen direkt von der Haustür durch Weinberge, Wälder und vorbei an spektakulären Flussschleifen. Ob gemütlicher Spaziergang oder Tagestour mit Höhenmetern — für jeden Anspruch ist der passende Weg dabei.",
  },
  {
    icon: Bike,
    title: "Radfahren auf dem Moselradweg",
    meta: "Frühling bis Herbst · familienfreundlich",
    text: "Der Moselradweg zählt zu den schönsten Flussradwegen Deutschlands und verläuft nahezu steigungsfrei direkt am Wasser entlang. Fahrräder und E-Bikes lassen sich in der Region unkompliziert leihen — ideal für Ausflüge zu Nachbarorten und Weingütern.",
  },
  {
    icon: Wine,
    title: "Weinproben & Straußwirtschaften",
    meta: "Am schönsten: Spätsommer & Herbst",
    text: "Kleine Familienweingüter öffnen ihre Keller für Verkostungen, während saisonale Straußwirtschaften mit selbstgemachten Speisen und dem Wein des Hauses zum Verweilen einladen — ein Erlebnis, das die Mosel wie kaum ein anderes prägt.",
  },
  {
    icon: Sailboat,
    title: "Bootstouren & Kanufahrten",
    meta: "Mai bis Oktober",
    text: "Ob entspannte Flusskreuzfahrt zwischen den Weinbergen oder aktive Kanutour auf der Mosel — vom Wasser aus zeigt sich die Region von ihrer ruhigsten Seite. Mehrere Anbieter in der Nähe bieten Touren für jede Kondition an.",
  },
  {
    icon: Utensils,
    title: "Kulinarik & Genussmomente",
    meta: "Ganzjährig",
    text: "Von urigen Winzerstuben bis zu ausgezeichneten Restaurants: Die Moselregion verwöhnt mit regionaler Küche, frischem Fisch aus dem Fluss und erstklassigem Riesling. Viele Adressen sind in wenigen Gehminuten erreichbar.",
  },
  {
    icon: PartyPopper,
    title: "Feste & Jahreszeiten-Highlights",
    meta: "Sommer: Weinfeste · Winter: Weihnachtsmärkte",
    text: "Im Sommer verwandeln Winzerfeste die Dörfer entlang der Mosel in fröhliche Feierorte, im Winter laden stimmungsvolle Weihnachtsmärkte in Bernkastel-Kues und Trier zum Verweilen ein. Zu jeder Jahreszeit gibt es einen guten Grund für einen Besuch.",
  },
];

export default function RegionPage() {
  return (
    <>
      <PageHero eyebrow="Die Region" title="Die Mosel — Fluss, Wein und Weite">
        Steile Weinberge, verträumte Winzerdörfer und einer der schönsten Flüsse Deutschlands. Entdecken Sie, was
        die Region zu bieten hat.
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-2 max-[860px]:grid-cols-1 gap-[50px] items-center">
          <Reveal className="relative min-h-[340px] rounded-[2px] overflow-hidden">
            <Photo
              src="/images/weinberge-region.jpg"
              alt="Weinberge an der Mosel"
              fill
              sizes="(max-width: 860px) 100vw, 550px"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow>Wein &amp; Genuss</Eyebrow>
            <h2 className="mt-0">Zuhause bei den Winzern</h2>
            <Divider />
            <p>
              Die Moselregion zählt zu den ältesten Weinanbaugebieten Deutschlands. Steile Schieferhänge prägen die
              Landschaft und schenken den Rieslingen ihre unverwechselbare Mineralität.
            </p>
            <p>
              Besuchen Sie kleine Familienweingüter, verkosten Sie direkt vom Winzer und lassen Sie sich die
              Geschichten hinter jedem Glas erzählen.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Aktivitäten</Eyebrow>
            <h2 className="mt-0">Erleben Sie die Mosel aktiv</h2>
            <Divider center />
            <p>
              Ob aktiv oder entspannt, drinnen oder draußen — die Region rund um Bernkastel-Kues bietet für jeden
              Geschmack die passende Beschäftigung.
            </p>
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6 mt-2.5">
            {ACTIVITIES.map((a, i) => (
              <Reveal
                key={a.title}
                delay={(i % 3) * 80}
                className="border border-line bg-white p-[26px] rounded-[2px] flex flex-col"
              >
                <a.icon className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
                <h3 className="text-[1rem] mb-1">{a.title}</h3>
                <span className="block text-[0.68rem] tracking-[0.08em] uppercase text-ink-soft/70 mb-2.5">
                  {a.meta}
                </span>
                <p className="text-[0.88rem] m-0">{a.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Ausflugsziele</Eyebrow>
            <h2 className="mt-0">Sehenswertes in der Nähe</h2>
            <Divider center />
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6 mt-2.5">
            {SIGHTS.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 80} className="border border-line bg-white p-[26px] rounded-[2px]">
                <s.icon className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
                <h3 className="text-[1rem]">{s.title}</h3>
                <p className="text-[0.88rem] m-0">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Lage</Eyebrow>
            <h2 className="mt-0">Mitten im Moseltal</h2>
            <Divider center />
          </Reveal>
          <Reveal delay={100} className="min-h-[340px] rounded-[2px] overflow-hidden border border-line">
            <iframe
              title="Lage der Ferienwohnung AUSZEIT"
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
