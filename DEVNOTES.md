# Devnotes — laufender Stand

> Scratch-Datei für Session-Kontinuität. Wird bei größeren Unterbrechungen aktualisiert, damit eine neue Session nahtlos weitermachen kann. Kein öffentlich relevantes Doc — bei Bedarf löschen/ins .gitignore, wenn das Projekt "fertig" ist.

## Aktueller Stand (zuletzt aktualisiert: siehe git log auf diesem Branch)

**Branch:** `feature/admin-panel` (noch nicht gemerged nach `main`)
**Task:** Adminpanel für Kunde — siehe vollständigen Plan unter `.claude/plans/joyful-twirling-platypus.md` im Home-Verzeichnis der Session (falls nicht mehr vorhanden: Zusammenfassung unten reicht zum Weiterarbeiten).

## 🔴 Blocker — braucht Nutzeraktion

Die Neon-Postgres-Provisionierung über `vercel integration add neon` hängt fest an einer **rechtlichen Zustimmung**, die nur der Kontoinhaber im Browser bestätigen kann (nicht automatisierbar):

1. Öffnen: `https://vercel.com/codewithmaik/~/integrations/accept-terms/neon?source=cli`
2. Neon-Bedingungen bestätigen
3. Danach erneut ausführen:
   ```
   vercel integration add neon --name auszeit-website-11-db --non-interactive
   ```
   (mehrfach mit demselben Befehl retrybar — meldet weiterhin `action_required`, bis die Zustimmung erfolgt ist)
4. Danach: `vercel env pull .env.local` um `DATABASE_URL`/`POSTGRES_URL` lokal zu bekommen
5. Danach: `npm run db:push` (Drizzle-Schema in die DB pushen) und `npm run db:seed` (Startdaten einspielen)

**Solange dieser Blocker steht:** `npm run build` schlägt fehl, weil `src/db/client.ts` beim Modul-Import sofort wirft, wenn `DATABASE_URL` fehlt (Footer/Layout/etc. importieren `db/queries` transitiv). `npm run lint` und der TypeScript-Check laufen aber sauber durch — das ist der verlässliche Fortschritts-Indikator, solange die DB fehlt.

Vercel Blob Storage ist bereits fertig eingerichtet und verknüpft (`BLOB_READ_WRITE_TOKEN` steht in `.env.local`).

## Architektur (siehe auch Plan-Datei für Details)

- **DB:** Vercel Postgres via Neon, Drizzle ORM (`drizzle-orm/neon-http`, **kein** `db.transaction()` — der `neon-http`-Treiber unterstützt keine Transaktionen; bei `moveApartmentImage` deshalb bewusst zwei sequenzielle Updates statt Transaktion)
- **Blob:** `@vercel/blob`, Store `auszeit-website-11`, `access: public`
- **Auth:** NextAuth v5 (`next-auth@beta`), Credentials-Provider, JWT-Session, **kein** Users-Table — Admin-Identität kommt aus Env-Vars `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt-Hash). ✅ **Bereits erledigt:** `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` und `AUTH_SECRET` sind in `.env.local` **und** in allen drei Vercel-Umgebungen (production/preview/development) gesetzt.
  - Admin-Login: `maik.bock48@gmail.com`
  - Generiertes Passwort (nur einmalig im Klartext, dem User in dieser Session bereits mitgeteilt): `jSQqmvTXqVpvboLH` — steht sonst nirgends im Repo/Code, nur der bcrypt-Hash ist gespeichert. Falls verloren: neuen Hash erzeugen und `ADMIN_PASSWORD_HASH` überschreiben (`vercel env rm ADMIN_PASSWORD_HASH <env>` dann neu `add`).
- **Rendering:** Seiten, die aus der DB lesen, sind `export const dynamic = "force-dynamic"` (kein ISR bisher) + zusätzlich `revalidatePath(...)` in den Server Actions

## Was ist fertig (Code geschrieben, aber ungetestet ohne laufende DB)

- `src/db/schema.ts`, `src/db/client.ts`, `src/db/queries.ts` (getApartments, getApartment, getSiteSettings mit Fallback)
- `drizzle.config.ts`, `scripts/seed.ts` (übernimmt die alten 7 Platzhalter-Wohnungen + Kontaktdaten aus `src/lib/site.ts` + Impressum/Datenschutz-Platzhaltertexte)
- `src/auth.ts`, `src/middleware.ts` (schützt `/admin/**`), `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/admin/login/page.tsx` (außerhalb der geschützten Route-Group, damit kein Redirect-Loop)
- `src/app/admin/(dashboard)/layout.tsx` + `page.tsx` (Übersicht mit 2 Kacheln)
- `src/app/admin/(dashboard)/wohnungen/`: `page.tsx` (Liste), `neu/page.tsx`, `[id]/page.tsx` (Bearbeiten + Bilder-Galerie-Manager mit Auf/Ab/Löschen), `actions.ts` (create/update/delete Apartment, upload/delete/move Image), `ApartmentFormFields.tsx` (geteilte Formularfelder)
- `src/app/admin/(dashboard)/einstellungen/`: `page.tsx`, `actions.ts` (Kontakt + Impressum + Datenschutz in einem Formular)
- `src/components/admin/ConfirmSubmitButton.tsx` (Client-Wrapper mit `window.confirm()` für destruktive Aktionen — Wohnung löschen, Foto löschen)
- `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx` (neue öffentliche Seiten, lesen `site_settings`)
- `src/components/Footer.tsx`: liest jetzt `getSiteSettings()` (async Server Component), Impressum/Datenschutz-Links zeigen auf echte Routen, Kontaktdaten dynamisch
- `src/components/WohnungenSlider.tsx`: umgebaut auf `images: {url, alt}[]` statt einzelnem `image` — zeigt bei mehreren Fotos pro Wohnung kleine Thumbnail-Dots im aktiven Slide zum Durchklicken
- `src/app/wohnung/page.tsx`: `UNITS`-Array entfernt, liest jetzt `getApartments()`
- `src/app/kontakt/page.tsx`: `CONTACT_INFO` liest jetzt `getSiteSettings()` (Adresse/Telefon/E-Mail dynamisch, "Erreichbarkeit"-Zeile bleibt bewusst statisch — war nicht im Scope)
- `src/app/layout.tsx`: JSON-LD (`LodgingBusiness`) liest jetzt `getSiteSettings()` statt der statischen `BUSINESS`-Konstante (Adresse jetzt als ein zusammengesetzter String in `streetAddress`, da `site_settings.contactAddress` ein einzelnes Freitextfeld ist, keine getrennten Straße/PLZ/Ort-Felder)
- `src/app/sitemap.ts`: `/impressum` und `/datenschutz` ergänzt (niedrige Priorität)
- Dependencies installiert: `drizzle-orm`, `drizzle-kit`, `@vercel/blob`, `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`, `tsx`, `@neondatabase/serverless`
- `package.json` Scripts ergänzt: `db:push`, `db:studio`, `db:seed`

## Was noch fehlt (nach Behebung des Blockers)

1. Neon-Terms bestätigen lassen (User-Aktion, s. o.), dann DB provisionieren + `env pull`
2. ~~`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET` erzeugen und setzen~~ ✅ erledigt (s. oben)
3. `npm run db:push` + `npm run db:seed`
4. `npm run build` + `npm run lint` sauber durchlaufen lassen (Lint + TypeScript-Check waren zuletzt bereits sauber, auch ohne laufende DB — `npx tsc --noEmit` als Fortschritts-Proxy nutzen)
5. Kompletter Klick-Test im Browser:
   - `/admin/login` → Login mit den neuen Zugangsdaten
   - Wohnung anlegen, mehrere Fotos hochladen, Reihenfolge ändern, Foto löschen
   - `/wohnung` prüfen: Slider zeigt neue Wohnung + Thumbnail-Dots bei Mehrfachfotos
   - Wohnung löschen → verschwindet aus Slider
   - Einstellungen ändern (Adresse/Telefon/E-Mail/Impressum/Datenschutz) → Footer, `/kontakt`, `/impressum`, `/datenschutz`, JSON-LD sofort aktualisiert (ohne Redeploy, dank `revalidatePath`)
   - **Wichtig beim Testen der Lösch-Buttons per Browser-Automation:** Die Buttons nutzen `window.confirm()` — beim automatisierten Klicken NICHT über die normale Klick-Automation triggern (blockiert die Extension), stattdessen den DB-Zustand nach dem Server-Action-Aufruf direkt prüfen oder den Confirm-Dialog bewusst umgehen (z. B. Server Action separat via Testskript aufrufen, nicht über den UI-Button).
6. ~~`middleware.ts` → Deprecation-Warnung~~ ✅ erledigt, umbenannt zu `src/proxy.ts` (Next.js 16 Konvention), Warnung ist weg
7. Commit + Merge nach `main` + Push (**erst wenn User bereit zum Testen ist**, siehe Standing Instruction unten)
8. GitHub-Verknüpfung des Vercel-Projekts ist fehlgeschlagen ("Login Connection" fehlt) — für Auto-Deploy-on-Push müsste der User das einmal im Vercel-Dashboard unter Account-Settings nachholen; bis dahin nur lokal/manuell deploybar. Kein Blocker für die Admin-Panel-Fertigstellung selbst.

## Standing Instructions (aus früheren Nachrichten, gelten weiterhin)

- **Git-Workflow:** Feature-Branches pro Aufgabe, regelmäßig committen, aber **erst pushen kurz bevor der User testen will** — nicht nach jedem Commit
- Bei Bugs, die sich mit den Chrome-Automation-Tools nicht reproduzieren lassen (z. B. Screenshot-Staleness in Hintergrund-Tabs): lieber auf DOM-/Netzwerk-Ebene verifizieren statt blind Screenshots zu vertrauen — war in dieser Session mehrfach ein reines Tooling-Artefakt, kein echter Bug
- Deferred vom User: Formspree-Endpoint (noch `YOUR_FORM_ID`, mailto-Fallback aktiv) und echte Fotos statt Stock-Bilder — beides "später", nicht vergessen, aber nicht aktiv nachfragen

## Wie diese Session weitermachen

1. `vercel integration add neon --name auszeit-website-11-db --non-interactive` erneut probieren — evtl. hat der User die Freigabe zwischenzeitlich erteilt
2. Falls ja: Schritte 2–5 oben abarbeiten
3. Falls nein: User nochmal auf den offenen Blocker hinweisen, in der Zwischenzeit Code-seitig weiterarbeiten (z. B. Lint/Type-Check als Fortschrittsindikator nutzen, `middleware.ts`→`proxy.ts` Rename als kleine Nebenaufgabe)
