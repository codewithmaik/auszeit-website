// One-off script to fill in the real business/legal details (name, address,
// phone, fax, email, VAT ID) that were previously bracketed placeholders in
// the seeded Impressum & Datenschutzerklärung, and to update the site-wide
// contact fields used in the Footer, Kontakt page, and JSON-LD metadata.
// Safe to delete after running once.
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
const { datenschutzDe, datenschutzEn } = await import("./legal-content.mjs");

const NAME = "Norbert Winkel";
const STREET = "Annaberger Str. 231";
const POSTAL_CODE = "53175";
const CITY = "Bonn";
const PHONE = "0228-28695499";
const FAX = "0228-28695498";
const EMAIL = "info@luxury-apartments-bonn.com";
const VAT_ID = "DE296770621";
const TODAY_DE = "26. August 2026";
const TODAY_EN = "26 August 2026";

const IMPRESSUM_DE = `Angaben gemäß § 5 TMG

${NAME}
${STREET}
${POSTAL_CODE} ${CITY}

Kontakt:
Telefon: ${PHONE}
Fax: ${FAX}
E-Mail: ${EMAIL}

Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
${VAT_ID}`;

const IMPRESSUM_EN = `Information according to § 5 of the German Telemedia Act (TMG)

${NAME}
${STREET}
${POSTAL_CODE} ${CITY}, Germany

Contact:
Phone: ${PHONE}
Fax: ${FAX}
Email: ${EMAIL}

VAT identification number according to § 27a of the German VAT Act:
${VAT_ID}

This is a courtesy translation. As a German legal notice ("Impressum"), the German version is authoritative.`;

const DATENSCHUTZ_DE = datenschutzDe()
  .replace("Stand: [Datum einfügen]", `Stand: ${TODAY_DE}`)
  .replace(
    "[Firmierung / Name]\n[Straße und Hausnummer]\n[PLZ und Ort]\nE-Mail: [E-Mail-Adresse, siehe Impressum]",
    `${NAME}\n${STREET}\n${POSTAL_CODE} ${CITY}\nE-Mail: ${EMAIL}`,
  );

const DATENSCHUTZ_EN = datenschutzEn()
  .replace("Last updated: [insert date]", `Last updated: ${TODAY_EN}`)
  .replace(
    "[Company / Owner name]\n[Street and house number]\n[Postal code and city]\nEmail: [see legal notice]",
    `${NAME}\n${STREET}\n${POSTAL_CODE} ${CITY}, Germany\nEmail: ${EMAIL}`,
  );

async function run() {
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing.length === 0) {
    console.log("No settings row found — run `npm run db:seed` instead.");
    process.exit(1);
  }

  await db
    .update(siteSettings)
    .set({
      contactAddress: `${STREET}, ${POSTAL_CODE} ${CITY}`,
      contactPhone: PHONE,
      contactEmail: EMAIL,
      impressumContent: IMPRESSUM_DE,
      impressumContentEn: IMPRESSUM_EN,
      datenschutzContent: DATENSCHUTZ_DE,
      datenschutzContentEn: DATENSCHUTZ_EN,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, existing[0].id));

  console.log("Updated settings row with the real business details.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
