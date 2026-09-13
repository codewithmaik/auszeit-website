export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Builds a locale-prefixed href, e.g. localeHref("en", "/kontakt#buchen") -> "/en/kontakt#buchen". */
export function localeHref(locale: Locale, path: string): string {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/** Builds the `alternates.languages` map for generateMetadata (hreflang tags), e.g.
 * localeAlternates("/kontakt") -> { de: "/de/kontakt", en: "/en/kontakt", "x-default": "/de/kontakt" }. */
export function localeAlternates(path: string): Record<string, string> {
  const byLocale = Object.fromEntries(locales.map((l) => [l, localeHref(l, path)]));
  return { ...byLocale, "x-default": localeHref(defaultLocale, path) };
}

/** Swaps the leading /de or /en segment of a pathname for the target locale. */
export function swapLocale(pathname: string, target: Locale): string {
  const rest = pathname.replace(/^\/(de|en)(?=\/|$)/, "");
  return rest === "" ? `/${target}` : `/${target}${rest}`;
}

/** Interpolates a dictionary template like "Photo {i} of {total}" — used instead of
 * function-valued dictionary entries, which can't cross the server/client boundary. */
export function formatTemplate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}
