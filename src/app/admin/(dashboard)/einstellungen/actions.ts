"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

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
