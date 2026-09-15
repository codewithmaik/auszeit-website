// 5 vordefinierte Hintergrundbild-Animationen für Hero-/Wohlfühl-Bild im
// Design-Editor. Jeder Key entspricht einer CSS-Regel
// `img[data-bg-anim="<key>"]` in src/app/globals.css — rein CSS-basiert
// (transform/filter + @keyframes), keine JS-Animationsbibliothek nötig.
// Gleiches Architekturmuster wie src/lib/button-animations.ts.
export type ImageAnimationOption = { key: string; label: string; description: string };

export const IMAGE_ANIMATION_OPTIONS: ImageAnimationOption[] = [
  {
    key: "zoom-hold",
    label: "Sanfter Zoom",
    description: "Sehr langsamer 10%-Zoom, bleibt danach im Zoom stehen.",
  },
  {
    key: "pan-horizontal",
    label: "Weiches Schwenken",
    description: "Langsamer diagonaler Ken-Burns-Schwenk mit leichtem Zoom.",
  },
  {
    key: "pan-vertical",
    label: "Vertikale Enthüllung",
    description: "Sanfter vertikaler Schwenk — passend für hochformatige Motive.",
  },
  {
    key: "breathe",
    label: "Ruhiger Atem",
    description: "Endlose, sehr sanfte Skalierungs-Pulsation — für Ambiente-Fotos.",
  },
  {
    key: "soft-reveal",
    label: "Weichzeichner-Enthüllung",
    description: "Startet leicht geblurrt und gezoomt, löst sich beim Laden zur vollen Schärfe auf.",
  },
];

const IMAGE_ANIMATION_KEYS = new Set(IMAGE_ANIMATION_OPTIONS.map((a) => a.key));

export function isValidImageAnimation(key: string): boolean {
  return IMAGE_ANIMATION_KEYS.has(key);
}
