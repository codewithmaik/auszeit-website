import type { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Divider from "@/components/Divider";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Gästebewertungen", alternates: { canonical: "/bewertungen" } };

const REVIEWS = [
  {
    text: "Ein wunderschöner Rückzugsort mit traumhaftem Blick auf die Mosel. Die Wohnung war liebevoll eingerichtet und sehr sauber.",
    name: "Platzhalter-Name, Mai 2026",
  },
  {
    text: "Perfekte Lage für Weinliebhaber, herzlicher Kontakt zur Gastgeberin und ein Balkon, den man kaum verlassen möchte.",
    name: "Platzhalter-Name, April 2026",
  },
  {
    text: "Wir kommen definitiv wieder! Ruhige Umgebung, top Ausstattung und tolle Ausflugstipps von den Gastgebern.",
    name: "Platzhalter-Name, März 2026",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-gold mb-3.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-gold" strokeWidth={0} />
      ))}
    </div>
  );
}

export default function BewertungenPage() {
  return (
    <>
      <PageHero eyebrow="Gästebewertungen" title="Was unsere Gäste sagen">
        Diese Bewertungen sind Platzhalter-Beispiele. Ersetzen Sie sie mit echten Rückmeldungen Ihrer Gäste, sobald
        diese vorliegen.
      </PageHero>

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8">
          <Reveal className="flex items-center justify-center gap-3 mb-14 text-center">
            <Stars />
            <span className="text-forest font-serif text-[1.1rem]">5,0</span>
            <span className="text-ink-soft text-[0.9rem]">· {REVIEWS.length} Bewertungen</span>
          </Reveal>

          <div className="grid grid-cols-3 max-[860px]:grid-cols-1 gap-6">
            {REVIEWS.map((r, i) => (
              <Reveal
                key={r.name}
                delay={i * 100}
                className="relative bg-white border border-line p-[26px] rounded-[2px]"
              >
                <Quote className="w-6 h-6 text-gold/40 mb-2" strokeWidth={1.5} />
                <Stars />
                <p className="text-[0.92rem]">&bdquo;{r.text}&ldquo;</p>
                <div className="font-serif text-forest text-[0.95rem]">— {r.name}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-bg-soft text-center">
        <div className="max-w-[1180px] mx-auto px-8">
          <Eyebrow>Selbst erleben</Eyebrow>
          <h2 className="mt-0">Schreiben Sie das nächste Kapitel</h2>
          <Divider center />
          <Button href="/kontakt#buchen">Jetzt anfragen</Button>
        </div>
      </section>
    </>
  );
}
