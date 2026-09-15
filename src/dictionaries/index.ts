import "server-only";
import type { Locale } from "@/lib/i18n";
import { dictionary as de } from "./de";
import { dictionary as en } from "./en";
import type { Dictionary } from "./de";

const dictionaries: Record<Locale, Dictionary> = { de, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
