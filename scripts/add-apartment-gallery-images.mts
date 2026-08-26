import { existsSync } from "node:fs";
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

const EXTRA_IMAGES: Record<string, { url: string; alt: string }[]> = {
  rieslinghaus: [
    { url: "/images/wohnzimmer-balkon.jpg", alt: "Balkon & Moselblick" },
    { url: "/images/schlafzimmer-1.jpg", alt: "Schlafzimmer" },
    { url: "/images/badezimmer.jpg", alt: "Badezimmer" },
  ],
  "weinberg-loft": [
    { url: "/images/kueche.jpg", alt: "Küche" },
    { url: "/images/schlafzimmer-2.jpg", alt: "Schlafzimmer" },
    { url: "/images/aussenansicht.jpg", alt: "Außenansicht" },
  ],
  flussblick: [
    { url: "/images/hero-mosel.jpg", alt: "Moselblick" },
    { url: "/images/weinberge-sonnenuntergang.jpg", alt: "Weinberge bei Sonnenuntergang" },
    { url: "/images/dorfblick.jpg", alt: "Dorfblick" },
  ],
};

async function run() {
  for (const [slug, images] of Object.entries(EXTRA_IMAGES)) {
    const apartment = await db.query.apartments.findFirst({ where: eq(apartments.slug, slug) });
    if (!apartment) {
      console.log(`  -> skip ${slug}: apartment not found`);
      continue;
    }

    const existing = await db.query.apartmentImages.findMany({
      where: eq(apartmentImages.apartmentId, apartment.id),
    });
    if (existing.length > 1) {
      console.log(`  -> skip ${slug}: already has ${existing.length} images`);
      continue;
    }

    const startSortOrder = existing.length;
    for (let i = 0; i < images.length; i++) {
      await db.insert(apartmentImages).values({
        apartmentId: apartment.id,
        url: images[i].url,
        alt: images[i].alt,
        sortOrder: startSortOrder + i,
      });
    }
    console.log(`  -> added ${images.length} images to ${slug}`);
  }

  console.log("Done.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
