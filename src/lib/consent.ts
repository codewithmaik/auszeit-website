// Client-only consent state. `necessary` is always true and not user-facing;
// `maps` gates the embedded Google Maps iframes (the only non-essential,
// consent-requiring technology this site currently uses).
export type ConsentState = { necessary: true; maps: boolean };

const STORAGE_KEY = "auszeit-cookie-consent";
export const CONSENT_EVENT = "auszeit-consent-changed";
export const OPEN_SETTINGS_EVENT = "auszeit-open-cookie-settings";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.maps === "boolean") return { necessary: true, maps: parsed.maps };
    return null;
  } catch {
    return null;
  }
}

export function setConsent(maps: boolean) {
  if (typeof window === "undefined") return;
  const state: ConsentState = { necessary: true, maps };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, disabled storage) — consent
    // just won't persist across visits, which degrades gracefully to
    // asking again next time rather than breaking anything.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

// For useSyncExternalStore: lets components read consent without a
// setState-in-effect flash (and the hydration mismatch that would cause,
// since the value differs between server and client).
export function subscribeConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}

export function getConsentSnapshot(): ConsentState | null {
  return getConsent();
}

export function getServerConsentSnapshot(): ConsentState | null {
  return null;
}
