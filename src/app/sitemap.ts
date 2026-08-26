import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const ROUTES = ["", "/wohnung", "/region", "/bewertungen", "/kontakt"];
const LOW_PRIORITY_ROUTES = ["/impressum", "/datenschutz"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "" ? 1 : 0.7,
    })),
    ...LOW_PRIORITY_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
