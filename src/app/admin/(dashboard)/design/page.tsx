import { getSiteSettings } from "@/db/queries";
import { getDictionary } from "@/dictionaries";
import { effectiveDesignState } from "@/db/home-content";
import HomePreviewEditor from "@/components/admin/home-editor/HomePreviewEditor";
import { DEFAULT_COLORS } from "@/components/admin/home-editor/palettes";

export const metadata = { title: "Design" };
export const dynamic = "force-dynamic";

const DEFAULT_LOGO_IMAGE = "/images/logo.png";

export default async function AdminDesignPage() {
  const settings = await getSiteSettings();
  const deDict = getDictionary("de");
  const enDict = getDictionary("en");
  const draft = effectiveDesignState(settings);
  const hasDraft = Boolean(settings.designDraft);
  const draftHistoryCount = settings.designDraftHistory?.length ?? 0;
  const defaultHeroImage = "/images/hero-mosel.jpg";
  const defaultWohlfuehlImage = "/images/wohnzimmer-balkon.jpg";

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
        initialFooterContentDe={draft.footerContentDe ?? deDict.footer}
        initialFooterContentEn={draft.footerContentEn ?? enDict.footer}
        defaultFooterContentDe={deDict.footer}
        defaultFooterContentEn={enDict.footer}
        hasFooterOverride={Boolean(draft.footerContentDe || draft.footerContentEn)}
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
        hasButtonOverride={Boolean(
          draft.buttonBorderWidth || draft.buttonColor || draft.buttonBorderColor || draft.buttonBorderRadius || draft.buttonAnimation,
        )}
        hasDraft={hasDraft}
        draftHistoryCount={draftHistoryCount}
      />
    </div>
  );
}
