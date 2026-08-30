"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { FEATURE_KEYS, type HomeContent, type HomeTextStyles } from "@/db/home-content";
import { BUSINESS } from "@/lib/site";

const HEX_RE = /^#[0-9a-f]{6}$/i;

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

async function updateSettings(values: SettingsUpdate) {
  const id = await ensureSettingsId();
  await db
    .update(siteSettings)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(siteSettings.id, id));
}

function revalidateDesign() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/design");
}

// ---------- Branding- & Startseiten-Bilder ----------

type ImageColumn = "logoImageUrl" | "logoTextImageUrl" | "homeHeroImageUrl" | "homeWohlfuehlImageUrl";

async function uploadSiteImage(
  column: ImageColumn,
  blobFolder: string,
  formData: FormData,
): Promise<{ url: string } | undefined> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const [current] = await db.select().from(siteSettings).limit(1);
  const previousUrl = current?.[column];

  const blob = await put(`${blobFolder}/${Date.now()}-${file.name}`, file, { access: "public" });
  await updateSettings({ [column]: blob.url });

  if (previousUrl?.startsWith("http")) {
    try {
      await del(previousUrl);
    } catch {
      // ignore blob deletion errors, don't block the swap
    }
  }

  revalidateDesign();
  return { url: blob.url };
}

async function resetSiteImage(column: ImageColumn) {
  const [current] = await db.select().from(siteSettings).limit(1);
  const previousUrl = current?.[column];

  await updateSettings({ [column]: null });

  if (previousUrl?.startsWith("http")) {
    try {
      await del(previousUrl);
    } catch {
      // ignore
    }
  }

  revalidateDesign();
}

export async function uploadLogoImage(formData: FormData) {
  await uploadSiteImage("logoImageUrl", "branding", formData);
}
export async function resetLogoImage() {
  await resetSiteImage("logoImageUrl");
}

export async function uploadLogoTextImage(formData: FormData) {
  await uploadSiteImage("logoTextImageUrl", "branding", formData);
}
export async function resetLogoTextImage() {
  await resetSiteImage("logoTextImageUrl");
}

export async function uploadHomeHeroImage(formData: FormData) {
  return uploadSiteImage("homeHeroImageUrl", "home", formData);
}
export async function resetHomeHeroImage() {
  await resetSiteImage("homeHeroImageUrl");
}

export async function uploadHomeWohlfuehlImage(formData: FormData) {
  return uploadSiteImage("homeWohlfuehlImageUrl", "home", formData);
}
export async function resetHomeWohlfuehlImage() {
  await resetSiteImage("homeWohlfuehlImageUrl");
}

// ---------- Farbpalette ----------

function readHex(formData: FormData, name: string): string | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  if (!HEX_RE.test(raw)) throw new Error(`Ungültiger Hex-Farbwert für "${name}".`);
  return raw;
}

export async function saveThemeColors(formData: FormData) {
  await updateSettings({
    themePrimary: readHex(formData, "themePrimary"),
    themePrimaryDark: readHex(formData, "themePrimaryDark"),
    themeAccent: readHex(formData, "themeAccent"),
    themeBackground: readHex(formData, "themeBackground"),
  });
  revalidateDesign();
}

export async function resetThemeColors() {
  await updateSettings({
    themePrimary: null,
    themePrimaryDark: null,
    themeAccent: null,
    themeBackground: null,
  });
  revalidateDesign();
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

export async function saveHomeContent(formData: FormData) {
  await updateSettings({
    homeContentDe: parseHomeContent(formData, "de"),
    homeContentEn: parseHomeContent(formData, "en"),
  });
  revalidateDesign();
}

export async function resetHomeContent() {
  await updateSettings({ homeContentDe: null, homeContentEn: null });
  revalidateDesign();
}

// ---------- Startseiten-Textstile (Schriftgröße/-farbe je Feld) ----------

const FONT_SIZE_RE = /^\d+(\.\d+)?rem$/;

function sanitizeHomeTextStyles(styles: HomeTextStyles): HomeTextStyles {
  const clean: HomeTextStyles = {};
  for (const [path, override] of Object.entries(styles)) {
    if (!override || typeof path !== "string") continue;
    const entry: { fontSize?: string; color?: string } = {};
    if (typeof override.fontSize === "string" && FONT_SIZE_RE.test(override.fontSize)) {
      entry.fontSize = override.fontSize;
    }
    if (typeof override.color === "string" && HEX_RE.test(override.color)) {
      entry.color = override.color;
    }
    if (entry.fontSize || entry.color) clean[path] = entry;
  }
  return clean;
}

export async function saveHomeTextStyles(styles: HomeTextStyles) {
  await updateSettings({ homeTextStyles: sanitizeHomeTextStyles(styles) });
  revalidateDesign();
}

export async function resetHomeTextStyles() {
  await updateSettings({ homeTextStyles: null });
  revalidateDesign();
}
