import { existsSync } from "node:fs";
import path from "node:path";
import type { BookingRequestStatus } from "../src/db/schema";

for (const file of [".env.local", ".env"]) {
  const filePath = path.resolve(process.cwd(), file);
  if (existsSync(filePath)) {
    process.loadEnvFile(filePath);
  }
}

const { db } = await import("../src/db/client");
const { apartments, apartmentImages, siteSettings, bookingRequests, calendarDays } = await import(
  "../src/db/schema"
);
const { BUSINESS } = await import("../src/lib/site");
const { dateRange } = await import("../src/lib/booking");

const UNITS = [
  {
    slug: "rieslinghaus",
    name: "Rieslinghaus",
    image: "/images/wohnbereich.jpg",
    size: "60 m²",
    guests: "4 Gäste",
    bedrooms: "2 Schlafzimmer",
    text: "Unsere Flaggschiff-Wohnung mit privatem Balkon und freiem Blick auf Weinberge und Fluss — lichtdurchflutet, modern eingerichtet und mit viel Liebe zum Detail.",
  },
  {
    slug: "weinberg-loft",
    name: "Weinberg-Loft",
    image: "/images/wohnung-loft.jpg",
    size: "45 m²",
    guests: "2 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Ein puristisches Loft für alle, die es modern mögen — offener Wohnbereich, klare Linien und ruhige Farben. Perfekt für Paare, die einfach mal abschalten wollen.",
  },
  {
    slug: "flussblick",
    name: "Flussblick",
    image: "/images/wohnung-flussblick.jpg",
    size: "55 m²",
    guests: "3 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Helle, freundliche Räume mit skandinavischem Einrichtungsstil. Große Fenster lassen den Tag lange in die Wohnung — ideal für einen entspannten Kurzurlaub.",
  },
  {
    slug: "winzerstube",
    name: "Winzerstube",
    image: "/images/wohnung-winzerstube.jpg",
    size: "50 m²",
    guests: "3 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Warme Farben und gemütliche Details erinnern an eine klassische Winzerstube — hier lässt es sich nach einem Tag in den Weinbergen wunderbar zur Ruhe kommen.",
  },
  {
    slug: "sonnenterrasse",
    name: "Sonnenterrasse",
    image: "/images/wohnung-sonnenterrasse.jpg",
    size: "65 m²",
    guests: "4 Gäste",
    bedrooms: "2 Schlafzimmer",
    text: "Lichtdurchflutet und großzügig geschnitten, mit einer besonders großen Terrasse — der perfekte Ort für gemeinsame Frühstücke und laue Sommerabende.",
  },
  {
    slug: "turmzimmer",
    name: "Turmzimmer",
    image: "/images/wohnung-turmzimmer.jpg",
    size: "70 m²",
    guests: "5 Gäste",
    bedrooms: "3 Schlafzimmer",
    text: "Unsere außergewöhnlichste Wohnung über zwei Ebenen mit offener Treppe — viel Platz für Familien oder kleine Gruppen, die zusammen die Mosel entdecken möchten.",
  },
  {
    slug: "fachwerk-idylle",
    name: "Fachwerk-Idylle",
    image: "/images/wohnung-fachwerk-idylle.jpg",
    size: "48 m²",
    guests: "2 Gäste",
    bedrooms: "1 Schlafzimmer",
    text: "Historischer Charme trifft modernen Komfort: sichtbare Holzbalken und warme Materialien machen diese Wohnung zu einem besonders stimmungsvollen Rückzugsort.",
  },
];

const { impressumDe, impressumEn, datenschutzDe, datenschutzEn } = await import("./legal-content.mjs");

const IMPRESSUM_PLACEHOLDER = impressumDe(BUSINESS.telephone, BUSINESS.email);
const IMPRESSUM_PLACEHOLDER_EN = impressumEn(BUSINESS.telephone, BUSINESS.email);
const DATENSCHUTZ_PLACEHOLDER = datenschutzDe();
const DATENSCHUTZ_PLACEHOLDER_EN = datenschutzEn();

// Dummy-Buchungsanfragen für den Posteingang — das Kontaktformular sendet
// noch nicht produktiv, daher hier Beispieldaten für UI/UX-Zwecke.
function inDays(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split("T")[0];
}

const DUMMY_REQUESTS: {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
  status: BookingRequestStatus;
}[] = [
  {
    name: "Familie Weber",
    email: "weber.familie@example.com",
    phone: "+49 151 23456789",
    checkIn: inDays(17),
    checkOut: inDays(21),
    guests: "4 Gäste",
    message: "Gibt es einen Kinderhochstuhl, den wir ausleihen könnten?",
    status: "neu",
  },
  {
    name: "Jonas Klein",
    email: "jonas.klein@example.com",
    phone: "+49 160 9988776",
    checkIn: inDays(32),
    checkOut: inDays(34),
    guests: "2 Gäste",
    message: "Wir würden gerne einen späten Check-in gegen 21 Uhr machen, ist das möglich?",
    status: "neu",
  },
  {
    name: "Familie Schneider",
    email: "schneider@example.com",
    phone: "+49 172 1122334",
    checkIn: inDays(7),
    checkOut: inDays(11),
    guests: "3 Gäste",
    message: "Wir freuen uns schon sehr auf den Aufenthalt!",
    status: "gebucht",
  },
  {
    name: "Michael Müller",
    email: "m.mueller@example.com",
    phone: "+49 176 5544332",
    checkIn: inDays(12),
    checkOut: inDays(14),
    guests: "2 Gäste",
    message: "Ist ein Haustier (kleiner Hund) erlaubt?",
    status: "abgelehnt",
  },
];

async function seed() {
  console.log("Seeding site_settings…");
  const existingSettings = await db.select().from(siteSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(siteSettings).values({
      contactAddress: `${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}`,
      contactPhone: BUSINESS.telephone,
      contactEmail: BUSINESS.email,
      impressumContent: IMPRESSUM_PLACEHOLDER,
      impressumContentEn: IMPRESSUM_PLACEHOLDER_EN,
      datenschutzContent: DATENSCHUTZ_PLACEHOLDER,
      datenschutzContentEn: DATENSCHUTZ_PLACEHOLDER_EN,
    });
    console.log("  -> inserted default settings row");
  } else {
    console.log("  -> settings row already exists, skipping");
  }

  console.log("Seeding apartments…");
  const existingApartments = await db.select().from(apartments).limit(1);
  if (existingApartments.length > 0) {
    console.log("  -> apartments already exist, skipping");
  } else {
    for (let i = 0; i < UNITS.length; i++) {
      const unit = UNITS[i];
      const [inserted] = await db
        .insert(apartments)
        .values({
          slug: unit.slug,
          name: unit.name,
          description: unit.text,
          sizeSqm: unit.size,
          guests: unit.guests,
          bedrooms: unit.bedrooms,
          sortOrder: i,
        })
        .returning();
      await db.insert(apartmentImages).values({
        apartmentId: inserted.id,
        url: unit.image,
        alt: unit.name,
        sortOrder: 0,
      });
      console.log(`  -> inserted ${unit.name}`);
    }
  }

  console.log("Seeding booking_requests (Posteingang-Dummy-Daten)…");
  const existingRequests = await db.select().from(bookingRequests).limit(1);
  if (existingRequests.length > 0) {
    console.log("  -> booking_requests already exist, skipping");
  } else {
    for (const req of DUMMY_REQUESTS) {
      const [inserted] = await db.insert(bookingRequests).values(req).returning();
      if (req.status === "gebucht") {
        const days = dateRange(req.checkIn, req.checkOut);
        await db.insert(calendarDays).values(
          days.map((date) => ({
            date,
            guestName: req.name,
            guestEmail: req.email,
            guestPhone: req.phone,
            guests: req.guests,
            note: req.message,
            bookingRequestId: inserted.id,
          })),
        );
      }
      console.log(`  -> inserted request from ${req.name} (${req.status})`);
    }
  }

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
