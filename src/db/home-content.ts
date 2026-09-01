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

// Editierbare Footer-Texte je Sprache (Tagline, Spalten-Überschriften,
// Copyright-Suffix). Kontaktdaten bleiben in "Einstellungen" verwaltet,
// Legal-Link-Labels (Impressum/Datenschutz/Cookie/Credit) bleiben fest.
export type FooterContent = {
  tagline: string;
  navHeading: string;
  kontaktHeading: string;
  copyrightSuffix: string;
};

// Individuelle Button-Gestaltung: nur die im Design-Preview sichtbaren
// Buttons (Hero-CTA 1/2, Navbar-CTA) können eigene Overrides bekommen — alle
// übrigen Buttons der Website (Wohnung/Bewertungen/Slider) folgen weiterhin
// dem gemeinsamen Default-Stil (die bisherigen buttonBorderWidth/.../-Spalten
// weiter unten). null je Feld = kein individueller Wert, Default-Stil greift.
export const BUTTON_IDS = ["hero.ctaWohnungen", "hero.ctaBuchen", "navbar.cta"] as const;
export type ButtonId = (typeof BUTTON_IDS)[number];

export function isValidButtonId(id: string): id is ButtonId {
  return (BUTTON_IDS as readonly string[]).includes(id);
}

export type ButtonStyleOverride = {
  borderWidth: string | null;
  color: string | null;
  borderColor: string | null;
  borderRadius: string | null;
  animation: string | null;
};
export type ButtonStyles = Partial<Record<ButtonId, ButtonStyleOverride>>;

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
  footerContentDe: FooterContent | null;
  footerContentEn: FooterContent | null;
  buttonBorderWidth: string | null;
  buttonColor: string | null;
  buttonBorderColor: string | null;
  buttonBorderRadius: string | null;
  buttonAnimation: string | null;
  buttonStyles: ButtonStyles | null;
  buttonsLinked: boolean;
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
    footerContentDe: settings.footerContentDe,
    footerContentEn: settings.footerContentEn,
    buttonBorderWidth: settings.buttonBorderWidth,
    buttonColor: settings.buttonColor,
    buttonBorderColor: settings.buttonBorderColor,
    buttonBorderRadius: settings.buttonBorderRadius,
    buttonAnimation: settings.buttonAnimation,
    buttonStyles: settings.buttonStyles,
    buttonsLinked: settings.buttonsLinked,
  };
}

// Effektiver Arbeitszustand des Design-Editors: offener Entwurf, falls
// vorhanden, sonst der veröffentlichte Stand.
export function effectiveDesignState(
  settings: DesignDraft & { designDraft: DesignDraft | null },
): DesignDraft {
  return settings.designDraft ?? publishedDesignSnapshot(settings);
}
