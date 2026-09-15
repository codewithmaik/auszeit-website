"use client";

import { openCookieSettings } from "@/lib/consent";

export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="hover:text-gold cursor-pointer underline-offset-2 hover:underline"
    >
      {label}
    </button>
  );
}
