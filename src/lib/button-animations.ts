// 10 vordefinierte Button-Hover-Animationen für die globale Button-Gestaltung
// im Design-Editor. Jeder Key entspricht einer CSS-Regel
// `[data-button-anim="<key>"] .btn:hover` in src/app/globals.css — rein
// CSS-basiert, keine JS-Animationsbibliothek nötig.
export type ButtonAnimationOption = { key: string; label: string };

export const BUTTON_ANIMATION_OPTIONS: ButtonAnimationOption[] = [
  { key: "lift", label: "Anheben" },
  { key: "scale", label: "Vergrößern" },
  { key: "glow", label: "Leuchten" },
  { key: "underline-sweep", label: "Unterstreichen" },
  { key: "shine", label: "Lichtreflex" },
  { key: "pulse", label: "Pulsieren" },
  { key: "bounce", label: "Hüpfen" },
  { key: "slide-fill", label: "Einfärben" },
  { key: "ripple", label: "Ripple" },
  { key: "spacing", label: "Spationierung" },
];

const BUTTON_ANIMATION_KEYS = new Set(BUTTON_ANIMATION_OPTIONS.map((a) => a.key));

export function isValidButtonAnimation(key: string): boolean {
  return BUTTON_ANIMATION_KEYS.has(key);
}
