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

// Schriftgröße/-farbe je Startseiten-Textfeld, keyed by Feldpfad (z. B.
// "hero.title1", "features.0.title") — dieselben Pfade wie in saveHomeContent.
export type HomeTextStyles = Record<string, { fontSize?: string; color?: string }>;
