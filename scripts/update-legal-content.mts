// One-off script to backfill the new bilingual legal content columns on an
// already-seeded database (where the settings row already exists, so the
// regular seed script's insert-only logic is a no-op). Safe to delete after
// running once; re-run scripts/seed.mts on a fresh database instead.
import { existsSync } from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const filePath = path.resolve(process.cwd(), file);
  if (existsSync(filePath)) {
    process.loadEnvFile(filePath);
  }
}

const { eq } = await import("drizzle-orm");
const { db } = await import("../src/db/client");
const { siteSettings } = await import("../src/db/schema");
const { BUSINESS } = await import("../src/lib/site");
const { impressumEn, datenschutzDe, datenschutzEn } = await import("./legal-content.mjs");

async function run() {
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing.length === 0) {
    console.log("No settings row found — run `npm run db:seed` instead.");
    process.exit(1);
  }

  await db
    .update(siteSettings)
    .set({
      impressumContentEn: impressumEn(BUSINESS.telephone, BUSINESS.email),
      datenschutzContent: datenschutzDe(),
      datenschutzContentEn: datenschutzEn(),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, existing[0].id));

  console.log("Updated settings row with the new Datenschutzerklärung (DE/EN) and Impressum (EN).");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
