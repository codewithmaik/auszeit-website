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
