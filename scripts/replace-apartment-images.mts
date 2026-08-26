import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const filePath = path.resolve(process.cwd(), file);
  if (existsSync(filePath)) {
    process.loadEnvFile(filePath);
  }
}

const { db } = await import("../src/db/client");
const { apartments, apartmentImages } = await import("../src/db/schema");
const { eq } = await import("drizzle-orm");

const APARTMENTS: { slug: string; alt: string }[] = [
  { slug: "rieslinghaus", alt: "Rieslinghaus" },
  { slug: "weinberg-loft", alt: "Weinberg-Loft" },
  { slug: "flussblick", alt: "Flussblick" },
];

async function run() {
  for (const { slug, alt } of APARTMENTS) {
    const apartment = await db.query.apartments.findFirst({ where: eq(apartments.slug, slug) });
    if (!apartment) {
      console.log(`  -> skip ${slug}: apartment not found`);
      continue;
    }

    const dir = path.resolve(process.cwd(), "public/images/apartments", slug);
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".jpg") && f !== "titelbild.jpg")
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const urls = [`/images/apartments/${slug}/titelbild.jpg`, ...files.map((f) => `/images/apartments/${slug}/${f}`)];

    await db.delete(apartmentImages).where(eq(apartmentImages.apartmentId, apartment.id));

    for (let i = 0; i < urls.length; i++) {
      await db.insert(apartmentImages).values({
        apartmentId: apartment.id,
        url: urls[i],
        alt: i === 0 ? alt : `${alt} – Foto ${i + 1}`,
        sortOrder: i,
      });
    }
    console.log(`  -> ${slug}: replaced with ${urls.length} images (1 titelbild + ${urls.length - 1} gallery)`);
  }

  console.log("Done.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
