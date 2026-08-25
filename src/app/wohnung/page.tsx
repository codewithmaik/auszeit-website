import type { Metadata } from "next";
import {
  BedDouble,
  ChefHat,
  ShowerHead,
  Sunrise,
  Wifi,
  Car,
  WashingMachine,
  Snowflake,
  PawPrint,
  Ruler,
  Users,
  LogIn,
  LogOut,
  Moon,
} from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Die Wohnung", alternates: { canonical: "/wohnung" } };

const AMENITIES = [
  { icon: BedDouble, title: "2 Schlafzimmer", text: "Ein Doppelbett und ein Zimmer mit zwei Einzelbetten — Platz für bis zu 4 Gäste." },
  { icon: ChefHat, title: "Vollausgestattete Küche", text: "Geschirrspüler, Kaffeemaschine, Backofen und alles fürs Kochen im Urlaub." },
  { icon: ShowerHead, title: "Modernes Bad", text: "Regendusche, Fußbodenheizung und hochwertige Ausstattung." },
  { icon: Sunrise, title: "Balkon mit Moselblick", text: "Sitzgruppe im Freien mit freier Sicht auf Fluss und Weinberge." },
  { icon: Wifi, title: "WLAN & Smart-TV", text: "Schnelles Internet und Streaming-Möglichkeiten inklusive." },
  { icon: Car, title: "Privatparkplatz", text: "Ein kostenloser Stellplatz direkt am Haus." },
  { icon: WashingMachine, title: "Waschmaschine", text: "Für längere Aufenthalte praktisch mit an Bord." },
  { icon: Snowflake, title: "Klimaanlage", text: "Angenehme Temperaturen auch an warmen Sommertagen." },
  { icon: PawPrint, title: "Haustiere auf Anfrage", text: "Ihr Vierbeiner ist nach Absprache herzlich willkommen." },
];

const DETAILS = [
  { icon: Ruler, label: "Wohnfläche", value: "60 m²" },
  { icon: BedDouble, label: "Schlafzimmer", value: "2" },
  { icon: Users, label: "Max. Gäste", value: "4" },
  { icon: LogIn, label: "Check-in", value: "ab 15:00 Uhr" },
  { icon: LogOut, label: "Check-out", value: "bis 11:00 Uhr" },
  { icon: Moon, label: "Mindestaufenthalt", value: "3 Nächte" },
];

export default function WohnungPage() {
  return (
    <>
      <PageHero eyebrow="Die Wohnung" title="Ihre Wohlfühloase über der Mosel">
        60 m², 2 Schlafzimmer, Platz für bis zu 4 Gäste — lichtdurchflutet, modern eingerichtet und mit einem
        Balkon, den Sie nicht mehr verlassen wollen.
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-2 max-[860px]:grid-cols-1 gap-[50px] items-center">
          <Reveal className="relative min-h-[380px] rounded-[2px] overflow-hidden">
            <Photo
              src="/images/wohnbereich.jpg"
              alt="Wohn-/Essbereich"
              fill
              sizes="(max-width: 860px) 100vw, 550px"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow>Ankommen &amp; Wohlfühlen</Eyebrow>
            <h2 className="mt-0">Ein Zuhause auf Zeit</h2>
            <Divider />
            <p>
              Unsere Ferienwohnung verbindet modernen Komfort mit dem gemütlichen Charme der Moselregion. Helle
              Räume, hochwertige Materialien und durchdachte Details sorgen dafür, dass Sie sich vom ersten Moment
              an wie zuhause fühlen.
            </p>
            <p>
              Der Höhepunkt: der private Balkon mit freiem Blick auf die Weinberge und den Fluss — der perfekte
              Platz für Ihren Morgenkaffee oder ein Glas Moselwein am Abend.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Ausstattung</Eyebrow>
            <h2 className="mt-0">Alles, was Sie brauchen</h2>
            <Divider center />
          </Reveal>
          <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6 mt-2.5">
            {AMENITIES.map((a, i) => (
              <Reveal key={a.title} delay={(i % 3) * 80} className="border border-line bg-white p-[26px] rounded-[2px]">
                <a.icon className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
                <h3 className="text-[1rem]">{a.title}</h3>
                <p className="text-[0.88rem] m-0">{a.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-2 max-[860px]:grid-cols-1 gap-[50px] items-center">
          <Reveal>
            <Eyebrow>Details</Eyebrow>
            <h2 className="mt-0">Auf einen Blick</h2>
            <Divider />
            <dl className="grid grid-cols-2 gap-x-5 gap-y-3 mt-6">
              {DETAILS.map((d) => (
                <div key={d.label} className="flex items-start gap-2.5">
                  <d.icon className="w-[18px] h-[18px] text-gold flex-none mt-0.5" strokeWidth={1.5} />
                  <div>
                    <dt className="text-[0.72rem] tracking-[0.1em] uppercase text-gold">{d.label}</dt>
                    <dd className="mt-0.5 ml-0 text-ink-soft">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <Button href="/kontakt#buchen" className="mt-[26px]">Jetzt anfragen</Button>
          </Reveal>
          <Reveal delay={100} className="relative min-h-[340px] rounded-[2px] overflow-hidden">
            <Photo
              src="/images/schlafzimmer-1.jpg"
              alt="Schlafzimmer"
              fill
              sizes="(max-width: 860px) 100vw, 550px"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
