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
    datenschutzContent: String(formData.get("datenschutzContent") ?? "").trim(),
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
  revalidatePath("/kontakt");
  revalidatePath("/impressum");
  revalidatePath("/datenschutz");
  revalidatePath("/admin/einstellungen");
}
