export const FEATURE_KEYS = ["lage", "wohnung", "erholung", "service"] as const;

export type HomeContent = {
  hero: {
    title1: string;
    title2: string;
    lead1: string;
    lead2: string;
    ctaWohnungen: string;
    ctaBuchen: string;
  };
  features: { key: string; title: string; text: string }[];
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  bookEyebrow: string;
  bookTitle: string;
  bookText: string;
  bookBullets: string[];
  wohlfuehl: { title: string; text: string; more: string };
  trust: { title: string; text: string }[];
};

// Schriftgröße/-farbe/-schnitt/-familie je Startseiten-Textfeld, keyed by
// Feldpfad (z. B. "hero.title1", "features.0.title") — dieselben Pfade wie in
// saveHomeContent. `fontFamily` referenziert einen Key aus FONT_OPTIONS
// (src/lib/fonts.ts).
export type HomeTextStyleOverride = {
  fontSize?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
};
export type HomeTextStyles = Record<string, HomeTextStyleOverride>;

// Vollständiger, noch nicht veröffentlichter Bearbeitungsstand des Design-Menüs
// — spiegelt 1:1 die entwurfsfähigen Spalten aus siteSettings (src/db/schema.ts).
// null bei einem Feld = "auf Standard zurücksetzen", nicht "unverändert" — ein
// Entwurf wird immer als vollständiger Snapshot aus dem jeweils aktuellen
// effektiven Zustand aufgebaut, nie partiell gemerged.
export type DesignDraft = {
  logoImageUrl: string | null;
  logoTextImageUrl: string | null;
  themePrimary: string | null;
  themePrimaryDark: string | null;
  themeAccent: string | null;
  themeBackground: string | null;
  homeHeroImageUrl: string | null;
  homeWohlfuehlImageUrl: string | null;
  homeContentDe: HomeContent | null;
  homeContentEn: HomeContent | null;
  homeTextStyles: HomeTextStyles | null;
  buttonBorderWidth: string | null;
  buttonColor: string | null;
  buttonBorderColor: string | null;
  buttonBorderRadius: string | null;
  buttonAnimation: string | null;
};

// Baut den DesignDraft-Snapshot aus dem aktuell *veröffentlichten* Zustand
// (z. B. einer siteSettings-Zeile) — Ausgangspunkt für einen neuen Entwurf und
// Vergleichsbasis beim Veröffentlichen/Verwerfen. Rein funktional, keine
// DB-Abhängigkeit, damit sowohl Server Actions als auch Seiten sie nutzen können.
export function publishedDesignSnapshot(settings: DesignDraft): DesignDraft {
  return {
    logoImageUrl: settings.logoImageUrl,
    logoTextImageUrl: settings.logoTextImageUrl,
    themePrimary: settings.themePrimary,
    themePrimaryDark: settings.themePrimaryDark,
    themeAccent: settings.themeAccent,
    themeBackground: settings.themeBackground,
    homeHeroImageUrl: settings.homeHeroImageUrl,
    homeWohlfuehlImageUrl: settings.homeWohlfuehlImageUrl,
    homeContentDe: settings.homeContentDe,
    homeContentEn: settings.homeContentEn,
    homeTextStyles: settings.homeTextStyles,
    buttonBorderWidth: settings.buttonBorderWidth,
    buttonColor: settings.buttonColor,
    buttonBorderColor: settings.buttonBorderColor,
    buttonBorderRadius: settings.buttonBorderRadius,
    buttonAnimation: settings.buttonAnimation,
  };
}

// Effektiver Arbeitszustand des Design-Editors: offener Entwurf, falls
// vorhanden, sonst der veröffentlichte Stand.
export function effectiveDesignState(
  settings: DesignDraft & { designDraft: DesignDraft | null },
): DesignDraft {
  return settings.designDraft ?? publishedDesignSnapshot(settings);
}
