import { Inter, Lora, Merriweather, Montserrat, Nunito, Raleway } from "next/font/google";

// Kuratierte Schriftarten-Auswahl für den Design-Editor (pro Textfeld wählbar,
// siehe HomeTextStyles["fontFamily"] in src/db/home-content.ts). Alle sechs
// sind Google Fonts unter der SIL Open Font License — kommerziell frei
// nutzbar, keine Lizenzkosten, keine Herkunftsangabe-Pflicht.
//
// Eingebunden über next/font/google statt eines <link>-Tags auf
// fonts.googleapis.com: next/font lädt die Schriftdateien zur Build-Zeit
// herunter und liefert sie selbst von dieser Domain aus. Dadurch gibt es zur
// Laufzeit keinen Request an Google-Server und keine Übertragung der
// Besucher-IP an Google — genau das war 2022 in Deutschland (LG München I)
// bei direkter Google-Fonts-CDN-Einbindung ohne Einwilligung ein
// Abmahnthema. Gleiches Muster wie die bereits bestehenden
// Playfair_Display/Jost-Importe in src/app/layout.tsx.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "600", "700"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "600", "700"] });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"], weight: ["400", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400", "600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "600", "700"] });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"], weight: ["400", "600", "700"] });

const CURATED_FONTS = [inter, lora, merriweather, montserrat, nunito, raleway];

// Wird auf <html> gemountet (src/app/layout.tsx), damit alle CSS-Variablen
// sitewide verfügbar sind, egal welche Schriftart ein Textfeld-Override wählt.
export const FONT_VARIABLE_CLASSNAME = CURATED_FONTS.map((f) => f.variable).join(" ");

export type FontOption = { key: string; label: string; cssVar: string };

export const FONT_OPTIONS: FontOption[] = [
  { key: "inter", label: "Inter — modern & klar", cssVar: "--font-inter" },
  { key: "lora", label: "Lora — Serif, warm", cssVar: "--font-lora" },
  { key: "merriweather", label: "Merriweather — Serif, kräftig", cssVar: "--font-merriweather" },
  { key: "montserrat", label: "Montserrat — geometrisch", cssVar: "--font-montserrat" },
  { key: "nunito", label: "Nunito — rund & freundlich", cssVar: "--font-nunito" },
  { key: "raleway", label: "Raleway — elegant & schmal", cssVar: "--font-raleway" },
];

const FONT_OPTION_KEYS = new Set(FONT_OPTIONS.map((f) => f.key));

export function isValidFontKey(key: string): boolean {
  return FONT_OPTION_KEYS.has(key);
}

// CSS-`font-family`-Wert für einen FONT_OPTIONS-Key, oder undefined für
// "Standard" (kein Override, Feld erbt die umgebende Schriftart).
export function fontFamilyFor(key: string | undefined | null): string | undefined {
  if (!key) return undefined;
  const option = FONT_OPTIONS.find((f) => f.key === key);
  return option ? `var(${option.cssVar})` : undefined;
}
