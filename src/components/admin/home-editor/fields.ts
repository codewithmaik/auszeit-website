import type { HomeContent, FooterContent } from "@/db/home-content";

// Farbrolle eines Textfelds — bestimmt, welche Theme-Farbe als Ausgangswert im
// Farbwähler erscheint, solange kein individueller Override gesetzt ist.
export type TextRole = "forest" | "gold" | "white" | "ink-soft";

export type FieldDef = {
  label: string;
  get: (c: HomeContent) => string;
  set: (c: HomeContent, value: string) => HomeContent;
  multiline?: boolean;
  /** Wenn false: nur der Text ist editierbar, keine Schriftgröße/-farbe (z. B. Buttons). */
  styleable?: boolean;
  role?: TextRole;
  /** Ausgangs-Schriftgröße in rem, bevor ein Override gesetzt wird. */
  defaultRem?: number;
};

function heroField(key: keyof HomeContent["hero"], label: string, opts: Partial<FieldDef> = {}): FieldDef {
  return {
    label,
    get: (c) => c.hero[key],
    set: (c, v) => ({ ...c, hero: { ...c.hero, [key]: v } }),
    ...opts,
  };
}

function featureField(i: number, key: "title" | "text", label: string, opts: Partial<FieldDef>): FieldDef {
  return {
    label,
    get: (c) => c.features[i][key],
    set: (c, v) => ({ ...c, features: c.features.map((f, idx) => (idx === i ? { ...f, [key]: v } : f)) }),
    ...opts,
  };
}

function stepField(i: number, key: "title" | "text", label: string, opts: Partial<FieldDef>): FieldDef {
  return {
    label,
    get: (c) => c.steps[i][key],
    set: (c, v) => ({ ...c, steps: c.steps.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)) }),
    ...opts,
  };
}

function trustField(i: number, key: "title" | "text", label: string, opts: Partial<FieldDef>): FieldDef {
  return {
    label,
    get: (c) => c.trust[i][key],
    set: (c, v) => ({ ...c, trust: c.trust.map((t, idx) => (idx === i ? { ...t, [key]: v } : t)) }),
    ...opts,
  };
}

function wohlfuehlField(key: keyof HomeContent["wohlfuehl"], label: string, opts: Partial<FieldDef>): FieldDef {
  return {
    label,
    get: (c) => c.wohlfuehl[key],
    set: (c, v) => ({ ...c, wohlfuehl: { ...c.wohlfuehl, [key]: v } }),
    ...opts,
  };
}

export const FIELDS: Record<string, FieldDef> = {
  "hero.title1": heroField("title1", "Titel Zeile 1", { styleable: true, role: "white", defaultRem: 3 }),
  "hero.title2": heroField("title2", "Titel Zeile 2", { styleable: true, role: "white", defaultRem: 3 }),
  "hero.lead1": heroField("lead1", "Lead-Text 1", { styleable: true, role: "white", defaultRem: 1.1 }),
  "hero.lead2": heroField("lead2", "Lead-Text 2", {
    multiline: true,
    styleable: true,
    role: "white",
    defaultRem: 1,
  }),
  "hero.ctaWohnungen": heroField("ctaWohnungen", 'Button "Zu den Wohnungen"', { styleable: false }),
  "hero.ctaBuchen": heroField("ctaBuchen", 'Button "Buchen & Anfragen"', { styleable: false }),

  stepsEyebrow: {
    label: "Eyebrow",
    get: (c) => c.stepsEyebrow,
    set: (c, v) => ({ ...c, stepsEyebrow: v }),
    styleable: true,
    role: "gold",
    defaultRem: 0.825,
  },
  stepsTitle: {
    label: "Überschrift",
    get: (c) => c.stepsTitle,
    set: (c, v) => ({ ...c, stepsTitle: v }),
    styleable: true,
    role: "forest",
    defaultRem: 1.5,
  },

  bookEyebrow: {
    label: "Eyebrow",
    get: (c) => c.bookEyebrow,
    set: (c, v) => ({ ...c, bookEyebrow: v }),
    styleable: true,
    role: "gold",
    defaultRem: 0.825,
  },
  bookTitle: {
    label: "Überschrift",
    get: (c) => c.bookTitle,
    set: (c, v) => ({ ...c, bookTitle: v }),
    styleable: true,
    role: "forest",
    defaultRem: 1.5,
  },
  bookText: {
    label: "Text",
    get: (c) => c.bookText,
    set: (c, v) => ({ ...c, bookText: v }),
    multiline: true,
    styleable: true,
    role: "ink-soft",
    defaultRem: 1,
  },
  bookBullets: {
    label: "Stichpunkte (eine Zeile je Stichpunkt)",
    get: (c) => c.bookBullets.join("\n"),
    set: (c, v) => ({
      ...c,
      bookBullets: v
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    }),
    multiline: true,
    styleable: true,
    role: "ink-soft",
    defaultRem: 0.92,
  },

  "wohlfuehl.title": wohlfuehlField("title", "Titel", { styleable: true, role: "forest", defaultRem: 1.17 }),
  "wohlfuehl.text": wohlfuehlField("text", "Text", {
    multiline: true,
    styleable: true,
    role: "ink-soft",
    defaultRem: 0.9,
  }),
  "wohlfuehl.more": wohlfuehlField("more", "Link-Text", { styleable: true, role: "gold", defaultRem: 0.97 }),
};

for (let i = 0; i < 4; i++) {
  FIELDS[`features.${i}.title`] = featureField(i, "title", `Kachel ${i + 1} – Titel`, {
    styleable: true,
    role: "forest",
    defaultRem: 0.95,
  });
  FIELDS[`features.${i}.text`] = featureField(i, "text", `Kachel ${i + 1} – Text`, {
    multiline: true,
    styleable: true,
    role: "ink-soft",
    defaultRem: 0.88,
  });
}

for (let i = 0; i < 3; i++) {
  FIELDS[`steps.${i}.title`] = stepField(i, "title", `Schritt ${i + 1} – Titel`, {
    styleable: true,
    role: "forest",
    defaultRem: 1.05,
  });
  FIELDS[`steps.${i}.text`] = stepField(i, "text", `Schritt ${i + 1} – Text`, {
    multiline: true,
    styleable: true,
    role: "ink-soft",
    defaultRem: 0.92,
  });
}

for (let i = 0; i < 4; i++) {
  FIELDS[`trust.${i}.title`] = trustField(i, "title", `Punkt ${i + 1} – Titel`, {
    styleable: true,
    role: "white",
    defaultRem: 0.82,
  });
  FIELDS[`trust.${i}.text`] = trustField(i, "text", `Punkt ${i + 1} – Text`, {
    multiline: true,
    styleable: true,
    role: "white",
    defaultRem: 0.85,
  });
}

export function buildHomeContentFormData(de: HomeContent, en: HomeContent): FormData {
  const fd = new FormData();
  for (const [path, field] of Object.entries(FIELDS)) {
    fd.set(`de.${path}`, field.get(de));
    fd.set(`en.${path}`, field.get(en));
  }
  return fd;
}

// Footer-Textfelder — eigene, kleinere Registry (kein Styling, anders als bei
// FIELDS/HomeContent), gleiches Get/Set-Pattern, geteilt zwischen Popup-Öffnen
// (HomePreviewEditor) und Server Action (design/actions.ts).
export type FooterFieldDef = {
  label: string;
  get: (c: FooterContent) => string;
  set: (c: FooterContent, value: string) => FooterContent;
};

function footerField(key: keyof FooterContent, label: string): FooterFieldDef {
  return {
    label,
    get: (c) => c[key],
    set: (c, v) => ({ ...c, [key]: v }),
  };
}

export const FOOTER_FIELDS: Record<string, FooterFieldDef> = {
  "footer.tagline": footerField("tagline", "Tagline"),
  "footer.navHeading": footerField("navHeading", '„Navigation"-Überschrift'),
  "footer.kontaktHeading": footerField("kontaktHeading", '„Kontakt"-Überschrift'),
  "footer.copyrightSuffix": footerField("copyrightSuffix", "Copyright-Suffix"),
};

export function buildFooterContentFormData(de: FooterContent, en: FooterContent): FormData {
  const fd = new FormData();
  for (const [path, field] of Object.entries(FOOTER_FIELDS)) {
    fd.set(`de.${path}`, field.get(de));
    fd.set(`en.${path}`, field.get(en));
  }
  return fd;
}
