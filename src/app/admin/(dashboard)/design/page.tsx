import Image from "next/image";
import { Upload, RotateCcw } from "lucide-react";
import { getSiteSettings } from "@/db/queries";
import { getDictionary } from "@/dictionaries";
import {
  uploadLogoImage,
  resetLogoImage,
  uploadLogoTextImage,
  resetLogoTextImage,
  uploadHomeHeroImage,
  resetHomeHeroImage,
  uploadHomeWohlfuehlImage,
  resetHomeWohlfuehlImage,
  saveThemeColors,
  resetThemeColors,
  saveHomeContent,
  resetHomeContent,
} from "./actions";

export const metadata = { title: "Design" };
export const dynamic = "force-dynamic";

const inputClass =
  "w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";
const cardClass = "bg-white border border-line rounded-[2px] p-6 mb-8";
const saveButtonClass =
  "inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors";
const resetButtonClass =
  "inline-flex items-center gap-1.5 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors";
const uploadInputClass =
  "text-[0.85rem] file:mr-3 file:px-4 file:py-2 file:border-0 file:rounded-[2px] file:bg-bg-soft file:text-ink file:text-[0.78rem] file:uppercase file:tracking-[0.05em] file:cursor-pointer";

const DEFAULT_COLORS = {
  themePrimary: "#3c4632",
  themePrimaryDark: "#2c3423",
  themeAccent: "#c99a3f",
  themeBackground: "#faf8f3",
};

function ImageSlot({
  heading,
  hint,
  currentSrc,
  isDefault,
  uploadAction,
  resetAction,
  frameClassName,
  imageClassName,
}: {
  heading: string;
  hint: string;
  currentSrc: string;
  isDefault: boolean;
  uploadAction: (formData: FormData) => Promise<void>;
  resetAction: () => Promise<void>;
  frameClassName: string;
  imageClassName: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-[0.95rem] mb-1">{heading}</h3>
      <p className="text-[0.8rem] text-ink-soft mb-3">{hint}</p>
      <div className="flex items-start gap-4 flex-wrap">
        <div className={`relative bg-bg-soft border border-line rounded-[2px] overflow-hidden flex-none ${frameClassName}`}>
          <Image src={currentSrc} alt="" fill sizes="220px" className={imageClassName} />
        </div>
        <div className="flex flex-col gap-2 min-w-[220px]">
          <form action={uploadAction} className="flex items-center gap-3 flex-wrap">
            <input type="file" name="file" accept="image/*" required className={uploadInputClass} />
            <button type="submit" className={saveButtonClass}>
              <Upload className="w-3.5 h-3.5" strokeWidth={2} />
              Hochladen
            </button>
          </form>
          {!isDefault && (
            <form action={resetAction}>
              <button type="submit" className={resetButtonClass}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Auf Standardbild zurücksetzen
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  deName,
  enName,
  deDefault,
  enDefault,
  textarea = false,
}: {
  label: string;
  deName: string;
  enName: string;
  deDefault: string;
  enDefault: string;
  textarea?: boolean;
}) {
  return (
    <div className="mb-4">
      <span className={labelClass}>{label}</span>
      <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-3">
        <div>
          <span className="block text-[0.65rem] text-ink-soft mb-1">Deutsch</span>
          {textarea ? (
            <textarea name={deName} defaultValue={deDefault} rows={2} className={inputClass} />
          ) : (
            <input type="text" name={deName} defaultValue={deDefault} className={inputClass} />
          )}
        </div>
        <div>
          <span className="block text-[0.65rem] text-ink-soft mb-1">Englisch</span>
          {textarea ? (
            <textarea name={enName} defaultValue={enDefault} rows={2} className={inputClass} />
          ) : (
            <input type="text" name={enName} defaultValue={enDefault} className={inputClass} />
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AdminDesignPage() {
  const settings = await getSiteSettings();
  const deDict = getDictionary("de");
  const enDict = getDictionary("en");
  const deHome = settings.homeContentDe ?? deDict.home;
  const enHome = settings.homeContentEn ?? enDict.home;
  const hasHomeOverride = Boolean(settings.homeContentDe || settings.homeContentEn);
  const hasThemeOverride = Boolean(
    settings.themePrimary || settings.themePrimaryDark || settings.themeAccent || settings.themeBackground,
  );

  return (
    <div className="max-w-[820px]">
      <h1 className="text-[1.8rem] mb-2">Design</h1>
      <p className="text-ink-soft mb-8">
        Farbpalette, Logo, Startseiten-Bilder und -Texte. Alle Bilder werden automatisch in ihren jeweiligen Rahmen
        eingepasst — es muss nichts vorab zugeschnitten werden.
      </p>

      {/* Branding */}
      <div className={cardClass}>
        <h2 className="text-[1.15rem] mb-4">Branding (Navbar)</h2>
        <ImageSlot
          heading="Logo"
          hint="Rundes Logo links in der Navigationsleiste. Quadratische Bilder passen am besten."
          currentSrc={settings.logoImageUrl || "/images/logo.png"}
          isDefault={!settings.logoImageUrl}
          uploadAction={uploadLogoImage}
          resetAction={resetLogoImage}
          frameClassName="w-[72px] h-[72px] rounded-full"
          imageClassName="object-cover"
        />
        <ImageSlot
          heading="Logo-Schriftzug"
          hint={
            'Ersetzt den Text "AUSZEIT" samt Zeile darunter durch ein eigenes Bild (z. B. eine Wortmarke). Ohne ' +
            "Upload bleibt der Standardtext sichtbar."
          }
          currentSrc={settings.logoTextImageUrl || "/images/logo.png"}
          isDefault={!settings.logoTextImageUrl}
          uploadAction={uploadLogoTextImage}
          resetAction={resetLogoTextImage}
          frameClassName="w-[220px] h-[68px]"
          imageClassName={settings.logoTextImageUrl ? "object-contain" : "object-cover opacity-30"}
        />
      </div>

      {/* Farbpalette */}
      <div className={cardClass}>
        <h2 className="text-[1.15rem] mb-1">Farbpalette</h2>
        <p className="text-[0.85rem] text-ink-soft mb-4">
          Diese vier Farben steuern das Erscheinungsbild der <strong>gesamten Website</strong> (nicht nur der
          Startseite) — Überschriften, Buttons, Hintergrund. Für guten Kontrast empfiehlt sich eine dunkle
          Primärfarbe und ein heller Hintergrund.
        </p>
        <form action={saveThemeColors}>
          <div className="grid grid-cols-4 max-[640px]:grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="themePrimary" className={labelClass}>Primärfarbe</label>
              <input
                type="color"
                id="themePrimary"
                name="themePrimary"
                defaultValue={settings.themePrimary ?? DEFAULT_COLORS.themePrimary}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="themePrimaryDark" className={labelClass}>Primär (dunkel/Hover)</label>
              <input
                type="color"
                id="themePrimaryDark"
                name="themePrimaryDark"
                defaultValue={settings.themePrimaryDark ?? DEFAULT_COLORS.themePrimaryDark}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="themeAccent" className={labelClass}>Akzentfarbe</label>
              <input
                type="color"
                id="themeAccent"
                name="themeAccent"
                defaultValue={settings.themeAccent ?? DEFAULT_COLORS.themeAccent}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="themeBackground" className={labelClass}>Hintergrund</label>
              <input
                type="color"
                id="themeBackground"
                name="themeBackground"
                defaultValue={settings.themeBackground ?? DEFAULT_COLORS.themeBackground}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button type="submit" className={saveButtonClass}>Farben speichern</button>
            {hasThemeOverride && (
              <button type="submit" formAction={resetThemeColors} className={resetButtonClass}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Auf Standardfarben zurücksetzen
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Startseiten-Bilder */}
      <div className={cardClass}>
        <h2 className="text-[1.15rem] mb-4">Startseiten-Bilder</h2>
        <ImageSlot
          heading="Hero-Bild"
          hint="Großes Titelbild ganz oben auf der Startseite. Breitformat-Fotos wirken am besten."
          currentSrc={settings.homeHeroImageUrl || "/images/hero-mosel.jpg"}
          isDefault={!settings.homeHeroImageUrl}
          uploadAction={uploadHomeHeroImage}
          resetAction={resetHomeHeroImage}
          frameClassName="w-[220px] h-[124px]"
          imageClassName="object-cover"
        />
        <ImageSlot
          heading='Bild "Wohlfühloase"'
          hint="Bild in der Karte neben dem Buchungsformular."
          currentSrc={settings.homeWohlfuehlImageUrl || "/images/wohnzimmer-balkon.jpg"}
          isDefault={!settings.homeWohlfuehlImageUrl}
          uploadAction={uploadHomeWohlfuehlImage}
          resetAction={resetHomeWohlfuehlImage}
          frameClassName="w-[220px] h-[165px]"
          imageClassName="object-cover"
        />
      </div>

      {/* Startseiten-Texte */}
      <div className={cardClass}>
        <h2 className="text-[1.15rem] mb-1">Startseiten-Texte</h2>
        <p className="text-[0.85rem] text-ink-soft mb-5">Jeweils Deutsch und Englisch pflegen.</p>
        <form action={saveHomeContent}>
          <h3 className="text-[1rem] mb-3 text-forest">Hero</h3>
          <TextField label="Titel Zeile 1" deName="de.hero.title1" enName="en.hero.title1" deDefault={deHome.hero.title1} enDefault={enHome.hero.title1} />
          <TextField label="Titel Zeile 2" deName="de.hero.title2" enName="en.hero.title2" deDefault={deHome.hero.title2} enDefault={enHome.hero.title2} />
          <TextField label="Lead-Text 1" deName="de.hero.lead1" enName="en.hero.lead1" deDefault={deHome.hero.lead1} enDefault={enHome.hero.lead1} />
          <TextField label="Lead-Text 2" deName="de.hero.lead2" enName="en.hero.lead2" deDefault={deHome.hero.lead2} enDefault={enHome.hero.lead2} textarea />
          <TextField label='Button "Zu den Wohnungen"' deName="de.hero.ctaWohnungen" enName="en.hero.ctaWohnungen" deDefault={deHome.hero.ctaWohnungen} enDefault={enHome.hero.ctaWohnungen} />
          <TextField label='Button "Buchen & Anfragen"' deName="de.hero.ctaBuchen" enName="en.hero.ctaBuchen" deDefault={deHome.hero.ctaBuchen} enDefault={enHome.hero.ctaBuchen} />

          <h3 className="text-[1rem] mt-7 mb-3 text-forest">Feature-Kacheln</h3>
          {deHome.features.map((f, i) => (
            <div key={f.key} className="mb-5 pb-5 border-b border-line last:border-b-0 last:pb-0 last:mb-0">
              <TextField
                label={`Kachel ${i + 1} – Titel`}
                deName={`de.features.${i}.title`}
                enName={`en.features.${i}.title`}
                deDefault={f.title}
                enDefault={enHome.features[i].title}
              />
              <TextField
                label={`Kachel ${i + 1} – Text`}
                deName={`de.features.${i}.text`}
                enName={`en.features.${i}.text`}
                deDefault={f.text}
                enDefault={enHome.features[i].text}
                textarea
              />
            </div>
          ))}

          <h3 className="text-[1rem] mt-7 mb-3 text-forest">&bdquo;So einfach geht&apos;s&ldquo;-Schritte</h3>
          <TextField label="Eyebrow" deName="de.stepsEyebrow" enName="en.stepsEyebrow" deDefault={deHome.stepsEyebrow} enDefault={enHome.stepsEyebrow} />
          <TextField label="Überschrift" deName="de.stepsTitle" enName="en.stepsTitle" deDefault={deHome.stepsTitle} enDefault={enHome.stepsTitle} />
          {deHome.steps.map((s, i) => (
            <div key={i} className="mb-5 pb-5 border-b border-line last:border-b-0 last:pb-0 last:mb-0">
              <TextField
                label={`Schritt ${i + 1} – Titel`}
                deName={`de.steps.${i}.title`}
                enName={`en.steps.${i}.title`}
                deDefault={s.title}
                enDefault={enHome.steps[i].title}
              />
              <TextField
                label={`Schritt ${i + 1} – Text`}
                deName={`de.steps.${i}.text`}
                enName={`en.steps.${i}.text`}
                deDefault={s.text}
                enDefault={enHome.steps[i].text}
                textarea
              />
            </div>
          ))}

          <h3 className="text-[1rem] mt-7 mb-3 text-forest">Buchen-Block</h3>
          <TextField label="Eyebrow" deName="de.bookEyebrow" enName="en.bookEyebrow" deDefault={deHome.bookEyebrow} enDefault={enHome.bookEyebrow} />
          <TextField label="Überschrift" deName="de.bookTitle" enName="en.bookTitle" deDefault={deHome.bookTitle} enDefault={enHome.bookTitle} />
          <TextField label="Text" deName="de.bookText" enName="en.bookText" deDefault={deHome.bookText} enDefault={enHome.bookText} textarea />
          <TextField
            label="Stichpunkte (eine Zeile je Stichpunkt)"
            deName="de.bookBullets"
            enName="en.bookBullets"
            deDefault={deHome.bookBullets.join("\n")}
            enDefault={enHome.bookBullets.join("\n")}
            textarea
          />

          <h3 className="text-[1rem] mt-7 mb-3 text-forest">Karte &bdquo;Wohlfühloase&ldquo;</h3>
          <TextField label="Titel" deName="de.wohlfuehl.title" enName="en.wohlfuehl.title" deDefault={deHome.wohlfuehl.title} enDefault={enHome.wohlfuehl.title} />
          <TextField label="Text" deName="de.wohlfuehl.text" enName="en.wohlfuehl.text" deDefault={deHome.wohlfuehl.text} enDefault={enHome.wohlfuehl.text} textarea />
          <TextField label="Link-Text" deName="de.wohlfuehl.more" enName="en.wohlfuehl.more" deDefault={deHome.wohlfuehl.more} enDefault={enHome.wohlfuehl.more} />

          <h3 className="text-[1rem] mt-7 mb-3 text-forest">Vertrauensleiste</h3>
          {deHome.trust.map((tItem, i) => (
            <div key={i} className="mb-5 pb-5 border-b border-line last:border-b-0 last:pb-0 last:mb-0">
              <TextField
                label={`Punkt ${i + 1} – Titel`}
                deName={`de.trust.${i}.title`}
                enName={`en.trust.${i}.title`}
                deDefault={tItem.title}
                enDefault={enHome.trust[i].title}
              />
              <TextField
                label={`Punkt ${i + 1} – Text`}
                deName={`de.trust.${i}.text`}
                enName={`en.trust.${i}.text`}
                deDefault={tItem.text}
                enDefault={enHome.trust[i].text}
                textarea
              />
            </div>
          ))}

          <div className="flex items-center gap-3 flex-wrap mt-2">
            <button type="submit" className={saveButtonClass}>Texte speichern</button>
            {hasHomeOverride && (
              <button type="submit" formAction={resetHomeContent} className={resetButtonClass}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Auf Standardtexte zurücksetzen
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
