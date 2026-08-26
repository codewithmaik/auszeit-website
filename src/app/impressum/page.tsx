import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { getSiteSettings } from "@/db/queries";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };
export const revalidate = 3600;

export default async function ImpressumPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Impressum" />
      <section className="py-20">
        <div className="max-w-[720px] mx-auto px-8">
          <p className="whitespace-pre-line text-ink-soft leading-relaxed">{settings.impressumContent}</p>
        </div>
      </section>
    </>
  );
}
