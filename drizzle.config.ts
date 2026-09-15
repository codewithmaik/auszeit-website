import { defineConfig } from "drizzle-kit";

// drizzle-kit lädt .env-Dateien nicht selbst — .env.local hier explizit laden
// (Node ≥ 20.12), damit `npm run db:push` ohne vorheriges `source .env.local`
// funktioniert.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local fehlt (z. B. CI) — dann greifen die vorhandenen process.env-Werte.
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "",
  },
});
