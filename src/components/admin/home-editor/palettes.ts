export type ThemeColors = {
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
};

export const DEFAULT_COLORS: ThemeColors = {
  primary: "#3c4632",
  primaryDark: "#2c3423",
  accent: "#c99a3f",
  background: "#faf8f3",
};

export type PaletteTemplate = ThemeColors & { id: string; name: string };

// Zehn kuratierte Varianten der Standardpalette — gleiche Formel (dunkle
// Primärfarbe, dezenter Hintergrund, edler Akzent), nur der Farbton wechselt,
// damit jede Variante hochwertig bleibt statt bunt/grell zu wirken.
export const PALETTE_TEMPLATES: PaletteTemplate[] = [
  { id: "lavendel", name: "Lavendel", primary: "#4b3b63", primaryDark: "#362a48", accent: "#c9a26a", background: "#faf7fb" },
  { id: "fruehlingsgruen", name: "Frühlingsgrün", primary: "#4a6741", primaryDark: "#364d30", accent: "#c9a24a", background: "#f7faf5" },
  { id: "bordeaux", name: "Bordeaux", primary: "#5c2a2e", primaryDark: "#431e21", accent: "#c9a24a", background: "#faf5f2" },
  { id: "ozeanblau", name: "Ozeanblau", primary: "#2c4658", primaryDark: "#1f3340", accent: "#c9a24a", background: "#f5f8fa" },
  { id: "bernstein", name: "Bernstein", primary: "#7a5a1e", primaryDark: "#584015", accent: "#3f5d56", background: "#fdf9f0" },
  { id: "tuerkis", name: "Türkis", primary: "#1f4f4c", primaryDark: "#163936", accent: "#c9a24a", background: "#f4faf9" },
  { id: "terrakotta", name: "Terrakotta", primary: "#7a4a32", primaryDark: "#593523", accent: "#c9a24a", background: "#faf6f1" },
  { id: "anthrazit", name: "Anthrazit-Gold", primary: "#33363a", primaryDark: "#232529", accent: "#c9a24a", background: "#f7f7f6" },
  { id: "rosenholz", name: "Rosenholz", primary: "#6b3f47", primaryDark: "#4d2d33", accent: "#c9a24a", background: "#faf5f6" },
  { id: "mitternachtsblau", name: "Mitternachtsblau", primary: "#1c2b45", primaryDark: "#131e30", accent: "#c9a24a", background: "#f5f6fa" },
];
