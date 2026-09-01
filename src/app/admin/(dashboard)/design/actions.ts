"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import {
  FEATURE_KEYS,
  publishedDesignSnapshot,
  type HomeContent,
  type HomeTextStyles,
  type DesignDraft,
} from "@/db/home-content";
import { BUSINESS } from "@/lib/site";
import { isValidFontKey } from "@/lib/fonts";

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
