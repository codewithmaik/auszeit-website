import Image from "next/image";
import { Upload, RotateCcw } from "lucide-react";
import { getSiteSettings } from "@/db/queries";
import { getDictionary } from "@/dictionaries";
import HomePreviewEditor from "@/components/admin/home-editor/HomePreviewEditor";
import { DEFAULT_COLORS } from "@/components/admin/home-editor/palettes";
import { uploadLogoImage, resetLogoImage, uploadLogoTextImage, resetLogoTextImage } from "./actions";

export const metadata = { title: "Design" };
export const dynamic = "force-dynamic";

const saveButtonClass =
  "inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors";
const resetButtonClass =
  "inline-flex items-center gap-1.5 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors";
const uploadInputClass =
  "text-[0.85rem] file:mr-3 file:px-4 file:py-2 file:border-0 file:rounded-[2px] file:bg-bg-soft file:text-ink file:text-[0.78rem] file:uppercase file:tracking-[0.05em] file:cursor-pointer";

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
    <div className="mb-6 last:mb-0">
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

export default async function AdminDesignPage() {
  const settings = await getSiteSettings();
  const deDict = getDictionary("de");
  const enDict = getDictionary("en");
  const hasHomeOverride = Boolean(settings.homeContentDe || settings.homeContentEn);
  const hasThemeOverride = Boolean(
    settings.themePrimary || settings.themePrimaryDark || settings.themeAccent || settings.themeBackground,
  );
  const defaultHeroImage = "/images/hero-mosel.jpg";
  const defaultWohlfuehlImage = "/images/wohnzimmer-balkon.jpg";

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-[1.8rem] mb-2">Design</h1>
      <p className="text-ink-soft mb-8">
        Farbpalette, Logo und die komplette Startseite — direkt in der Vorschau anklicken und bearbeiten.
      </p>

      {/* Branding */}
      <div className="bg-white border border-line rounded-[2px] p-6 mb-8">
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

      <HomePreviewEditor
        initialContentDe={settings.homeContentDe ?? deDict.home}
        initialContentEn={settings.homeContentEn ?? enDict.home}
        defaultContentDe={deDict.home}
        defaultContentEn={enDict.home}
        hasHomeOverride={hasHomeOverride}
        initialStyles={settings.homeTextStyles ?? {}}
        initialHeroImage={settings.homeHeroImageUrl || defaultHeroImage}
        defaultHeroImage={defaultHeroImage}
        isHeroDefault={!settings.homeHeroImageUrl}
        initialWohlfuehlImage={settings.homeWohlfuehlImageUrl || defaultWohlfuehlImage}
        defaultWohlfuehlImage={defaultWohlfuehlImage}
        isWohlfuehlDefault={!settings.homeWohlfuehlImageUrl}
        initialColors={{
          primary: settings.themePrimary ?? DEFAULT_COLORS.primary,
          primaryDark: settings.themePrimaryDark ?? DEFAULT_COLORS.primaryDark,
          accent: settings.themeAccent ?? DEFAULT_COLORS.accent,
          background: settings.themeBackground ?? DEFAULT_COLORS.background,
        }}
        hasThemeOverride={hasThemeOverride}
      />
    </div>
  );
}
