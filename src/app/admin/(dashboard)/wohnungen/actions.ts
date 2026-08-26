"use server";

import { eq, sql as dsql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import { db } from "@/db/client";
import { apartments, apartmentImages } from "@/db/schema";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function nextApartmentSortOrder(): Promise<number> {
  const [row] = await db
    .select({ max: dsql<number>`coalesce(max(${apartments.sortOrder}), -1)` })
    .from(apartments);
  return (row?.max ?? -1) + 1;
}

async function nextImageSortOrder(apartmentId: number): Promise<number> {
  const [row] = await db
    .select({ max: dsql<number>`coalesce(max(${apartmentImages.sortOrder}), -1)` })
    .from(apartmentImages)
    .where(eq(apartmentImages.apartmentId, apartmentId));
  return (row?.max ?? -1) + 1;
}

function readApartmentFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    sizeSqm: String(formData.get("sizeSqm") ?? "").trim(),
    guests: String(formData.get("guests") ?? "").trim(),
    bedrooms: String(formData.get("bedrooms") ?? "").trim(),
  };
}

export async function createApartment(formData: FormData) {
  const fields = readApartmentFields(formData);
  if (!fields.name) throw new Error("Name ist erforderlich.");

  const baseSlug = slugify(fields.name) || "wohnung";
  let slug = baseSlug;
  let suffix = 1;
  while (await db.query.apartments.findFirst({ where: (a, { eq }) => eq(a.slug, slug) })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const sortOrder = await nextApartmentSortOrder();
  const [created] = await db
    .insert(apartments)
    .values({ ...fields, slug, sortOrder })
    .returning();

  revalidatePath("/wohnung");
  revalidatePath("/admin/wohnungen");
  redirect(`/admin/wohnungen/${created.id}`);
}

export async function updateApartment(id: number, formData: FormData) {
  const fields = readApartmentFields(formData);
  if (!fields.name) throw new Error("Name ist erforderlich.");

  await db
    .update(apartments)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(apartments.id, id));

  revalidatePath("/wohnung");
  revalidatePath("/admin/wohnungen");
  revalidatePath(`/admin/wohnungen/${id}`);
}

export async function deleteApartment(id: number) {
  const images = await db.select().from(apartmentImages).where(eq(apartmentImages.apartmentId, id));
  for (const image of images) {
    if (image.url.startsWith("http")) {
      try {
        await del(image.url);
      } catch {
        // ignore blob deletion errors, don't block removing the record
      }
    }
  }
  await db.delete(apartments).where(eq(apartments.id, id));

  revalidatePath("/wohnung");
  revalidatePath("/admin/wohnungen");
  redirect("/admin/wohnungen");
}

export async function uploadApartmentImage(apartmentId: number, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const blob = await put(`apartments/${apartmentId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  const sortOrder = await nextImageSortOrder(apartmentId);

  await db.insert(apartmentImages).values({
    apartmentId,
    url: blob.url,
    alt: "",
    sortOrder,
  });

  revalidatePath("/wohnung");
  revalidatePath(`/admin/wohnungen/${apartmentId}`);
}

export async function deleteApartmentImage(imageId: number, apartmentId: number) {
  const [image] = await db.select().from(apartmentImages).where(eq(apartmentImages.id, imageId));
  if (image?.url.startsWith("http")) {
    try {
      await del(image.url);
    } catch {
      // ignore
    }
  }
  await db.delete(apartmentImages).where(eq(apartmentImages.id, imageId));

  revalidatePath("/wohnung");
  revalidatePath(`/admin/wohnungen/${apartmentId}`);
}

export async function moveApartmentImage(imageId: number, apartmentId: number, direction: "up" | "down") {
  const images = await db.query.apartmentImages.findMany({
    where: (img, { eq }) => eq(img.apartmentId, apartmentId),
    orderBy: (img, { asc }) => [asc(img.sortOrder)],
  });
  const index = images.findIndex((img) => img.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= images.length) return;

  const current = images[index];
  const swapWith = images[swapIndex];

  // Sequential (not wrapped in a transaction): the neon-http driver used for
  // this project's serverless queries doesn't support transactions. A
  // reorder swap is low-stakes enough that a rare interleaved write here
  // would just require re-clicking, not worth the extra complexity of the
  // websocket-based neon-serverless driver.
  await db
    .update(apartmentImages)
    .set({ sortOrder: swapWith.sortOrder })
    .where(eq(apartmentImages.id, current.id));
  await db
    .update(apartmentImages)
    .set({ sortOrder: current.sortOrder })
    .where(eq(apartmentImages.id, swapWith.id));

  revalidatePath("/wohnung");
  revalidatePath(`/admin/wohnungen/${apartmentId}`);
}
