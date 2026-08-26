# Devnotes — laufender Stand

> Scratch-Datei für Session-Kontinuität. Wird bei größeren Unterbrechungen aktualisiert, damit eine neue Session nahtlos weitermachen kann. Kein öffentlich relevantes Doc — bei Bedarf löschen/ins .gitignore, wenn das Projekt "fertig" ist.

## Aktueller Stand

**Branch:** `feature/i18n-datenschutz-cookies` — gepusht, lokal und remote identisch (`648c68b`), **nicht** nach `main` gemerged.
**Aber:** Genau dieser Branch-Stand ist bereits live in **Production** deployed (siehe Deploy-Abschnitt unten) — `main` ist also aktuell hinter dem, was live läuft. Sollte bei Gelegenheit per PR nachgezogen werden, ist aber kein akuter Blocker.
**Dev-Server:** lief zuletzt auf `localhost:3100` (nicht 3000 — Port 3000 war von einem anderen lokalen Projekt belegt). Falls nicht mehr aktiv: `npm run dev -- -p 3100` (oder einfach `npm run dev`, wenn 3000 inzwischen frei ist).
**Hinweis:** Es läuft noch ein verwaister `vercel dev --listen 3002`-Prozess (PID wechselnd, seit dem Vorabend) — gehört nicht zu diesem Task, wurde bewusst nicht angefasst.

## Was in dieser Session gemacht wurde

### 1. i18n-Umbau (de/en)

Alle Public-Pages von `src/app/*` nach `src/app/[lang]/*` verschoben, `src/proxy.ts` erkennt/redirected Locale (Cookie → Accept-Language → Default `de`), Dictionaries in `src/dictionaries/{de,en,index}.ts` (server-only). Cookie-Consent-Banner für Google Maps (`src/components/cookies/`), `src/lib/consent.ts`, `src/lib/i18n.ts` (Locale-Helper + `formatTemplate()`).

**Bug direkt nach dem Umbau gefixt:** Dictionary-Felder wie `unitLabel`, `photoLabel`, `goTo`, `zoom` waren Funktionen (`(i, total) => ...`) statt Strings — das crashte mit 500 auf jeder `/de`- und `/en`-Seite, weil Funktionen nicht von Server- zu Client-Components als Props durchgereicht werden können. Fix: Templates als Strings (`"Wohnung {i} von {total}"`) + `formatTemplate()`-Helper in `src/lib/i18n.ts`, der clientseitig interpoliert.

### 2. Styling-Anpassungen (mehrere Nutzer-Requests nacheinander)

- Alle gold-farbenen Texte site-weit +2px (`calc(Xrem + 2px)`-Pattern)
- `Eyebrow`-Komponente (die kleinen Caps-Headlines wie "KONTAKT", "DIE REGION") zusätzlich +1px (also +3px total) + Unterstreichung in derselben Gold-Farbe
- Hero-/PageHero-Titel (`clamp(...)`-Werte) um ~15% verkleinert
- `PageHero`-Section (grüner Hintergrund auf Wohnung/Region/Bewertungen/Kontakt) Padding schrittweise verkleinert: `pt-[90px]` → `pt-[60px]` → `pt-[36px]`, `pb-[60px]` → `pb-[40px]`
- Neuer Design-Token `--color-khaki` in `globals.css`, khaki-farbene runde Border um die 4 Feature-Icons auf der Startseite (`src/app/[lang]/page.tsx`). **Wichtig:** Die Quell-PNGs (`public/images/icons/*.png`) sind alle 320×320, aber das eingezeichnete Rund-Badge sitzt in jedem Bild an einer anderen Stelle im Canvas (unterschiedlich beschnitten). Deshalb wurde `BrandIcon`s `ICONS`-Map exportiert und in `page.tsx` ein manuelles Crop/Recenter über `FEATURE_ICON_FRAME` (per-Icon `size`/`left`/`top`, gemessen per Pillow-Script) gebaut, statt die Standard-`BrandIcon`-Komponente zu nutzen. Falls neue Icons in diesem Stil dazukommen: gleiche Masche nötig, die Bilder sind nicht einheitlich zentriert.

### 3. Echte Geschäfts-/Rechtsdaten eingetragen

Via einmaligem Script `scripts/update-business-details.mts` (Muster wie das schon vorhandene `scripts/update-legal-content.mts`) direkt in die DB geschrieben:

- Name: Norbert Winkel
- Adresse: Annaberger Str. 231, 53175 Bonn
- Tel: 0228-28695499, Fax: 0228-28695498
- E-Mail: info@luxury-apartments-bonn.com
- USt-IdNr.: DE296770621

Impressum (DE+EN) und Datenschutz-„Verantwortlicher"-Abschnitt (DE+EN) sind jetzt vollständig ausgefüllt, `contactAddress`/`contactPhone`/`contactEmail` in der DB aktualisiert, außerdem `BUSINESS`-Fallback-Konstanten in `src/lib/site.ts` (greifen nur, wenn DB nicht erreichbar ist).

⚠️ **Nicht verifiziert:** Die Site-Marke ist "AUSZEIT — Ferienwohnung an der Mosel", aber die E-Mail-Domain der Rechtsdaten ist `luxury-apartments-bonn.com` (Bonn, nicht Mosel). Das ist rechtlich unproblematisch (Impressum-Adresse ≠ Standort der Ferienwohnung), wurde dem User als Hinweis gespiegelt, aber **nicht explizit bestätigt** — falls das ein Versehen war (falsche Firma/falscher Kunde), müsste das Script erneut mit korrigierten Daten laufen.

### 4. Kritischer Bug gefixt: Sprachumschalter blieb auf Deutsch hängen

**Root Cause:** `Header`/`Footer` werden im ROOT-Layout (`src/app/layout.tsx`) gerendert, **außerhalb** des `[lang]`-Route-Segments, und beziehen die Locale aus dem `x-locale`-Request-Header. Next.js rendert Layout-Segmente **oberhalb** des sich ändernden dynamischen Segments bei einer Client-Side-Navigation nicht neu — nach dem ersten Sprachwechsel blieb `Header`s `locale`-Prop (und damit auch alle Nav-Links) für immer auf der ursprünglich geladenen Sprache eingefroren, wodurch der Umschalter dauerhaft nur noch "→ Deutsch" berechnete.

**Fix:** `switchLanguage()` in `src/components/Header.tsx` macht jetzt eine volle Navigation (`window.location.href = ...`) statt `router.push()` (Soft-Nav) — erzwingt kompletten Neu-Render inkl. Root-Layout. `useRouter`-Import entfernt. Verifiziert mit zwei kompletten EN↔DE-Runden inkl. Nav-Link-Href-Check.

**Nicht angefasst, aber bewusst so gelassen:** Der eigentliche architektonische Grund (Header/Footer im Root-Layout statt im `[lang]`-Layout) wurde nicht behoben, weil Admin-Routen (`/admin/*`, liegen außerhalb von `[lang]`) den öffentlichen Header absichtlich mitrendern (nur der Sprachumschalter wird per `isAdmin`-Check ausgeblendet). Eine Verschiebung von Header/Footer ins `[lang]`-Layout hätte das für Admin-Seiten kaputt gemacht. Die Full-Navigation ist der minimal-invasive Fix.

### 5. Deploy-Saga (Vercel)

Account/Team durchgehend korrekt: GitHub `codewithmaik`, Vercel `coding.maikel@gmail.com` / Team `codewithmaik` (per globaler CLAUDE.md-Vorgabe).

**Problem 1 — Preview-Deploys hingen fest (`readyState: BLOCKED`, CLI zeigte irreführend "UNKNOWN"):** Ursache war die globale Git-Config: `user.email` stand auf einer alten, nicht mit dem GitHub-Account `codewithmaik` verifizierten Adresse (`maik.bock@tn.techstarter.de`). Vercels Git-Integration blockt Deployments, deren Commit-Autor-E-Mail nicht zum verknüpften GitHub-Account passt.
- User hat `git config --global user.email "coding.maikel@gmail.com"` selbst gesetzt (ich darf laut Systemregeln nie selbst `git config` ausführen).
- Das reichte allein nicht, weil der Block an die **bereits gepushte** Commit-Autor-E-Mail hängt, nicht an die aktuelle Config. Nutzer hat explizit erlaubt, den letzten Commit zu amenden (`--author="maikdoescommit <coding.maikel@gmail.com>"`) + force-push (`--force-with-lease`) — danach ging der Deploy sofort durch.

**Problem 2 — Domain sollte `auszeit-mosel.vercel.app` statt `auszeit-website-11.vercel.app` sein:**
- `vercel project rename auszeit-website-11 auszeit-mosel` erfolgreich, **aber** das ändert nicht automatisch den nackten `<name>.vercel.app`-Alias — nur die Team-Scoped-Variante (`<name>-<team>.vercel.app`) aktualisiert sich automatisch bei jedem Deploy. Lokales `.vercel/project.json` war zudem noch auf den alten Namen gecacht (`vercel link --yes --project auszeit-mosel --scope codewithmaik` hat das aufgefrischt — Nebenwirkung: `.env.local` wurde dabei mit frischem `VERCEL_OIDC_TOKEN` überschrieben).
- Der nackte Alias musste explizit gesetzt werden: `vercel alias set <deployment-url> auszeit-mosel.vercel.app`.
- Auf User-Wunsch wurde dafür ein **Production-Deploy** (`vercel --prod`) vom aktuellen Feature-Branch aus gemacht (mit expliziter Bestätigung eingeholt) — das hat den kompletten heutigen Session-Stand live geschaltet, ohne über `main`/PR zu gehen.

**Aktueller Live-Stand:**
- `https://auszeit-mosel.vercel.app` (neu, primär) und `https://auszeit-website-11.vercel.app` (alt, funktioniert weiterhin) zeigen beide auf dieselbe aktuelle Production-Deployment.
- **Beide URLs sind aktuell hinter Vercels SSO-/Deployment-Protection** (`ssoProtection.deploymentType: "all_except_custom_domains"`) — nur mit Login im `codewithmaik`-Account erreichbar. Das ist Standardverhalten und hebt sich automatisch auf, sobald eine echte Custom-Domain (z. B. `auszeit-mosel.de`, siehe `SITE_URL`-Konstante in `src/lib/site.ts`) am Projekt hängt. **Offene Entscheidung beim User:** SSO-Schutz für `.vercel.app`-URLs jetzt schon deaktivieren, oder warten bis Custom-Domain eingerichtet ist? Wurde gefragt, noch keine Antwort erhalten.

## Architektur (weiterhin gültig, aus vorherigem Admin-Panel-Task)

- **DB:** Vercel Postgres via Neon, Drizzle ORM (`drizzle-orm/neon-http`, **kein** `db.transaction()` — Treiber unterstützt keine Transaktionen)
- **Blob:** `@vercel/blob`, Store `auszeit-website-11`, `access: public`
- **Auth:** NextAuth v5 (Credentials-Provider, JWT-Session), kein Users-Table — Admin-Identität aus `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` (bcrypt) Env-Vars. `.env.local` escaped `$`-Zeichen im Hash (dotenv-expand-Falle), Vercel-Env-Vars selbst nicht (kein `.env`-Parsing dort).
- **Rendering:** DB-lesende Seiten sind `export const dynamic = "force-dynamic"` + `revalidatePath(...)` in Server Actions

## Was noch offen ist

1. **`main` ist hinter Production** — Branch sollte irgendwann per PR gemerged werden, ist aber aktuell kein Blocker (Production läuft ja schon auf dem richtigen Stand).
2. **SSO-Schutz auf `.vercel.app`-URLs** — User-Entscheidung ausstehend (siehe oben).
3. **Rechtsdaten-Domain-Mismatch** (Mosel-Branding vs. `luxury-apartments-bonn.com`) — nicht explizit vom User bestätigt, siehe oben.
4. `.agents/`, `.claude/`, `skills-lock.json` bleiben absichtlich ungetracked (Skill-Cache-Verzeichnisse, kein Projekt-Code) — nicht versehentlich committen.

## Standing Instructions

- **Git-Workflow:** Feature-Branches pro Aufgabe, regelmäßig committen. **Nie selbst `git config` ändern** (harte Regel) — den User bitten, das selbst zu tun (Vorschlag: `!`-Prefix im Prompt).
- Force-Push nur mit explizitem User-OK, nie eigenmächtig.
- Für neue Projekte/GitHub-Repos/Vercel-Deploys IMMER `codewithmaik`/`coding.maikel@gmail.com` (siehe globale CLAUDE.md) — bei diesem Projekt bereits durchgehend korrekt verwendet.
- Deferred vom User: Formspree-Endpoint (noch `YOUR_FORM_ID`, mailto-Fallback aktiv) und echte Fotos statt Stock-Bilder — "später", nicht aktiv nachfragen.

## Wie eine neue Session weitermachen sollte

Alles inhaltlich fertig und live. Nächster sinnvoller Schritt: mit dem User die zwei offenen Fragen oben klären (SSO-Schutz, Rechtsdaten-Domain), danach ggf. `main` per PR nachziehen.
