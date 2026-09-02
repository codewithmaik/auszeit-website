"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import {
  FEATURE_KEYS,
  BUTTON_IDS,
  isValidButtonId,
  isValidLogoMode,
  publishedDesignSnapshot,
  type HomeContent,
  type HomeTextStyles,
  type FooterContent,
  type NavLabels,
  type ButtonStyleOverride,
  type ButtonStyles,
  type DesignDraft,
  type IconOverrides,
} from "@/db/home-content";
import { BUSINESS } from "@/lib/site";
import { isValidFontKey } from "@/lib/fonts";
import { isValidButtonAnimation } from "@/lib/button-animations";
import { isValidImageAnimation } from "@/lib/image-animations";

const HEX_RE = /^#[0-9a-f]{6}$/i;
const DRAFT_HISTORY_CAP = 20;

type SettingsRow = typeof siteSettings.$inferSelect;
type SettingsUpdate = Partial<typeof siteSettings.$inferInsert>;

async function ensureSettingsId(): Promise<number> {
  const existing = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (existing.length > 0) return existing[0].id;

  const [created] = await db
    .insert(siteSettings)
    .values({
      contactAddress: `${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}`,
      contactPhone: BUSINESS.telephone,
      contactEmail: BUSINESS.email,
    })
    .returning({ id: siteSettings.id });
  return created.id;
}

async function getRow(): Promise<SettingsRow> {
  const id = await ensureSettingsId();
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, id)).limit(1);
  return row;
}

async function updateSettings(id: number, values: SettingsUpdate) {
  await db
    .update(siteSettings)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(siteSettings.id, id));
}

function revalidateDesign() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/design");
}

// ---------- Entwurf/Veröffentlichen/Zurück ----------
//
// Jede Design-Änderung landet in `designDraft` (siteSettings), NICHT direkt in
// den veröffentlichten Spalten, die die öffentliche Website liest. Erst
// `publishDesign()` kopiert den Entwurf in die veröffentlichten Spalten. Vor
// jeder Entwurfs-Änderung wird der bisherige Entwurfsstand in
// `designDraftHistory` gepusht (Ringpuffer) — das trägt den „Zurück"-Button.

async function saveDesignDraft(partial: Partial<DesignDraft>): Promise<DesignDraft> {
  const row = await getRow();
  const currentDraft = row.designDraft ?? publishedDesignSnapshot(row);
  const history = row.designDraftHistory ?? [];
  const newHistory = [currentDraft, ...history].slice(0, DRAFT_HISTORY_CAP);
  const newDraft: DesignDraft = { ...currentDraft, ...partial };

  await updateSettings(row.id, { designDraft: newDraft, designDraftHistory: newHistory });
  revalidateDesign();
  return newDraft;
}

async function deleteBlobIfOrphaned(url: string | null, keepUrl: string | null) {
  if (url && url !== keepUrl && url.startsWith("http")) {
    try {
      await del(url);
    } catch {
      // ignore blob deletion errors, don't block the workflow
    }
  }
}

export async function publishDesign() {
  const row = await getRow();
  const draft = row.designDraft;
  if (!draft) return;

  const published = publishedDesignSnapshot(row);
  await Promise.all([
    deleteBlobIfOrphaned(published.logoImageUrl, draft.logoImageUrl),
    deleteBlobIfOrphaned(published.logoTextImageUrl, draft.logoTextImageUrl),
    deleteBlobIfOrphaned(published.homeHeroImageUrl, draft.homeHeroImageUrl),
    deleteBlobIfOrphaned(published.homeWohlfuehlImageUrl, draft.homeWohlfuehlImageUrl),
  ]);

  await updateSettings(row.id, { ...draft, designDraft: null, designDraftHistory: null });
  revalidateDesign();
}

export async function discardDesignDraft(): Promise<DesignDraft> {
  const row = await getRow();
  const draft = row.designDraft;
  const published = publishedDesignSnapshot(row);
  if (draft) {
    await Promise.all([
      deleteBlobIfOrphaned(draft.logoImageUrl, published.logoImageUrl),
      deleteBlobIfOrphaned(draft.logoTextImageUrl, published.logoTextImageUrl),
      deleteBlobIfOrphaned(draft.homeHeroImageUrl, published.homeHeroImageUrl),
      deleteBlobIfOrphaned(draft.homeWohlfuehlImageUrl, published.homeWohlfuehlImageUrl),
    ]);
  }
  await updateSettings(row.id, { designDraft: null, designDraftHistory: null });
  revalidateDesign();
  return published;
}

export async function undoDesignDraft(): Promise<DesignDraft | null> {
  const row = await getRow();
  const history = row.designDraftHistory ?? [];
  if (history.length === 0) return null;

  const [previousDraft, ...rest] = history;
  await updateSettings(row.id, { designDraft: previousDraft, designDraftHistory: rest });
  revalidateDesign();
  return previousDraft;
}

// ---------- Branding- & Startseiten-Bilder ----------

type ImageField = "logoImageUrl" | "logoTextImageUrl" | "homeHeroImageUrl" | "homeWohlfuehlImageUrl";

async function uploadDraftImage(
  field: ImageField,
  blobFolder: string,
  formData: FormData,
): Promise<{ url: string } | undefined> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const blob = await put(`${blobFolder}/${Date.now()}-${file.name}`, file, { access: "public" });
  await saveDesignDraft({ [field]: blob.url });
  return { url: blob.url };
}

async function resetDraftImage(field: ImageField) {
  await saveDesignDraft({ [field]: null });
}

export async function uploadLogoImage(formData: FormData) {
  return uploadDraftImage("logoImageUrl", "branding", formData);
}
export async function resetLogoImage() {
  await resetDraftImage("logoImageUrl");
}

export async function uploadLogoTextImage(formData: FormData) {
  return uploadDraftImage("logoTextImageUrl", "branding", formData);
}
export async function resetLogoTextImage() {
  await resetDraftImage("logoTextImageUrl");
}

const LOGO_SCALE_RE = /^\d(\.\d+)?$/;

export async function saveLogoTextScale(scale: number) {
  const clamped = Math.min(1.6, Math.max(0.6, scale));
  const raw = clamped.toFixed(2);
  if (!LOGO_SCALE_RE.test(raw)) throw new Error("Ungültiger Wert für Logo-Schriftzug-Größe.");
  await saveDesignDraft({ logoTextScale: raw });
}

export async function resetLogoTextScale() {
  await saveDesignDraft({ logoTextScale: null });
}

export async function saveLogoMode(mode: string) {
  if (!isValidLogoMode(mode)) throw new Error(`Ungültiger Logo-Modus "${mode}".`);
  await saveDesignDraft({ logoMode: mode });
}

export async function uploadHomeHeroImage(formData: FormData) {
  return uploadDraftImage("homeHeroImageUrl", "home", formData);
}
export async function resetHomeHeroImage() {
  await resetDraftImage("homeHeroImageUrl");
}

export async function uploadHomeWohlfuehlImage(formData: FormData) {
  return uploadDraftImage("homeWohlfuehlImageUrl", "home", formData);
}
export async function resetHomeWohlfuehlImage() {
  await resetDraftImage("homeWohlfuehlImageUrl");
}

// ---------- Hintergrundbild-Animationen ----------

function readImageAnimationKey(key: string | null): string | null {
  if (key === null) return null;
  if (!isValidImageAnimation(key)) throw new Error(`Ungültige Bild-Animation "${key}".`);
  return key;
}

export async function saveHomeHeroAnimation(key: string | null) {
  await saveDesignDraft({ homeHeroAnimation: readImageAnimationKey(key) });
}

export async function saveHomeWohlfuehlAnimation(key: string | null) {
  await saveDesignDraft({ homeWohlfuehlAnimation: readImageAnimationKey(key) });
}

// ---------- Farbpalette ----------

function readHex(formData: FormData, name: string): string | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  if (!HEX_RE.test(raw)) throw new Error(`Ungültiger Hex-Farbwert für "${name}".`);
  return raw;
}

export async function saveThemeColors(formData: FormData) {
  await saveDesignDraft({
    themePrimary: readHex(formData, "themePrimary"),
    themePrimaryDark: readHex(formData, "themePrimaryDark"),
    themeAccent: readHex(formData, "themeAccent"),
    themeBackground: readHex(formData, "themeBackground"),
  });
}

export async function resetThemeColors() {
  await saveDesignDraft({
    themePrimary: null,
    themePrimaryDark: null,
    themeAccent: null,
    themeBackground: null,
  });
}

const CSS_LENGTH_RE = /^\d+(\.\d+)?px$/;

function readCssLength(formData: FormData, name: string): string | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  if (!CSS_LENGTH_RE.test(raw)) throw new Error(`Ungültiger Pixel-Wert für "${name}".`);
  return raw;
}

function readAnimationKey(formData: FormData, name: string): string | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  if (!isValidButtonAnimation(raw)) throw new Error(`Ungültige Animation für "${name}".`);
  return raw;
}

// ---------- Startseiten-Texte ----------

function str(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function parseHomeContent(formData: FormData, locale: "de" | "en"): HomeContent {
  const field = (path: string) => str(formData, `${locale}.${path}`);

  return {
    hero: {
      title1: field("hero.title1"),
      title2: field("hero.title2"),
      lead1: field("hero.lead1"),
      lead2: field("hero.lead2"),
      ctaWohnungen: field("hero.ctaWohnungen"),
      ctaBuchen: field("hero.ctaBuchen"),
    },
    features: FEATURE_KEYS.map((key, i) => ({
      key,
      title: field(`features.${i}.title`),
      text: field(`features.${i}.text`),
    })),
    stepsEyebrow: field("stepsEyebrow"),
    stepsTitle: field("stepsTitle"),
    steps: [0, 1, 2].map((i) => ({
      title: field(`steps.${i}.title`),
      text: field(`steps.${i}.text`),
    })),
    bookEyebrow: field("bookEyebrow"),
    bookTitle: field("bookTitle"),
    bookText: field("bookText"),
    bookBullets: field("bookBullets")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    wohlfuehl: {
      title: field("wohlfuehl.title"),
      text: field("wohlfuehl.text"),
      more: field("wohlfuehl.more"),
    },
    trust: [0, 1, 2, 3].map((i) => ({
      title: field(`trust.${i}.title`),
      text: field(`trust.${i}.text`),
    })),
  };
}

// ---------- Startseiten-Textstile (Schriftgröße/-farbe je Feld) ----------

const FONT_SIZE_RE = /^\d+(\.\d+)?rem$/;
const LINE_HEIGHT_RE = /^\d+(\.\d+)?$/;
const LETTER_SPACING_RE = /^-?\d+(\.\d+)?em$/;

function sanitizeHomeTextStyles(styles: HomeTextStyles): HomeTextStyles {
  const clean: HomeTextStyles = {};
  for (const [path, override] of Object.entries(styles)) {
    if (!override || typeof path !== "string") continue;
    const entry: HomeTextStyles[string] = {};
    if (typeof override.fontSize === "string" && FONT_SIZE_RE.test(override.fontSize)) {
      entry.fontSize = override.fontSize;
    }
    if (typeof override.color === "string" && HEX_RE.test(override.color)) {
      entry.color = override.color;
    }
    if (typeof override.bold === "boolean") entry.bold = override.bold;
    if (typeof override.italic === "boolean") entry.italic = override.italic;
    if (typeof override.underline === "boolean") entry.underline = override.underline;
    if (typeof override.fontFamily === "string" && isValidFontKey(override.fontFamily)) {
      entry.fontFamily = override.fontFamily;
    }
    if (typeof override.lineHeight === "string" && LINE_HEIGHT_RE.test(override.lineHeight)) {
      entry.lineHeight = override.lineHeight;
    }
    if (typeof override.letterSpacing === "string" && LETTER_SPACING_RE.test(override.letterSpacing)) {
      entry.letterSpacing = override.letterSpacing;
    }
    if (Object.keys(entry).length > 0) clean[path] = entry;
  }
  return clean;
}

// Speichert Text + Textstile einer Bearbeitung in einem Zug (ein Entwurfs-/
// History-Eintrag statt zwei separaten).
export async function saveHomeTextAndStyles(formData: FormData, styles: HomeTextStyles) {
  await saveDesignDraft({
    homeContentDe: parseHomeContent(formData, "de"),
    homeContentEn: parseHomeContent(formData, "en"),
    homeTextStyles: sanitizeHomeTextStyles(styles),
  });
}

export async function resetHomeContent() {
  await saveDesignDraft({ homeContentDe: null, homeContentEn: null });
}

export async function resetHomeTextStyles() {
  await saveDesignDraft({ homeTextStyles: null });
}

// ---------- Footer-Texte ----------

function parseFooterContent(formData: FormData, locale: "de" | "en"): FooterContent {
  const field = (path: string) => str(formData, `${locale}.${path}`);
  return {
    tagline: field("footer.tagline"),
    navHeading: field("footer.navHeading"),
    kontaktHeading: field("footer.kontaktHeading"),
    copyrightSuffix: field("footer.copyrightSuffix"),
    brandName: field("footer.brandName"),
    legalImpressum: field("footer.legalImpressum"),
    legalDatenschutz: field("footer.legalDatenschutz"),
    legalCookie: field("footer.legalCookie"),
  };
}

export async function saveFooterContent(formData: FormData) {
  await saveDesignDraft({
    footerContentDe: parseFooterContent(formData, "de"),
    footerContentEn: parseFooterContent(formData, "en"),
  });
}

export async function resetFooterContent() {
  await saveDesignDraft({ footerContentDe: null, footerContentEn: null });
}

// ---------- Navbar-Link-Texte ----------
//
// Nur die fünf sichtbaren Labels sind editierbar, die Ziel-Routen bleiben
// fest (s. NAV_FIELDS in fields.ts). Geteilt zwischen Header (Navbar) und
// Footer (Navigations-Spalte).

function parseNavLabels(formData: FormData, locale: "de" | "en"): NavLabels {
  const field = (path: string) => str(formData, `${locale}.${path}`);
  return {
    home: field("nav.home"),
    wohnung: field("nav.wohnung"),
    region: field("nav.region"),
    bewertungen: field("nav.bewertungen"),
    kontakt: field("nav.kontakt"),
  };
}

export async function saveNavLabels(formData: FormData) {
  await saveDesignDraft({
    navLabelsDe: parseNavLabels(formData, "de"),
    navLabelsEn: parseNavLabels(formData, "en"),
  });
}

export async function resetNavLabels() {
  await saveDesignDraft({ navLabelsDe: null, navLabelsEn: null });
}

// ---------- Individuelle Button-Gestaltung ----------
//
// Nur die drei im Design-Preview sichtbaren Buttons (BUTTON_IDS) können einen
// eigenen Stil bekommen. `saveButtonEdit` speichert Button-Stil UND (falls
// vorhanden, d. h. bei den beiden Hero-CTAs) den Button-Text in einem Zug —
// die komplette Startseiten-Text-FormData wird vom Client mitgeschickt
// (gleiches Muster wie saveHomeTextAndStyles), damit ein Klick = ein
// Entwurfs-/History-Eintrag bleibt. Ist die "an alle Buttons linken"-Checkbox
// aktiv, schreibt der Stil zusätzlich in alle drei Button-IDs sowie in den
// Default-Stil (buttonBorderWidth/…, s. o.) — das ist die einzige Stelle, an
// der der Default-Stil noch geändert werden kann, seit die frühere globale
// "Buttons"-Sektion durch die Popups pro Button ersetzt wurde.

function readOptionalBoolean(formData: FormData, name: string): boolean | undefined {
  return str(formData, name) === "true" ? true : undefined;
}

function readFontFamily(formData: FormData, name: string): string | undefined {
  const raw = str(formData, name);
  if (!raw) return undefined;
  if (!isValidFontKey(raw)) throw new Error(`Ungültige Schriftart für "${name}".`);
  return raw;
}

function readLineHeight(formData: FormData, name: string): string | undefined {
  const raw = str(formData, name);
  if (!raw) return undefined;
  if (!LINE_HEIGHT_RE.test(raw)) throw new Error(`Ungültige Zeilenhöhe für "${name}".`);
  return raw;
}

function readLetterSpacing(formData: FormData, name: string): string | undefined {
  const raw = str(formData, name);
  if (!raw) return undefined;
  if (!LETTER_SPACING_RE.test(raw)) throw new Error(`Ungültige Laufweite für "${name}".`);
  return raw;
}

function readButtonStyle(formData: FormData): ButtonStyleOverride {
  return {
    borderWidth: readCssLength(formData, "borderWidth"),
    color: readHex(formData, "color"),
    borderColor: readHex(formData, "borderColor"),
    borderRadius: readCssLength(formData, "borderRadius"),
    animation: readAnimationKey(formData, "animation"),
    bold: readOptionalBoolean(formData, "bold"),
    italic: readOptionalBoolean(formData, "italic"),
    underline: readOptionalBoolean(formData, "underline"),
    fontFamily: readFontFamily(formData, "fontFamily"),
    lineHeight: readLineHeight(formData, "lineHeight"),
    letterSpacing: readLetterSpacing(formData, "letterSpacing"),
  };
}

export async function saveButtonEdit(formData: FormData) {
  const buttonId = str(formData, "buttonId");
  if (!isValidButtonId(buttonId)) throw new Error(`Unbekannte Button-ID "${buttonId}".`);
  const linked = str(formData, "linked") === "true";
  const style = readButtonStyle(formData);

  const row = await getRow();
  const currentDraft = row.designDraft ?? publishedDesignSnapshot(row);

  const partial: Partial<DesignDraft> = {
    homeContentDe: parseHomeContent(formData, "de"),
    homeContentEn: parseHomeContent(formData, "en"),
  };

  if (linked) {
    const linkedStyles: ButtonStyles = {};
    for (const id of BUTTON_IDS) linkedStyles[id] = style;
    partial.buttonStyles = linkedStyles;
    partial.buttonsLinked = true;
    partial.buttonBorderWidth = style.borderWidth;
    partial.buttonColor = style.color;
    partial.buttonBorderColor = style.borderColor;
    partial.buttonBorderRadius = style.borderRadius;
    partial.buttonAnimation = style.animation;
  } else {
    partial.buttonStyles = { ...currentDraft.buttonStyles, [buttonId]: style };
    partial.buttonsLinked = false;
  }

  await saveDesignDraft(partial);
}

export async function resetButtonStyleForId(buttonId: string) {
  if (!isValidButtonId(buttonId)) throw new Error(`Unbekannte Button-ID "${buttonId}".`);
  const row = await getRow();
  const currentDraft = row.designDraft ?? publishedDesignSnapshot(row);
  const nextStyles = { ...currentDraft.buttonStyles };
  delete nextStyles[buttonId];
  await saveDesignDraft({ buttonStyles: nextStyles, buttonsLinked: false });
}

// ---------- Icon-Overrides (Feature-Kacheln/Schritte/Vertrauensleiste) ----------
//
// "ähnlich wie Bilder" editierbar — gleicher Upload-Mechanismus wie die
// Branding-/Startseiten-Bilder oben, aber der Zielwert ist ein Eintrag in
// einer Index->URL-Map statt einer einzelnen Spalte. Kein Blob-Aufräumen
// beim Ersetzen/Veröffentlichen (anders als bei den 4 Einzelbild-Feldern) —
// bewusste Vereinfachung für diese Session, da Icon-Uploads seltener
// vorkommen als Textänderungen; verwaiste Blobs sind ein reiner
// Speicherkosten-Nebeneffekt, kein Funktionsfehler.

type IconGroup = "feature" | "step" | "trust";

function iconOverridesField(group: IconGroup): "featureIconOverrides" | "stepIconOverrides" | "trustIconOverrides" {
  return group === "feature" ? "featureIconOverrides" : group === "step" ? "stepIconOverrides" : "trustIconOverrides";
}

async function uploadIconOverride(
  group: IconGroup,
  index: number,
  formData: FormData,
): Promise<{ url: string } | undefined> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const blob = await put(`icons/${group}-${index}-${Date.now()}-${file.name}`, file, { access: "public" });
  const field = iconOverridesField(group);
  const row = await getRow();
  const currentDraft = row.designDraft ?? publishedDesignSnapshot(row);
  const nextOverrides: IconOverrides = { ...currentDraft[field], [index]: blob.url };
  await saveDesignDraft({ [field]: nextOverrides });
  return { url: blob.url };
}

async function resetIconOverride(group: IconGroup, index: number) {
  const field = iconOverridesField(group);
  const row = await getRow();
  const currentDraft = row.designDraft ?? publishedDesignSnapshot(row);
  const nextOverrides: IconOverrides = { ...currentDraft[field] };
  delete nextOverrides[index];
  await saveDesignDraft({ [field]: nextOverrides });
}

export async function uploadFeatureIcon(index: number, formData: FormData) {
  return uploadIconOverride("feature", index, formData);
}
export async function resetFeatureIcon(index: number) {
  await resetIconOverride("feature", index);
}

export async function uploadStepIcon(index: number, formData: FormData) {
  return uploadIconOverride("step", index, formData);
}
export async function resetStepIcon(index: number) {
  await resetIconOverride("step", index);
}

export async function uploadTrustIcon(index: number, formData: FormData) {
  return uploadIconOverride("trust", index, formData);
}
export async function resetTrustIcon(index: number) {
  await resetIconOverride("trust", index);
}
