import { ShieldCheck, CalendarCheck, MapPin, Wine, Send, CalendarCheck2, KeyRound } from "lucide-react";
import type { BrandIconName } from "@/components/BrandIcon";

// Icon-Zuordnung für die Startseite — geteilt zwischen der öffentlichen Seite
// (src/app/[lang]/page.tsx) und der Live-Vorschau im Adminpanel, damit beide
// zwangsläufig in Sync bleiben.
export const FEATURE_ICONS: Record<string, BrandIconName> = {
  lage: "trauben",
  wohnung: "fachwerkhaus",
  erholung: "sonnenuntergang",
  service: "herzen",
};

// Die Quell-PNGs schneiden ihr rundes Icon-Motiv innerhalb der 320x320-Leinwand
// jeweils unterschiedlich an, ein einfacher Rahmen um das Bild wirkt daher
// unzentriert. Diese (pro Icon gemessenen) Werte rücken jedes Badge in einen
// gemeinsamen Rahmen.
export const FEATURE_ICON_FRAME: Record<string, { size: number; left: number; top: number }> = {
  lage: { size: 64, left: -13, top: -11 },
  wohnung: { size: 64, left: -3, top: -11 },
  erholung: { size: 64, left: -13, top: -1 },
  service: { size: 64, left: -8, top: -1 },
};

export const TRUST_ICONS = [ShieldCheck, CalendarCheck, MapPin, Wine];
export const STEP_ICONS = [Send, CalendarCheck2, KeyRound];
