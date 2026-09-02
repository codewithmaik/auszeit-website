export const FEATURE_KEYS = ["lage", "wohnung", "erholung", "service"] as const;

// "separate" = Logo (rundes Bild) und Logo-Schriftzug (Textbild/Fallback-Text)
// wie bisher zwei unabhängige Slots. "combined" = ein einziges Bild
// (logoImageUrl) ersetzt beide, logoTextImageUrl wird dabei ignoriert.
export const LOGO_MODES = ["separate", "combined"] as const;
export type LogoMode = (typeof LOGO_MODES)[number];
export function isValidLogoMode(value: string): value is LogoMode {
  return (LOGO_MODES as readonly string[]).includes(value);
}

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
  /** Unitless CSS line-height, z. B. "1.4". */
  lineHeight?: string;
  /** CSS letter-spacing inkl. Einheit, z. B. "0.02em". */
  letterSpacing?: string;
};
export type HomeTextStyles = Record<string, HomeTextStyleOverride>;

// Editierbare Navbar-Link-Texte je Sprache (Ziel-Routen bleiben fest, nur die
// sichtbaren Labels sind editierbar) — geteilt zwischen Header (Navbar) und
// Footer (Navigations-Spalte), die dieselben fünf Links duplizieren.
export type NavLabels = {
  home: string;
  wohnung: string;
  region: string;
  bewertungen: string;
  kontakt: string;
};

// Editierbare Footer-Texte je Sprache (Tagline, Spalten-Überschriften,
// Copyright-Suffix, Markenname, Legal-Link-Labels). Kontaktdaten bleiben in
// "Einstellungen" verwaltet, die Credit-Zeile ("codewithmaik & ...") bleibt
// als externe Zuschreibung fest.
export type FooterContent = {
  tagline: string;
  navHeading: string;
  kontaktHeading: string;
  copyrightSuffix: string;
  brandName: string;
  legalImpressum: string;
  legalDatenschutz: string;
  legalCookie: string;
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
  // Textstil-Erweiterung (ausklappbarer Bereich im ButtonEditPopup) — optional
  // statt string|null wie oben, damit ältere Objekte mit nur den 5 Feldern
  // oben (z. B. der sitewide Default-Stil aus den sitewide buttonBorderWidth/
  // .../-Spalten) ohne Änderung weiter gültig bleiben. undefined = kein
  // Override, identisch zu false/"" beim Anwenden.
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  /** Unitless CSS line-height, z. B. "1.4". */
  lineHeight?: string;
  /** CSS letter-spacing inkl. Einheit, z. B. "0.02em". */
  letterSpacing?: string;
};
export type ButtonStyles = Partial<Record<ButtonId, ButtonStyleOverride>>;

// Icon-Overrides für Feature-Kacheln/Schritte/Vertrauensleiste — Index (0-
// basiert, s. FEATURE_KEYS/STEP_ICONS/TRUST_ICONS in src/lib/home-icons.ts)
// zu hochgeladener Bild-URL. Fehlender Eintrag = Standard-Icon (BrandIcon-PNG
// bzw. Lucide-Icon) bleibt sichtbar. Sprachunabhängig, wie die Theme-Farben.
export type IconOverrides = Record<number, string>;

// Vollständiger, noch nicht veröffentlichter Bearbeitungsstand des Design-Menüs
// — spiegelt 1:1 die entwurfsfähigen Spalten aus siteSettings (src/db/schema.ts).
// null bei einem Feld = "auf Standard zurücksetzen", nicht "unverändert" — ein
// Entwurf wird immer als vollständiger Snapshot aus dem jeweils aktuellen
// effektiven Zustand aufgebaut, nie partiell gemerged.
export type DesignDraft = {
  logoImageUrl: string | null;
  logoTextImageUrl: string | null;
  /** Größenfaktor des Logo-Schriftzugs (0.6–1.6), null = Standardgröße (1). */
  logoTextScale: string | null;
  logoMode: LogoMode;
  themePrimary: string | null;
  themePrimaryDark: string | null;
  themeAccent: string | null;
  themeBackground: string | null;
  homeHeroImageUrl: string | null;
  homeWohlfuehlImageUrl: string | null;
  homeHeroAnimation: string | null;
  homeWohlfuehlAnimation: string | null;
  homeContentDe: HomeContent | null;
  homeContentEn: HomeContent | null;
  homeTextStyles: HomeTextStyles | null;
  footerContentDe: FooterContent | null;
  footerContentEn: FooterContent | null;
  navLabelsDe: NavLabels | null;
  navLabelsEn: NavLabels | null;
  buttonBorderWidth: string | null;
  buttonColor: string | null;
  buttonBorderColor: string | null;
  buttonBorderRadius: string | null;
  buttonAnimation: string | null;
  buttonStyles: ButtonStyles | null;
  buttonsLinked: boolean;
  featureIconOverrides: IconOverrides | null;
  stepIconOverrides: IconOverrides | null;
  trustIconOverrides: IconOverrides | null;
};

// Baut den DesignDraft-Snapshot aus dem aktuell *veröffentlichten* Zustand
// (z. B. einer siteSettings-Zeile) — Ausgangspunkt für einen neuen Entwurf und
// Vergleichsbasis beim Veröffentlichen/Verwerfen. Rein funktional, keine
// DB-Abhängigkeit, damit sowohl Server Actions als auch Seiten sie nutzen können.
export function publishedDesignSnapshot(settings: DesignDraft): DesignDraft {
  return {
    logoImageUrl: settings.logoImageUrl,
    logoTextImageUrl: settings.logoTextImageUrl,
    logoTextScale: settings.logoTextScale,
    logoMode: settings.logoMode,
    themePrimary: settings.themePrimary,
    themePrimaryDark: settings.themePrimaryDark,
    themeAccent: settings.themeAccent,
    themeBackground: settings.themeBackground,
    homeHeroImageUrl: settings.homeHeroImageUrl,
    homeWohlfuehlImageUrl: settings.homeWohlfuehlImageUrl,
    homeHeroAnimation: settings.homeHeroAnimation,
    homeWohlfuehlAnimation: settings.homeWohlfuehlAnimation,
    homeContentDe: settings.homeContentDe,
    homeContentEn: settings.homeContentEn,
    homeTextStyles: settings.homeTextStyles,
    footerContentDe: settings.footerContentDe,
    footerContentEn: settings.footerContentEn,
    navLabelsDe: settings.navLabelsDe,
    navLabelsEn: settings.navLabelsEn,
    buttonBorderWidth: settings.buttonBorderWidth,
    buttonColor: settings.buttonColor,
    buttonBorderColor: settings.buttonBorderColor,
    buttonBorderRadius: settings.buttonBorderRadius,
    buttonAnimation: settings.buttonAnimation,
    buttonStyles: settings.buttonStyles,
    buttonsLinked: settings.buttonsLinked,
    featureIconOverrides: settings.featureIconOverrides,
    stepIconOverrides: settings.stepIconOverrides,
    trustIconOverrides: settings.trustIconOverrides,
  };
}

// Effektiver Arbeitszustand des Design-Editors: offener Entwurf, falls
// vorhanden, sonst der veröffentlichte Stand.
export function effectiveDesignState(
  settings: DesignDraft & { designDraft: DesignDraft | null },
): DesignDraft {
  return settings.designDraft ?? publishedDesignSnapshot(settings);
}
