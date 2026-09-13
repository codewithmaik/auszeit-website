import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/bierp4a4", "/api", "/*/rechnung/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
