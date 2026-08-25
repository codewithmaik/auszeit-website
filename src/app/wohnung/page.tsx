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
} from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import WohnungenSlider, { type WohnungUnit } from "@/components/WohnungenSlider";

export const metadata: Metadata = { title: "Die Wohnungen", alternates: { canonical: "/wohnung" } };

const UNITS: WohnungUnit[] = [
  {
    slug: "rieslinghaus",
    name: "Rieslinghaus",
    image: "/images/wohnbereich.jpg",
    size: "60 m²",
    guests: "4 Gäste",
    bedrooms: "2 Schlafzimmer",
    text: "Unsere Flaggschiff-Wohnung mit privatem Balkon und freiem Blick auf Weinberge und Fluss — lichtdurchflutet, modern eingerichtet und mit viel Liebe zum Detail.",
  },
  {
    slug: "weinberg-loft",
    name: "Weinberg-Loft",
    image: "/images/wohnung-loft.jpg",
    size: "45 m²",
    guests: "2 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Ein puristisches Loft für alle, die es modern mögen — offener Wohnbereich, klare Linien und ruhige Farben. Perfekt für Paare, die einfach mal abschalten wollen.",
  },
  {
    slug: "flussblick",
    name: "Flussblick",
    image: "/images/wohnung-flussblick.jpg",
    size: "55 m²",
    guests: "3 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Helle, freundliche Räume mit skandinavischem Einrichtungsstil. Große Fenster lassen den Tag lange in die Wohnung — ideal für einen entspannten Kurzurlaub.",
  },
  {
    slug: "winzerstube",
    name: "Winzerstube",
    image: "/images/wohnung-winzerstube.jpg",
    size: "50 m²",
    guests: "3 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Warme Farben und gemütliche Details erinnern an eine klassische Winzerstube — hier lässt es sich nach einem Tag in den Weinbergen wunderbar zur Ruhe kommen.",
  },
  {
    slug: "sonnenterrasse",
    name: "Sonnenterrasse",
    image: "/images/wohnung-sonnenterrasse.jpg",
    size: "65 m²",
    guests: "4 Gäste",
    bedrooms: "2 Schlafzimmer",
    text: "Lichtdurchflutet und großzügig geschnitten, mit einer besonders großen Terrasse — der perfekte Ort für gemeinsame Frühstücke und laue Sommerabende.",
  },
  {
    slug: "turmzimmer",
    name: "Turmzimmer",
    image: "/images/wohnung-turmzimmer.jpg",
    size: "70 m²",
    guests: "5 Gäste",
    bedrooms: "3 Schlafzimmer",
    text: "Unsere außergewöhnlichste Wohnung über zwei Ebenen mit offener Treppe — viel Platz für Familien oder kleine Gruppen, die zusammen die Mosel entdecken möchten.",
  },
  {
    slug: "fachwerk-idylle",
    name: "Fachwerk-Idylle",
    image: "/images/wohnung-fachwerk-idylle.jpg",
    size: "48 m²",
    guests: "2 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Historischer Charme trifft modernen Komfort: sichtbare Holzbalken und warme Materialien machen diese Wohnung zu einem besonders stimmungsvollen Rückzugsort.",
  },
];

const AMENITIES = [
  { icon: BedDouble, title: "Komfortable Betten", text: "Hochwertige Matratzen und Bettwäsche in allen Wohnungen." },
  { icon: ChefHat, title: "Vollausgestattete Küche", text: "Geschirrspüler, Kaffeemaschine, Backofen und alles fürs Kochen im Urlaub." },
  { icon: ShowerHead, title: "Modernes Bad", text: "Regendusche, Fußbodenheizung und hochwertige Ausstattung." },
  { icon: Sunrise, title: "Balkon oder Terrasse", text: "Ein eigener Außenbereich mit Sicht auf Fluss und Weinberge." },
  { icon: Wifi, title: "WLAN & Smart-TV", text: "Schnelles Internet und Streaming-Möglichkeiten inklusive." },
  { icon: Car, title: "Privatparkplatz", text: "Kostenlose Stellplätze direkt am Haus." },
  { icon: WashingMachine, title: "Waschmaschine", text: "Für längere Aufenthalte praktisch mit an Bord." },
  { icon: Snowflake, title: "Klimaanlage", text: "Angenehme Temperaturen auch an warmen Sommertagen." },
  { icon: PawPrint, title: "Haustiere auf Anfrage", text: "Ihr Vierbeiner ist nach Absprache herzlich willkommen." },
];

export default function WohnungPage() {
  return (
    <>
      <PageHero eyebrow="Die Wohnungen" title="7 Wohnungen, ein Zuhause an der Mosel">
        Von der lichtdurchfluteten Sonnenterrasse bis zum außergewöhnlichen Turmzimmer — jede unserer sieben
        Wohnungen hat ihren eigenen Charakter. Blättern Sie durch und finden Sie Ihre Auszeit.
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <WohnungenSlider units={UNITS} />
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Ausstattung</Eyebrow>
            <h2 className="mt-0">Das bieten alle unsere Wohnungen</h2>
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

      <section className="py-20 text-center">
        <div className="max-w-[1180px] mx-auto px-8">
          <Eyebrow>Noch unentschlossen?</Eyebrow>
          <h2 className="mt-0">Wir beraten Sie gern bei der Wahl</h2>
          <Divider center />
          <Button href="/kontakt#buchen">Jetzt anfragen</Button>
        </div>
      </section>
    </>
  );
}
