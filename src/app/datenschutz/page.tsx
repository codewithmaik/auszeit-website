import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { getSiteSettings } from "@/db/queries";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" } };
export const revalidate = 3600;

export default async function DatenschutzPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Datenschutzerklärung" />
      <section className="py-20">
        <div className="max-w-[720px] mx-auto px-8">
          <p className="whitespace-pre-line text-ink-soft leading-relaxed">{settings.datenschutzContent}</p>
        </div>
      </section>
    </>
  );
}
