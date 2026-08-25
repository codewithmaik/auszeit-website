import type { Metadata } from "next";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = { title: "Galerie", alternates: { canonical: "/galerie" } };

const PHOTOS = [
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

export default function GaleriePage() {
  return (
    <>
      <PageHero eyebrow="Galerie" title="Ein Blick in die AUSZEIT">
        Eindrücke aus der Ferienwohnung und der Moselregion. Klicken Sie auf ein Foto, um es vergrößert zu
        betrachten.
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <GalleryGrid photos={PHOTOS} />
        </div>
      </section>

      <section className="py-20 bg-bg-soft text-center">
        <div className="max-w-[1180px] mx-auto px-8">
          <Eyebrow>Neugierig geworden?</Eyebrow>
          <h2 className="mt-0">Erleben Sie die AUSZEIT persönlich</h2>
          <Divider center />
          <Button href="/kontakt#buchen">Jetzt anfragen</Button>
        </div>
      </section>
    </>
  );
}
