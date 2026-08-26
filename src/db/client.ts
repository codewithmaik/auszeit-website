import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

export const isDatabaseConfigured = Boolean(connectionString);

if (!isDatabaseConfigured) {
  console.warn(
    "[db] DATABASE_URL is not set — falling back to a non-functional placeholder connection. " +
      "Pages that read from the database will show fallback content until it's configured. See DEVNOTES.md.",
  );
}

// Neon's HTTP driver only opens a connection when a query actually runs, so
// constructing it with a syntactically-valid placeholder is safe when the
// real connection string isn't configured yet — it lets the app boot and
// render pages that don't touch the DB, instead of crashing at import time.
const sql = neon(connectionString ?? "postgres://user:password@localhost:5432/placeholder");
export const db = drizzle(sql, { schema });
