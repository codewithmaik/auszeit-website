// 6 vordefinierte Foto-Filter-Templates für alle Wohnungs-Fotos (Adminpanel
// „Wohnungen"). Jeder Key entspricht einer CSS-Regel
// `img[data-photo-filter="<key>"]` in src/app/globals.css — rein CSS-basiert
// (filter-Eigenschaft), keine Bildbearbeitung/Bibliothek nötig. Gleiches
// Architekturmuster wie src/lib/image-animations.ts und
// src/lib/button-animations.ts.
export type PhotoFilterOption = { key: string; label: string; css: string };

export const PHOTO_FILTER_OPTIONS: PhotoFilterOption[] = [
  {
    key: "warmes-gold",
    label: "Warmes Gold",
    css: "sepia(0.18) saturate(1.25) brightness(1.03) contrast(1.03)",
  },
  {
    key: "kuehles-blau",
    label: "Kühles Blau",
    css: "saturate(0.9) hue-rotate(-6deg) brightness(1.02) contrast(1.05)",
  },
  {
    key: "editorial-sw",
    label: "Editorial S/W",
    css: "grayscale(1) contrast(1.12) brightness(1.02)",
  },
  {
    key: "vintage-sepia",
    label: "Vintage Sepia",
    css: "sepia(0.45) saturate(0.85) contrast(0.95) brightness(1.02)",
  },
  {
    key: "sommerfrisch",
    label: "Sommerfrisch",
    css: "saturate(1.35) contrast(1.08) brightness(1.04)",
  },
  {
    key: "weicher-nebel",
    label: "Weicher Nebel",
    css: "saturate(0.75) brightness(1.06) contrast(0.92)",
  },
  {
    key: "kraeftiges-azur",
    label: "Kräftiges Azur",
    css: "saturate(1.5) contrast(1.16) hue-rotate(-10deg) brightness(1.02)",
  },
  {
    key: "goldene-stunde",
    label: "Goldene Stunde",
    css: "sepia(0.32) saturate(1.55) contrast(1.12) brightness(1.05) hue-rotate(-8deg)",
  },
  {
    key: "smaragd-gold",
    label: "Smaragd & Gold",
    css: "saturate(1.45) contrast(1.14) hue-rotate(8deg) brightness(1.02)",
  },
  {
    key: "terrakotta-glut",
    label: "Terrakotta-Glut",
    css: "sepia(0.4) saturate(1.7) contrast(1.15) hue-rotate(-14deg) brightness(1.02)",
  },
  {
    key: "nordlicht-kuehl",
    label: "Nordlicht Kühl",
    css: "saturate(1.35) contrast(1.2) hue-rotate(6deg) brightness(1.03)",
  },
  {
    key: "kino-teal-orange",
    label: "Kino Teal & Orange",
    css: "saturate(1.6) contrast(1.22) brightness(1.01) sepia(0.12)",
  },
];

const PHOTO_FILTER_KEYS = new Set(PHOTO_FILTER_OPTIONS.map((f) => f.key));

export function isValidPhotoFilter(key: string): boolean {
  return PHOTO_FILTER_KEYS.has(key);
}

// Entwurf/Veröffentlichen-Auflösung: draft null = kein offener Entwurf (folgt
// dem veröffentlichten Wert), draft "none" = Entwurf explizit „kein Filter",
// sonst ist draft direkt der gewünschte Template-Key.
export function effectivePhotoFilterKey(
  published: string | null,
  draft: string | null,
): string | null {
  if (draft === null) return published;
  if (draft === "none") return null;
  return draft;
}
