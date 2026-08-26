# Devnotes — laufender Stand

> Scratch-Datei für Session-Kontinuität. Wird bei größeren Unterbrechungen aktualisiert, damit eine neue Session nahtlos weitermachen kann. Kein öffentlich relevantes Doc — bei Bedarf löschen/ins .gitignore, wenn das Projekt "fertig" ist.

## Aktueller Stand

**Branch:** `feature/admin-panel` (noch nicht gemerged nach `main`, noch nicht gepusht)
**Task:** Adminpanel für Kunde — voller Plan ggf. unter `.claude/plans/joyful-twirling-platypus.md` (session-lokal, evtl. nicht mehr vorhanden — diese Datei hier reicht zum Weiterarbeiten).
**Dev-Server:** lief zuletzt auf `localhost:3000`, Seite ist voll browsbar (siehe "Graceful Fallback" unten) — falls nicht mehr aktiv: `npm run dev`.

## 🔴 Blocker — braucht Nutzeraktion (Stand: zuletzt erneut geprüft, weiterhin offen)

Die Neon-Postgres-Provisionierung über `vercel integration add neon` hängt an einer **rechtlichen Zustimmung**, die nur der Kontoinhaber im Browser bestätigen kann (nicht automatisierbar):

1. Öffnen: `https://vercel.com/codewithmaik/~/integrations/accept-terms/neon?source=cli`
2. Neon-Bedingungen bestätigen
3. Danach erneut ausführen:
   ```
   vercel integration add neon --name auszeit-website-11-db --non-interactive
   ```
   (beliebig oft retrybar — meldet weiterhin `action_required`, bis die Zustimmung erfolgt ist; in dieser Session mehrfach über die Zeit verteilt geprüft, jedes Mal noch offen)
4. Danach: `vercel env pull .env.local` um `DATABASE_URL`/`POSTGRES_URL` lokal zu bekommen
5. Danach: `npm run db:push` (Drizzle-Schema in die DB pushen) und `npm run db:seed` (Startdaten einspielen)

Vercel Blob Storage ist bereits fertig eingerichtet und verknüpft (`BLOB_READ_WRITE_TOKEN` steht in `.env.local` + allen drei Vercel-Umgebungen).

## ✅ Graceful Fallback ohne DB (neu, wichtig!)

`npm run build` schlägt **nicht mehr** fehl, wenn `DATABASE_URL` fehlt — das wurde bewusst behoben:
- `src/db/client.ts`: wirft nicht mehr beim Modul-Import; baut stattdessen mit einem syntaktisch validen Platzhalter-Connection-String (Neon HTTP-Treiber verbindet erst bei tatsächlicher Query, nicht beim Konstruieren)
- `src/db/queries.ts`: jede Funktion (`getApartments`, `getApartment`, `getSiteSettings`) hat try/catch + `isDatabaseConfigured`-Fast-Path → liefert leere Liste / `undefined` / Default-Settings statt zu crashen
- `src/app/wohnung/page.tsx`: zeigt bei 0 Wohnungen jetzt eine freundliche Platzhalter-Sektion ("Unsere Wohnungen werden gerade aktualisiert" + Anfragen-Button) statt die Slider-Sektion komplett zu verstecken

**Das heißt:** `npm run build` ist wieder ein verlässlicher Gesamt-Fortschrittsindikator (nicht mehr nur Lint/`tsc --noEmit`). Die komplette öffentliche Seite läuft bereits jetzt lokal, nur eben mit leeren/Default-Inhalten statt echter DB-Daten, bis Neon verbunden ist.

## Architektur

- **DB:** Vercel Postgres via Neon, Drizzle ORM (`drizzle-orm/neon-http`, **kein** `db.transaction()` — der Treiber unterstützt keine Transaktionen; bei `moveApartmentImage` deshalb bewusst zwei sequenzielle Updates statt Transaktion)
- **Blob:** `@vercel/blob`, Store `auszeit-website-11`, `access: public`
- **Auth:** NextAuth v5 (`next-auth@beta`), Credentials-Provider, JWT-Session, **kein** Users-Table — Admin-Identität kommt aus Env-Vars `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt-Hash). ✅ Gesetzt in `.env.local` **und** allen drei Vercel-Umgebungen.
  - Admin-Login: `maik.bock48@gmail.com`
  - Generiertes Passwort (Klartext nur hier + einmalig im Chat genannt): `jSQqmvTXqVpvboLH` — im Repo/Code steht nur der bcrypt-Hash. Falls geändert werden soll: neuen Hash erzeugen (`node -e "console.log(require('bcryptjs').hashSync('NEUES-PW', 10))"`), dann `vercel env rm ADMIN_PASSWORD_HASH <env>` + neu `add` für production/preview/development, plus `.env.local` anpassen.
  - Login selbst funktioniert bereits jetzt (prüft nur Env-Vars, keine DB nötig) — aber jede Admin-Aktion, die speichert (Wohnung anlegen/bearbeiten, Foto hochladen, Einstellungen speichern), schlägt ohne DB fehl (`db.insert`/`update` in den Server Actions haben bewusst **kein** Fallback, da ein "erfolgreiches" Speichern ohne Persistenz irreführend wäre)
- **Rendering:** Seiten, die aus der DB lesen, sind `export const dynamic = "force-dynamic"` (kein ISR bisher) + zusätzlich `revalidatePath(...)` in den Server Actions

## Was ist fertig

- `src/db/schema.ts`, `src/db/client.ts`, `src/db/queries.ts` (inkl. Graceful Fallback, s. o.)
- `drizzle.config.ts`, `scripts/seed.ts` (übernimmt die alten 7 Platzhalter-Wohnungen + Kontaktdaten aus `src/lib/site.ts` + Impressum/Datenschutz-Platzhaltertexte)
- `src/auth.ts`, `src/proxy.ts` (umbenannt von `middleware.ts` — Next.js 16 Konvention, Deprecation-Warnung dadurch weg), `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/admin/login/page.tsx` (außerhalb der geschützten Route-Group, damit kein Redirect-Loop)
- `src/app/admin/(dashboard)/layout.tsx` + `page.tsx` (Übersicht mit 2 Kacheln)
- `src/app/admin/(dashboard)/wohnungen/`: `page.tsx` (Liste), `neu/page.tsx`, `[id]/page.tsx` (Bearbeiten + Bilder-Galerie-Manager mit Auf/Ab/Löschen), `actions.ts` (create/update/delete Apartment, upload/delete/move Image), `ApartmentFormFields.tsx` (geteilte Formularfelder)
- `src/app/admin/(dashboard)/einstellungen/`: `page.tsx`, `actions.ts` (Kontakt + Impressum + Datenschutz in einem Formular)
- `src/components/admin/ConfirmSubmitButton.tsx` (Client-Wrapper mit `window.confirm()` für destruktive Aktionen — Wohnung löschen, Foto löschen)
- `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx` (neue öffentliche Seiten, lesen `site_settings`)
- `src/components/Footer.tsx`: liest `getSiteSettings()` (async Server Component), Impressum/Datenschutz-Links zeigen auf echte Routen, Kontaktdaten dynamisch
- `src/components/WohnungenSlider.tsx`: `images: {url, alt}[]` statt einzelnem `image` — Thumbnail-Dots im aktiven Slide bei mehreren Fotos
- `src/app/wohnung/page.tsx`: liest `getApartments()`, freundlicher Empty-State (s. o.)
- `src/app/kontakt/page.tsx`: `CONTACT_INFO` liest `getSiteSettings()` ("Erreichbarkeit"-Zeile bleibt bewusst statisch, war nicht im Scope)
- `src/app/layout.tsx`: JSON-LD (`LodgingBusiness`) liest `getSiteSettings()` statt der statischen `BUSINESS`-Konstante
- `src/app/sitemap.ts`: `/impressum` und `/datenschutz` ergänzt (niedrige Priorität)
- `src/components/PageHero.tsx`: Titelgröße reduziert auf `clamp(2rem,3.6vw,2.9rem)` (war zu groß, User-Feedback)
- Dependencies installiert: `drizzle-orm`, `drizzle-kit`, `@vercel/blob`, `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`, `tsx`, `@neondatabase/serverless`
- `package.json` Scripts ergänzt: `db:push`, `db:studio`, `db:seed`
- `npm run lint`, `npx tsc --noEmit` und `npm run build` laufen alle drei sauber durch

## Was noch fehlt (in dieser Reihenfolge)

1. Neon-Terms bestätigen lassen (User-Aktion, s. o.) — **einziger echter Blocker**
2. `vercel env pull .env.local`
3. `npm run db:push` + `npm run db:seed`
4. `npm run build` erneut laufen lassen — sollte jetzt ohne die `[db] DATABASE_URL is not set …`-Warnungen durchlaufen
5. Kompletter Klick-Test im Browser:
   - `/admin/login` → Login mit den Zugangsdaten oben
   - Wohnung anlegen, mehrere Fotos hochladen, Reihenfolge ändern, Foto löschen
   - `/wohnung` prüfen: Slider zeigt die Wohnung(en) + Thumbnail-Dots bei Mehrfachfotos (Empty-State-Meldung sollte verschwinden)
   - Wohnung löschen → verschwindet aus Slider, Empty-State kommt wieder falls es die letzte war
   - Einstellungen ändern (Adresse/Telefon/E-Mail/Impressum/Datenschutz) → Footer, `/kontakt`, `/impressum`, `/datenschutz`, JSON-LD sofort aktualisiert (ohne Redeploy, dank `revalidatePath`)
   - **Wichtig beim Testen der Lösch-Buttons per Browser-Automation:** Die Buttons nutzen `window.confirm()` — beim automatisierten Klicken NICHT über die normale Klick-Automation triggern (blockiert die Extension), stattdessen den DB-Zustand nach dem Server-Action-Aufruf direkt prüfen oder die Server Action separat aufrufen statt über den UI-Button
6. Seed-Daten sind reine Platzhalter (alte 7 Fantasie-Wohnungen, generischer Impressum/Datenschutz-Hinweistext) — Kunde muss diese über das Adminpanel selbst durch echte Inhalte ersetzen, keine weitere Aktion meinerseits nötig
7. Commit + Merge nach `main` + Push (**erst wenn User bereit zum Testen ist**, siehe Standing Instruction unten)
8. GitHub-Verknüpfung des Vercel-Projekts ist fehlgeschlagen ("Login Connection" fehlt) — für Auto-Deploy-on-Push müsste der User das einmal im Vercel-Dashboard unter Account-Settings nachholen; kein Blocker für die Admin-Panel-Fertigstellung selbst, nur für automatisches Deployment

## Standing Instructions (gelten weiterhin, unabhängig vom Adminpanel-Task)

- **Git-Workflow:** Feature-Branches pro Aufgabe, regelmäßig committen, aber **erst pushen kurz bevor der User testen will** — nicht nach jedem Commit
- Bei Bugs, die sich mit den Chrome-Automation-Tools nicht reproduzieren lassen (z. B. Screenshot-Staleness in Hintergrund-Tabs): lieber auf DOM-/Netzwerk-Ebene verifizieren statt blind Screenshots zu vertrauen — war in dieser Session mehrfach ein reines Tooling-Artefakt, kein echter Bug
- Deferred vom User: Formspree-Endpoint (noch `YOUR_FORM_ID`, mailto-Fallback aktiv) und echte Fotos statt Stock-Bilder — beides "später", nicht vergessen, aber nicht aktiv nachfragen

## Wie eine neue Session weitermachen sollte

1. `vercel integration add neon --name auszeit-website-11-db --non-interactive` erneut probieren — evtl. hat der User die Freigabe zwischenzeitlich erteilt
2. Falls ja: Schritte 2–5 oben ("Was noch fehlt") abarbeiten
3. Falls nein: User kurz auf den weiterhin offenen Blocker hinweisen (Link s. o.), ansonsten läuft die Seite bereits vollständig lokal browsbar mit Platzhalter-/Default-Inhalten — kann in der Zwischenzeit für weiteres UI-Feedback genutzt werden
