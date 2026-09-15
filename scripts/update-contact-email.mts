// One-off script to update the live contactEmail setting to the real Mosel
// business address now that the customer domain is connected. Does not touch
// the Impressum/Datenschutz text or business name/address (still placeholder
// data — Norbert Winkel/Bonn — pending the customer's real details, s.
// update-business-details.mts). Safe to delete after running once.
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

const EMAIL = "info@mosel-auszeit.de";

async function run() {
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing.length === 0) {
    console.log("No settings row found — run `npm run db:seed` instead.");
    process.exit(1);
  }

  await db
    .update(siteSettings)
    .set({ contactEmail: EMAIL, updatedAt: new Date() })
    .where(eq(siteSettings.id, existing[0].id));

  console.log(`Updated contactEmail to ${EMAIL}.`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
