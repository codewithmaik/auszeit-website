import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { locales } from "@/lib/i18n";

const ROUTES = ["", "/wohnung", "/region", "/bewertungen", "/kontakt"];
const LOW_PRIORITY_ROUTES = ["/impressum", "/datenschutz"];

function languageAlternates(route: string) {
  return Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${route}`]));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.7,
        alternates: { languages: languageAlternates(route) },
      });
    }
  }

  for (const route of LOW_PRIORITY_ROUTES) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
        alternates: { languages: languageAlternates(route) },
      });
    }
  }

  return entries;
}
