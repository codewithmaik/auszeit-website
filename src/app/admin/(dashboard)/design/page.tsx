import { getSiteSettings } from "@/db/queries";
import { getDictionary, type Dictionary } from "@/dictionaries";
import { effectiveDesignState, type FooterContent, type NavLabels } from "@/db/home-content";
import HomePreviewEditor from "@/components/admin/home-editor/HomePreviewEditor";
import { DEFAULT_COLORS } from "@/components/admin/home-editor/palettes";

export const metadata = { title: "Design" };
export const dynamic = "force-dynamic";

const DEFAULT_LOGO_IMAGE = "/images/logo.png";

// dict.footer deckt nur die vier historischen Felder ab (Tagline/Überschriften/
// Copyright) — brandName/legalImpressum/.../legalCookie sind reine
// FooterContent-Felder ohne 1:1-Pendant im Dictionary-Typ, deshalb hier
// explizit zu einem vollständigen Default-Objekt zusammengesetzt (Markenname
// war bisher ein fester Literal "AUSZEIT" im Markup).
function defaultFooterContent(dict: Dictionary): FooterContent {
  return {
    tagline: dict.footer.tagline,
    navHeading: dict.footer.navHeading,
    kontaktHeading: dict.footer.kontaktHeading,
    copyrightSuffix: dict.footer.copyrightSuffix,
    brandName: "AUSZEIT",
    legalImpressum: dict.footer.impressum,
    legalDatenschutz: dict.footer.datenschutz,
    legalCookie: dict.footer.cookieSettings,
  };
}

function defaultNavLabels(dict: Dictionary): NavLabels {
  return {
    home: dict.nav.home,
    wohnung: dict.nav.wohnung,
    region: dict.nav.region,
    bewertungen: dict.nav.bewertungen,
    kontakt: dict.nav.kontakt,
  };
}

export default async function AdminDesignPage() {
  const settings = await getSiteSettings();
  const deDict = getDictionary("de");
  const enDict = getDictionary("en");
  const draft = effectiveDesignState(settings);
  const hasDraft = Boolean(settings.designDraft);
  const draftHistoryCount = settings.designDraftHistory?.length ?? 0;
  const defaultHeroImage = "/images/hero-mosel.jpg";
  const defaultWohlfuehlImage = "/images/wohnzimmer-balkon.jpg";
  const defaultFooterDe = defaultFooterContent(deDict);
  const defaultFooterEn = defaultFooterContent(enDict);
  const defaultNavDe = defaultNavLabels(deDict);
  const defaultNavEn = defaultNavLabels(enDict);

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-[1.8rem] mb-2">Design</h1>
      <p className="text-ink-soft mb-8">
        Farbpalette, Logo und die komplette Startseite — direkt in der Vorschau anklicken und bearbeiten. Änderungen
        werden erst nach „Veröffentlichen&rdquo; auf der echten Website sichtbar.
      </p>

      <HomePreviewEditor
        initialContentDe={draft.homeContentDe ?? deDict.home}
        initialContentEn={draft.homeContentEn ?? enDict.home}
        defaultContentDe={deDict.home}
        defaultContentEn={enDict.home}
        hasHomeOverride={Boolean(draft.homeContentDe || draft.homeContentEn)}
        initialStyles={draft.homeTextStyles ?? {}}
        initialFooterContentDe={draft.footerContentDe ?? defaultFooterDe}
        initialFooterContentEn={draft.footerContentEn ?? defaultFooterEn}
        defaultFooterContentDe={defaultFooterDe}
        defaultFooterContentEn={defaultFooterEn}
        hasFooterOverride={Boolean(draft.footerContentDe || draft.footerContentEn)}
        initialNavLabelsDe={draft.navLabelsDe ?? defaultNavDe}
        initialNavLabelsEn={draft.navLabelsEn ?? defaultNavEn}
        defaultNavLabelsDe={defaultNavDe}
        defaultNavLabelsEn={defaultNavEn}
        hasNavOverride={Boolean(draft.navLabelsDe || draft.navLabelsEn)}
        initialHeroImage={draft.homeHeroImageUrl || defaultHeroImage}
        defaultHeroImage={defaultHeroImage}
        isHeroDefault={!draft.homeHeroImageUrl}
        initialWohlfuehlImage={draft.homeWohlfuehlImageUrl || defaultWohlfuehlImage}
        defaultWohlfuehlImage={defaultWohlfuehlImage}
        isWohlfuehlDefault={!draft.homeWohlfuehlImageUrl}
        initialLogoImage={draft.logoImageUrl || DEFAULT_LOGO_IMAGE}
        isLogoDefault={!draft.logoImageUrl}
        initialLogoTextImage={draft.logoTextImageUrl || DEFAULT_LOGO_IMAGE}
        isLogoTextDefault={!draft.logoTextImageUrl}
        initialLogoTextScale={draft.logoTextScale ? parseFloat(draft.logoTextScale) : 1}
        initialLogoMode={draft.logoMode}
        initialColors={{
          primary: draft.themePrimary ?? DEFAULT_COLORS.primary,
          primaryDark: draft.themePrimaryDark ?? DEFAULT_COLORS.primaryDark,
          accent: draft.themeAccent ?? DEFAULT_COLORS.accent,
          background: draft.themeBackground ?? DEFAULT_COLORS.background,
        }}
        hasThemeOverride={Boolean(
          draft.themePrimary || draft.themePrimaryDark || draft.themeAccent || draft.themeBackground,
        )}
        initialButtonStyle={{
          borderWidth: draft.buttonBorderWidth,
          color: draft.buttonColor,
          borderColor: draft.buttonBorderColor,
          borderRadius: draft.buttonBorderRadius,
          animation: draft.buttonAnimation,
        }}
        initialButtonStyles={draft.buttonStyles ?? {}}
        initialButtonsLinked={draft.buttonsLinked}
        hasDraft={hasDraft}
        draftHistoryCount={draftHistoryCount}
      />
    </div>
  );
}
