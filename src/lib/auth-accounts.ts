import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { adminAccount } from "@/db/schema";

/**
 * Der Kunden-Admin-Account ist ein DB-Singleton (genau 1 Zeile möglich, nicht
 * mehr per Env-Var-Hash fest verdrahtet) — der Kunde registriert ihn einmalig
 * selbst unter /admin/register. Die beiden Bierpapa/Webdev-Accounts bleiben
 * bewusst fest per Env-Var-Hash in src/auth.ts (nicht registrierbar).
 */

export async function getAdminAccount() {
  const [row] = await db.select().from(adminAccount).limit(1);
  return row ?? null;
}

export async function adminAccountExists(): Promise<boolean> {
  return (await getAdminAccount()) !== null;
}

export type CreateAdminAccountResult =
  | { ok: true }
  | { ok: false; error: string };

/** Legt den einzigen Admin-Account an — schlägt fehl, wenn bereits einer existiert. */
export async function createAdminAccount(
  email: string,
  password: string,
): Promise<CreateAdminAccountResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  if (!emailOk) return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };
  if (password.length < 8) return { ok: false, error: "Das Passwort muss mindestens 8 Zeichen lang sein." };

  if (await adminAccountExists()) {
    return { ok: false, error: "Es existiert bereits ein Admin-Account." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    // Feste id:1 statt auto-increment: ein zweiter gleichzeitiger Registrierungs-
    // versuch kollidiert so direkt mit dem Primary-Key statt auf dem vorherigen
    // (nicht-atomaren) exists-Check zu laufen — schließt die Race weitgehend.
    await db.insert(adminAccount).values({ id: 1, email: normalizedEmail, passwordHash });
    return { ok: true };
  } catch {
    return { ok: false, error: "Es existiert bereits ein Admin-Account." };
  }
}
