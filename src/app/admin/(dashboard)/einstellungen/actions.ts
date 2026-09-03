"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { resolveInvoiceSettings, type InvoiceSettings, type InvoiceTaxMode } from "@/lib/invoice";

async function ensureSettingsId(): Promise<number> {
  const existing = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (existing.length > 0) return existing[0].id;
  const [row] = await db
    .insert(siteSettings)
    .values({ contactAddress: "", contactPhone: "", contactEmail: "" })
    .returning({ id: siteSettings.id });
  return row.id;
}

export async function updateInvoiceSettings(formData: FormData) {
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const num = (k: string, fallback: number) => {
    const n = Number(String(formData.get(k) ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
  };
  const taxMode: InvoiceTaxMode =
    str("taxMode") === "regelbesteuerung" ? "regelbesteuerung" : "kleinunternehmer";

  const row = await db.query.siteSettings.findFirst();
  const current = resolveInvoiceSettings(row?.invoiceSettings ?? null);

  const next: InvoiceSettings = {
    issuerName: str("issuerName") || current.issuerName,
    issuerAddressLine: str("issuerAddressLine"),
    issuerZip: str("issuerZip"),
    issuerCity: str("issuerCity"),
    issuerCountry: str("issuerCountry") || "Deutschland",
    issuerPhone: str("issuerPhone"),
    issuerEmail: str("issuerEmail"),
    issuerWebsite: str("issuerWebsite"),
    logoUrl: str("logoUrl") || null,
    taxMode,
    taxNumber: str("taxNumber"),
    vatId: str("vatId"),
    accountHolder: str("accountHolder"),
    iban: str("iban"),
    bic: str("bic"),
    bankName: str("bankName"),
    vatRateAccommodation: num("vatRateAccommodation", 7),
    vatRateExtras: num("vatRateExtras", 19),
    invoiceNumberPrefix: str("invoiceNumberPrefix") || current.invoiceNumberPrefix,
    invoiceNumberNextSeq: Math.max(1, Math.round(num("invoiceNumberNextSeq", current.invoiceNumberNextSeq))),
    paymentTermDays: Math.max(0, Math.round(num("paymentTermDays", 14))),
    footerNote: str("footerNote"),
  };

  const id = await ensureSettingsId();
  await db
    .update(siteSettings)
    .set({ invoiceSettings: next, updatedAt: new Date() })
    .where(eq(siteSettings.id, id));

  revalidatePath("/admin/einstellungen");
  revalidatePath("/admin/posteingang");
}

export async function updateSiteSettings(formData: FormData) {
  const values = {
    contactAddress: String(formData.get("contactAddress") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    impressumContent: String(formData.get("impressumContent") ?? "").trim(),
    impressumContentEn: String(formData.get("impressumContentEn") ?? "").trim(),
    datenschutzContent: String(formData.get("datenschutzContent") ?? "").trim(),
    datenschutzContentEn: String(formData.get("datenschutzContentEn") ?? "").trim(),
  };

  const existing = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);

  if (existing.length === 0) {
    await db.insert(siteSettings).values(values);
  } else {
    await db
      .update(siteSettings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(siteSettings.id, existing[0].id));
  }

  revalidatePath("/", "layout");
  for (const locale of ["de", "en"]) {
    revalidatePath(`/${locale}/kontakt`);
    revalidatePath(`/${locale}/impressum`);
    revalidatePath(`/${locale}/datenschutz`);
  }
  revalidatePath("/admin/einstellungen");
}
