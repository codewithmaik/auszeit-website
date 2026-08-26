# Devnotes — laufender Stand

> Scratch-Datei für Session-Kontinuität. Wird bei größeren Unterbrechungen aktualisiert, damit eine neue Session nahtlos weitermachen kann. Kein öffentlich relevantes Doc — bei Bedarf löschen/ins .gitignore, wenn das Projekt "fertig" ist.

## Aktueller Stand

**Branch:** `feature/admin-panel` (noch nicht gemerged nach `main`, noch nicht gepusht)
**Task:** Adminpanel für Kunde — **fertig, DB verbunden, kompletter Klick-Test erfolgreich durchlaufen.**
**Dev-Server:** lief zuletzt auf `localhost:3000` — falls nicht mehr aktiv: `npm run dev`.

## ✅ Blocker aufgelöst

Neon-Terms wurden vom Kontoinhaber im Browser bestätigt. `vercel integration add neon --name auszeit-website-11-db --non-interactive` lief danach durch, DB ist provisioniert und mit dem Projekt verknüpft (`.env.local` wurde von `vercel integration add` automatisch mit allen DB-Env-Vars überschrieben/ergänzt). `npm run db:push` + `npm run db:seed` liefen erfolgreich — die 7 Platzhalter-Wohnungen und Default-Settings sind in der DB.

## 🐛 Drei echte Bugs gefunden + gefixt (nicht nur der DB-Blocker)

Diese drei Dinge waren unabhängig vom Neon-Blocker echte Bugs im bereits geschriebenen Code, die erst beim tatsächlichen End-to-End-Test mit echter DB/echtem Login/echten Uploads sichtbar wurden:

1. **`scripts/seed.ts` → `scripts/seed.mts`**: Datei nutzte Top-Level-`await`, aber `package.json` hat kein `"type": "module"`, also kompilierte `tsx` es als CJS und crashte. Umbenannt auf `.mts` (tsx behandelt das immer als ESM), `db:seed`-Script in `package.json` angepasst.

2. **`ADMIN_PASSWORD_HASH` in `.env.local` durch `dotenv-expand` korrumpiert**: bcrypt-Hashes enthalten `$`-Zeichen (`$2b$10$rG1jQb...`), und Next.js' `@next/env`-Loader (nutzt intern `dotenv-expand`) interpretiert `$rG1jQb46t8t1dc9mvBw7i` als Variablenreferenz und ersetzt es durch einen leeren String, wenn keine gleichnamige Env-Var existiert → Login schlug lokal fehl, obwohl Hash + Passwort korrekt waren. **Fix:** `$` in `.env.local` mit `\$` escapen (`ADMIN_PASSWORD_HASH="\$2b\$10\$rG1jQb46..."`). Betrifft nur lokales `.env.local`-Parsing — auf Vercel selbst werden Env-Vars direkt injiziert (kein `.env`-Parsing), Production ist also nicht betroffen. **Falls der Hash je neu erzeugt wird: die `$`-Zeichen in `.env.local` wieder escapen, sonst bricht der Login lokal erneut.**

3. **Zwei next.config.ts-Fixes, ohne die das Fotoupload-Feature in der Praxis nicht nutzbar gewesen wäre:**
   - `experimental.serverActions.bodySizeLimit` war nicht gesetzt → Default 1 MB. Echte Handyfotos sind oft 2–8 MB, jeder Upload eines normalen Fotos wäre mit `Error: Body exceeded 1 MB limit` gescheitert. Jetzt auf `"10mb"` gesetzt.
   - `images.remotePatterns` hatte den Vercel-Blob-Host nicht erlaubt → jede Seite, die ein hochgeladenes Foto per `next/image` rendert (Admin-Editor **und** die öffentliche `/wohnung`-Seite), wäre mit 500 „Invalid src prop … hostname not configured" gecrasht, sobald ein echtes Foto hochgeladen wurde (mit den alten lokalen `/images/...`-Pfaden aus den Seed-Daten fiel das vorher nicht auf). Jetzt `*.public.blob.vercel-storage.com` erlaubt.

   Beide Fixes sind in `next.config.ts`, committed, noch nicht gepusht.

## ✅ Kompletter Klick-Test durchgeführt (im Browser, per Chrome-Automation)

Alles erfolgreich getestet und wieder aufgeräumt (Testdaten gelöscht, Telefonnummer zurückgesetzt):

- `/admin/login` → Login funktioniert
- Wohnung anlegen ("Testwohnung") → funktioniert
- Mehrere Fotos hochladen → funktioniert (nach den obigen Fixes)
- Reihenfolge ändern (Pfeil-Buttons) → funktioniert, Titelbild-Badge wandert korrekt mit
- Einzelnes Foto löschen → funktioniert
- `/wohnung`: Slider zeigt neue Wohnung, Thumbnail-Dots bei mehreren Fotos → funktioniert
- Wohnung löschen (inkl. Blob-Cleanup) → funktioniert, verschwindet aus Slider, Zähler wieder korrekt
- Einstellungen ändern (Telefonnummer testweise geändert) → sofort sichtbar auf `/kontakt`, im Footer und im JSON-LD (`LodgingBusiness`), ohne Redeploy dank `revalidatePath` — dann zurückgesetzt auf Originalwert
- Impressum/Datenschutz sind bewusst freier Text (nicht an `contactPhone` gekoppelt) — Verhalten wie designt, kein Bug

**Automatisierungs-Hinweis für künftige Sessions:** Klicks per Bildschirmkoordinaten aus einem Screenshot trafen wiederholt daneben (Koordinatenraum von Screenshot ≠ CSS-Pixel-Viewport in dieser Chrome-Automation-Umgebung). Zuverlässiger: Element per `find`/`read_page` referenzieren und per `javascript_tool` direkt `element.click()` bzw. `form.requestSubmit()` aufrufen. **Vorsicht bei `document.querySelector('form')`**, wenn mehrere Forms auf der Seite sind (z. B. Abmelden-Form im Header) — führte einmal zu ungewolltem Logout statt Settings-Speichern. Immer über ein eindeutiges Kind-Element (`closest('form')`) gehen.

## Architektur

- **DB:** Vercel Postgres via Neon, Drizzle ORM (`drizzle-orm/neon-http`, **kein** `db.transaction()` — der Treiber unterstützt keine Transaktionen; bei `moveApartmentImage` deshalb bewusst zwei sequenzielle Updates statt Transaktion)
- **Blob:** `@vercel/blob`, Store `auszeit-website-11`, `access: public`
- **Auth:** NextAuth v5 (`next-auth@beta`), Credentials-Provider, JWT-Session, **kein** Users-Table — Admin-Identität kommt aus Env-Vars `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt-Hash). ✅ Gesetzt in `.env.local` (mit escapten `$`, s. o.) **und** allen drei Vercel-Umgebungen (dort unescaped, da kein `.env`-Parsing).
  - Admin-Login: `maik.bock48@gmail.com`
  - Generiertes Passwort (Klartext nur hier + einmalig im Chat genannt): `jSQqmvTXqVpvboLH` — im Repo/Code steht nur der bcrypt-Hash. Falls geändert werden soll: neuen Hash erzeugen (`node -e "console.log(require('bcryptjs').hashSync('NEUES-PW', 10))"`), dann `vercel env rm ADMIN_PASSWORD_HASH <env>` + neu `add` für production/preview/development, plus `.env.local` anpassen (dort `$` escapen!).
- **Rendering:** Seiten, die aus der DB lesen, sind `export const dynamic = "force-dynamic"` (kein ISR bisher) + zusätzlich `revalidatePath(...)` in den Server Actions

## Was noch fehlt

1. **Commit + Merge nach `main` + Push** (erst wenn User bereit zum Testen ist, siehe Standing Instruction unten) — Branch enthält jetzt sowohl den ursprünglichen Admin-Panel-Code als auch die drei Bugfixes oben
2. Seed-Daten sind reine Platzhalter (alte 7 Fantasie-Wohnungen, generischer Impressum/Datenschutz-Hinweistext) — Kunde muss diese über das Adminpanel selbst durch echte Inhalte ersetzen, keine weitere Aktion meinerseits nötig
3. GitHub-Verknüpfung des Vercel-Projekts ist fehlgeschlagen ("Login Connection" fehlt) — für Auto-Deploy-on-Push müsste der User das einmal im Vercel-Dashboard unter Account-Settings nachholen; kein Blocker für die Admin-Panel-Fertigstellung selbst, nur für automatisches Deployment

## Standing Instructions (gelten weiterhin, unabhängig vom Adminpanel-Task)

- **Git-Workflow:** Feature-Branches pro Aufgabe, regelmäßig committen, aber **erst pushen kurz bevor der User testen will** — nicht nach jedem Commit
- Bei Bugs, die sich mit den Chrome-Automation-Tools nicht reproduzieren lassen (z. B. Screenshot-Staleness in Hintergrund-Tabs, Klick-Koordinaten treffen daneben): lieber auf DOM-/Netzwerk-Ebene bzw. per direktem `element.click()`/`form.requestSubmit()` verifizieren statt blind Screenshot-Koordinaten zu vertrauen
- Deferred vom User: Formspree-Endpoint (noch `YOUR_FORM_ID`, mailto-Fallback aktiv) und echte Fotos statt Stock-Bilder — beides "später", nicht vergessen, aber nicht aktiv nachfragen

## Wie eine neue Session weitermachen sollte

Adminpanel-Task ist inhaltlich fertig. Nächster sinnvoller Schritt: mit dem User klären, ob jetzt gemerged/gepusht werden soll, oder ob noch weiteres Feedback zur Admin-UI gewünscht ist.
