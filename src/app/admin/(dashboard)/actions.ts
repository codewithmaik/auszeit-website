"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { FACTORY_SETTINGS } from "@/lib/factory-defaults";

// Werkseinstellungen-Reset: setzt Design (Farben, Logo, Startseiten-Bilder/-Texte)
// und die Einstellungen-Seite (Kontakt, Impressum, Datenschutz) auf den Stand
// zurück, wie wir ihn deployed haben. Bewusst OHNE die Wohnungen-Tabelle — die
// enthält echte, vom Kunden gepflegte Inhalte (Fotos, Beschreibungen), für die
// es keinen sinnvollen "Werkszustand" gibt, ohne echten Content zu zerstören.
export async function resetToFactorySettings() {
  const [current] = await db.select().from(siteSettings).limit(1);

  const imageUrls = [
    current?.logoImageUrl,
    current?.logoTextImageUrl,
    current?.homeHeroImageUrl,
    current?.homeWohlfuehlImageUrl,
  ];
  for (const url of imageUrls) {
    if (url?.startsWith("http")) {
      try {
        await del(url);
      } catch {
        // ignore blob deletion errors, don't block the reset
      }
    }
  }

  const values = {
    ...FACTORY_SETTINGS,
    logoImageUrl: null,
    logoTextImageUrl: null,
    themePrimary: null,
    themePrimaryDark: null,
    themeAccent: null,
    themeBackground: null,
    homeHeroImageUrl: null,
    homeWohlfuehlImageUrl: null,
    homeContentDe: null,
    homeContentEn: null,
    updatedAt: new Date(),
  };

  if (current) {
    await db.update(siteSettings).set(values).where(eq(siteSettings.id, current.id));
  } else {
    await db.insert(siteSettings).values(values);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/design");
  revalidatePath("/admin/einstellungen");
  for (const locale of ["de", "en"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/kontakt`);
    revalidatePath(`/${locale}/impressum`);
    revalidatePath(`/${locale}/datenschutz`);
  }
}
