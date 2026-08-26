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
import WohnungenSlider from "@/components/WohnungenSlider";
import GalleryGrid from "@/components/GalleryGrid";
import { getApartments } from "@/db/queries";

export const metadata: Metadata = { title: "Die Wohnungen", alternates: { canonical: "/wohnung" } };
export const dynamic = "force-dynamic";

const GALLERY_PHOTOS = [
  { src: "/images/wohnbereich.jpg", alt: "Wohnzimmer", tall: true },
  { src: "/images/hero-mosel.jpg", alt: "Balkon & Moselblick" },
  { src: "/images/kueche.jpg", alt: "Küche" },
  { src: "/images/schlafzimmer-1.jpg", alt: "Schlafzimmer 1" },
  { src: "/images/schlafzimmer-2.jpg", alt: "Schlafzimmer 2" },
  { src: "/images/badezimmer.jpg", alt: "Badezimmer", tall: true },
  { src: "/images/aussenansicht.jpg", alt: "Außenansicht" },
  { src: "/images/weinberge-sonnenuntergang.jpg", alt: "Weinberge bei Sonnenuntergang" },
  { src: "/images/dorfblick.jpg", alt: "Dorfblick" },
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

export default async function WohnungPage() {
  const apartments = await getApartments();
  const units = apartments.map((a) => ({
    slug: a.slug,
    name: a.name,
    images: a.images.map((img) => ({ url: img.url, alt: img.alt || a.name })),
    size: a.sizeSqm,
    guests: a.guests,
    bedrooms: a.bedrooms,
    text: a.description,
  }));

  return (
    <>
      <PageHero eyebrow="Die Wohnungen" title="7 Wohnungen, ein Zuhause an der Mosel">
        Von der lichtdurchfluteten Sonnenterrasse bis zum außergewöhnlichen Turmzimmer — jede unserer sieben
        Wohnungen hat ihren eigenen Charakter. Blättern Sie durch und finden Sie Ihre Auszeit.
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          {units.length > 0 ? (
            <WohnungenSlider units={units} />
          ) : (
            <div className="text-center max-w-[480px] mx-auto py-10">
              <Eyebrow>Einen Moment</Eyebrow>
              <h2 className="mt-0">Unsere Wohnungen werden gerade aktualisiert</h2>
              <Divider center />
              <p>
                Bitte schauen Sie in Kürze wieder vorbei, oder kontaktieren Sie uns direkt — wir beraten Sie gern
                persönlich zu unseren Wohnungen.
              </p>
              <Button href="/kontakt#buchen">Jetzt anfragen</Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-bg-soft">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="max-w-[640px] mx-auto mb-[46px] text-center">
            <Eyebrow>Galerie</Eyebrow>
            <h2 className="mt-0">Ein Blick in unsere Wohnungen</h2>
            <Divider center />
            <p>
              Eindrücke aus der Ferienwohnung und der Moselregion. Klicken Sie auf ein Foto, um es vergrößert zu
              betrachten.
            </p>
          </Reveal>
          <GalleryGrid photos={GALLERY_PHOTOS} />
        </div>
      </section>

      <section className="py-20">
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

      <section className="py-20 bg-bg-soft text-center">
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
