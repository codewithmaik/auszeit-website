# Devnotes — laufender Stand

> Scratch-Datei für Session-Kontinuität. Wird bei größeren Unterbrechungen aktualisiert, damit eine neue Session nahtlos weitermachen kann. Kein öffentlich relevantes Doc — bei Bedarf löschen/ins .gitignore, wenn das Projekt "fertig" ist.

## Aktueller Stand

**Branch:** `feature/admin-design-editor` — gepusht nach `origin` (GitHub `codewithmaik/auszeit-website-11`), **nicht** nach `main` gemerged. Working tree sauber (bis auf absichtlich ungetrackte `.agents/`, `.claude/`, `auszeit-apartments/`, `skills-lock.json`, s. u.).
**Dev-Server:** aktuell nicht gestartet.
**Production:** läuft über `auszeit-mosel.vercel.app` (Details s. „Frühere Session: Footer-Link + Domain-Aufräumen" unten) — aktueller Stand des Branches ist live.

Der komplette Admin-Design-Editor (siehe „Frühere Session" unten) ist inzwischen committed (`9bdeec9`, `4eeda79`, `28f74cd`) und deployed — der frühere Hinweis „noch nicht committed" in dieser Datei war veraltet.

## Frühere Session: Footer-Link + Domain-Aufräumen

**Auftrag:** Im Footer bei „Technische Umsetzung: codewithmaik" zusätzlich „coding-johnny" verlinken (→ `https://johnomwata-dev.vercel.app`), danach commit/push/deploy. Anschließend: Deploy soll wie bisher unter `auszeit-mosel.vercel.app` laufen, alle anderen Domains fürs Projekt entfernen.

- `src/components/Footer.tsx`: Credit-Zeile umgebaut — Prefix + zwei separate `<a>`-Links („codewithmaik" → codewithmaik.com, „coding-johnny" → johnomwata-dev.vercel.app), gleiche Hover-Unterstrich-Optik wie vorher, durch „&" getrennt. Commit `0d60548`.
- **Domain-Befund:** Das Vercel-Projekt `auszeit-mosel` hatte zwischenzeitlich 3 `.vercel.app`-Aliase: `auszeit-mosel.vercel.app` (Zieldomain), `auszeit-website-11.vercel.app` (war durch einen `vercel --prod`-Deploy zur „Latest Production URL" geworden, obwohl `auszeit-mosel.vercel.app` gar nicht mitaktualisiert wurde) und `auszeit-mosel-codewithmaik.vercel.app` (Team-Default-Alias). **Fix:** `vercel alias set` hat `auszeit-mosel.vercel.app` explizit auf den aktuellen Production-Deployment gesetzt, danach `vercel alias rm` für die beiden anderen. Verifiziert: `auszeit-mosel.vercel.app` → 200 (redirect auf `/de`), `auszeit-website-11.vercel.app` → 404.
- **Hinweis für zukünftige Deploys:** `vercel project ls` zeigt in der Spalte „Latest Production URL" ggf. weiterhin eine veraltete Domain an (gecachtes Projekt-Metadatenfeld, kein Live-Routing) — die tatsächlich aktive Domain ist die, die in `vercel alias ls` auf den neuesten Deployment-Hash zeigt. Bei künftigen `vercel --prod`-Deploys prüfen, ob `auszeit-mosel.vercel.app` automatisch mitaktualisiert wird oder ob wieder ein manuelles `vercel alias set` nötig ist.

## Frühere Session: Admin-Editor „Design" (Farbpalette, Bilder, Texte, Logo/Logotext)

**Auftrag:** Neuer Adminpanel-Menüpunkt, über den die Startseite (Farbpalette, Bilder, Texte) sowie Logo/Logotext in der Navbar eigenständig gepflegt werden können, ohne dass Bilder auf der Website „kaputt" aussehen können — mit Plan vorab, Empfehlungen bei offenen Fragen, kein Commit/Push vor Test.

**Mit dem User abgestimmte Scope-Entscheidungen** (per Nachfrage vor Implementierung):
- Alle Startseiten-Textabschnitte editierbar (nicht nur Hero) — Hero, 4 Feature-Kacheln, 3 Schritte, Buchen-Block, Wohlfühl-Karte, 4 Vertrauensleisten-Punkte, jeweils DE+EN.
- Farbpalette kuratiert auf 4 Kernfarben (Primär/Forest, Primär dunkel/Hover, Akzent/Gold, Hintergrund) statt aller 11 CSS-Design-Tokens — schützt vor kaputtem Kontrast an subtileren Stellen (Sage/Mist/Khaki/Cream/Ink/Line bleiben fest).

**Bewusst NICHT Teil dieser Session** (Scope-Grenzen):
- Feature-Icons (`src/components/BrandIcon.tsx`, 6 statische PNGs) und Lucide-Icons der Vertrauensleiste bleiben fest — shared Icon-System, auch auf `/region` und in `PhotoCard` genutzt, kein Foto-Upload-Slot.
- Footer-Markenname bleibt der feste „AUSZEIT"-Text (Auftrag sprach explizit nur von der Navbar). `BUSINESS.name`, Impressum/Datenschutz-Metatexte unverändert.

**Neues Datenmodell** (`src/db/schema.ts`, `siteSettings`-Tabelle erweitert, `npm run db:push` bereits gegen die Dev-DB ausgeführt — Projekt nutzt ausschließlich `drizzle-kit push`, keine generierten Migrationsdateien):
- `logoImageUrl`, `logoTextImageUrl` (nullable, Navbar-Branding)
- `themePrimary`, `themePrimaryDark`, `themeAccent`, `themeBackground` (nullable Hex-Strings)
- `homeHeroImageUrl`, `homeWohlfuehlImageUrl` (nullable)
- `homeContentDe`, `homeContentEn` (nullable `jsonb`, Typ `HomeContent` aus neuem `src/db/home-content.ts` — bewusst nicht aus `src/dictionaries` importiert, um den DB-Layer nicht von der UI-Dictionary-Schicht abhängig zu machen). `null` = Dictionary-Default wird verwendet (Fallback-Pattern wie bei Impressum/Datenschutz).

**Rendering:**
- `src/app/layout.tsx`: Theme-Farben werden als inline `style`-Objekt auf `<html>` injiziert (`--color-forest` etc. überschreiben `globals.css`), sitewide wirksam — bewusst kein `dangerouslySetInnerHTML`. `settings.logoImageUrl`/`logoTextImageUrl` werden an `Header` durchgereicht.
- `src/components/Header.tsx`: neue optionale Props `logoImageUrl`/`logoTextImageUrl`. Logo-Slot fällt auf `/images/logo.png` zurück; Logo-Schriftzug-Slot rendert bei gesetztem Wert ein Bild in einer **festen** Box (`w-[170px] h-[34px]`, mobil kleiner) mit `object-contain` statt der beiden Text-`<span>`s — **wichtig:** die Box braucht eine feste Breite (nicht `w-auto`), weil `next/image fill` sonst in einem Flex-Item ohne Breitenvorgabe auf 0px kollabiert (das war ein Bug im ersten Entwurf dieser Session, beim Review vor dem Testen gefunden und korrigiert).
- `src/app/[lang]/page.tsx`: `t = homeOverride ?? dict.home` (locale-abhängig `homeContentDe`/`homeContentEn`), Hero-/Wohlfühl-Bild-`src` analog mit `||`-Fallback auf die bisherigen statischen Pfade.

**Admin-UI** (`src/app/admin/(dashboard)/design/{page.tsx,actions.ts}`, neuer Nav-Punkt „Design" in `src/app/admin/(dashboard)/layout.tsx`):
- Branding-Uploads (Logo, Logo-Schriftzug), 4 native `<input type="color">` für die Palette, Startseiten-Bild-Uploads (Hero, Wohlfühl-Karte) — alle nach dem bestehenden Blob-Upload-Muster aus `wohnungen/actions.ts` (`put`/`del`, altes Blob beim Ersetzen aufräumen), jeweils mit „Zurücksetzen"-Button (nullt das Feld, kein Wegwerf-Skript nötig).
- Startseiten-Texte: langes Formular, DE/EN nebeneinander pro Feld, vorausgefüllt mit dem aktuellen Effektivwert (DB-Override ?? Dictionary-Default). Feldnamen folgen einem Dot-Path-Schema (`de.hero.title1`, `en.features.2.title`, `de.trust.0.text`, `de.bookBullets` als Textarea mit einem Stichpunkt pro Zeile), im Server Action `parseHomeContent()` wieder zu einem vollständigen `HomeContent`-Objekt je Sprache zusammengebaut (kein Deep-Merge nötig, da immer alle Felder im Formular stehen). Zwei Server Actions pro Formular (Speichern + Zurücksetzen) über das `formAction`-Attribut eines zweiten Submit-Buttons im selben `<form>`.
- Gemeinsamer `updateSettings()`/`ensureSettingsId()`-Helper in `actions.ts` kapselt das Insert-wenn-keine-Row-sonst-Update-Muster (identisch zu `einstellungen/actions.ts`), inkl. Fallback auf `BUSINESS`-Kontaktdaten falls die Settings-Row noch gar nicht existiert.

**Verifiziert (ohne Chrome-Automation, s. u.):**
- `npx tsc --noEmit` und `npx eslint` auf allen geänderten/neuen Dateien: sauber.
- DB-Roundtrip per Wegwerf-Skript (`scripts/design-editor-smoketest.mts`, nach Test wieder gelöscht) direkt gegen die Dev-DB: Theme-Farben erscheinen korrekt im `style`-Attribut auf `<html>`; Startseiten-Text-Override auf `/de` sichtbar, `/en` bleibt unverändert beim Dictionary-Default (Locale-Trennung funktioniert); Hero-Bild-Override wird als `<Photo>`-`src` übernommen; Logo- und Logo-Schriftzug-Override werden im Header gerendert, der Fallback-Text verschwindet korrekt (Footer-„AUSZEIT" bleibt separat bestehen, wie geplant); nach Reset sind alle Seiten wieder exakt im ursprünglichen Zustand.
- **Nicht verifiziert:** der eigentliche Klick-Weg durch das Adminpanel (`/admin/design` einloggen, Formulare ausfüllen, Datei-Upload-Button klicken) — die Chrome-Browser-Erweiterung war in dieser Session nicht verbunden. Die Formular-Feldnamen/Server-Actions wurden stattdessen durch direkte DB-Writes mit identischer Datenform geprüft (deckt Rendering + Datenmodell ab, **nicht** das native `<input type="file">`-Upload-Verhalten oder das Zusammenspiel der beiden Submit-Buttons/`formAction` im Browser).

## Was noch offen ist

1. **Adminpanel-Klick-Test steht weiterhin aus:** `/admin/login` → `/admin/design` im Browser durchklicken — insbesondere Datei-Upload für Logo/Logo-Schriftzug/Hero/Wohlfühl-Bild, die beiden „Speichern"/„Zurücksetzen"-Buttons pro Formular, mobile Navbar mit gesetztem Logo-Schriftzug-Bild. War schon bei `9bdeec9` offen und wurde seither in keiner Session nachgeholt (keine Chrome-Automation-Verbindung).
2. **`feature/admin-design-editor` noch nicht nach `main` gemerged** — Branch ist auf GitHub aktuell (`origin`), Production läuft direkt vom Branch-Deploy über `auszeit-mosel.vercel.app`, nicht über einen `main`-Merge.
3. `.agents/`, `.claude/`, `auszeit-apartments/`, `skills-lock.json` bleiben absichtlich ungetracked — nicht versehentlich committen.
4. Frühere offene Punkte (Alt-Text pro Bild, Ausstattungslisten pro Wohnung, SSO-Schutz auf `.vercel.app`-URLs, Rechtsdaten-Domain-Mismatch) sind weiterhin unangetastet.

## Standing Instructions

- **Git-Workflow:** Feature-Branches pro Aufgabe, regelmäßig committen. **Nie selbst `git config` ändern** (harte Regel) — den User bitten, das selbst zu tun.
- Force-Push nur mit explizitem User-OK, nie eigenmächtig.
- Für neue Projekte/GitHub-Repos/Vercel-Deploys IMMER `codewithmaik`/`coding.maikel@gmail.com` (siehe globale CLAUDE.md).
- Browser-Automation: `window.confirm()`-geschützte Aktionen (z. B. „Wohnung löschen") lassen sich nicht per Klick automatisieren — für Test-Cleanup stattdessen ein Wegwerf-DB-Skript nach Muster `scripts/update-*.mts` schreiben, ausführen, wieder löschen.
- `drizzle-kit push` braucht die Env-Vars aus `.env.local` explizit geladen (`set -a && source .env.local && set +a && npm run db:push`), da `drizzle.config.ts` sie nicht automatisch lädt.
- Nach `vercel --prod`-Deploys die Ziel-Domain (`auszeit-mosel.vercel.app`) per `vercel alias ls` prüfen, statt sich auf `vercel project ls`/„Latest Production URL" zu verlassen — dieses Feld kann veraltete Domains anzeigen (s. „Frühere Session: Footer-Link + Domain-Aufräumen").

## Wie eine neue Session weitermachen sollte

Adminpanel-Klick-Test nachholen (Chrome-Erweiterung verbinden, `/admin/design` durchklicken, s. „Was noch offen ist" Punkt 1). Danach mit dem User klären, ob/wann `feature/admin-design-editor` nach `main` gemerged werden soll — aktuell läuft Production direkt vom Feature-Branch.

---

## Frühere Session: Adminpanel für Wohnungen ausgeweitet

**Auftrag:** Wohnungen (Titel, Beschreibung, Infos, Bilder) sollen im Adminpanel editierbar sein; neue Beispiele sollen in den Slider auf der `/wohnung`-Seite ergänzt, bestehende gelöscht/aktualisiert werden können.

**Befund zu Beginn:** Das CRUD für Wohnungen (`src/app/admin/(dashboard)/wohnungen/*`) existierte bereits vollständig aus einem früheren Task — Name/Titel, Beschreibung, Größe/Gäste/Schlafzimmer editierbar, Bilder hochladen/löschen/neu sortieren, ganze Wohnung anlegen/löschen. Der eigentliche Blocker lag nicht im Adminpanel, sondern auf der **Public-Seite**:

1. **`src/app/[lang]/wohnung/page.tsx`** hatte eine hart kodierte `WOHNUNGSTYPEN_COUNT = 3` und hat den Slider per `apartments.slice(0, 3)` immer auf die ersten 3 DB-Einträge gekappt — neue, im Adminpanel angelegte Wohnungen (es lagen zum Testzeitpunkt bereits 7 in der DB) tauchten dadurch nie im Slider auf. **Fix:** Cap entfernt, `units` wird jetzt aus **allen** Wohnungen aus `getApartments()` gebaut. Damit steuert das Adminpanel (anlegen/löschen/Felder ändern) jetzt 1:1, was im Slider erscheint.
2. Die Hero-Headline auf `/wohnung` war in beiden Dictionaries hart auf „**3** Wohnungstypen" / „**3** Apartment Types" formuliert (`src/dictionaries/de.ts` / `en.ts`, Feld `wohnung.heroTitle`/`heroText`) — das wäre nach Punkt 1 sofort falsch geworden, sobald mehr/weniger als 3 Einträge gepflegt werden. **Fix:** Copy zahlenunabhängig umformuliert ("Unsere Wohnungstypen" / "Our Apartment Types", "jeder unserer Wohnungstypen" statt "jeder unserer drei Wohnungstypen").
3. **Neu ergänzt:** Reihenfolge-Steuerung für Wohnungen selbst in der Admin-Übersicht (`src/app/admin/(dashboard)/wohnungen/page.tsx` + `actions.ts`, neue Action `moveApartment(id, direction)`), analog zum bereits vorhandenen Foto-Reorder (`moveApartmentImage`). Vorher gab es nur `sortOrder` in der DB (Reihenfolge stand fest bei Anlage, nicht nachträglich änderbar) — jetzt gibt es Auf/Ab-Buttons pro Wohnungs-Karte, die per sortOrder-Swap die Position im Slider ändern. Die Karte war vorher komplett ein `<Link>`; für die Buttons musste sie auf `<div>` + inneren `<Link>` (Bild+Text) + separate `<form>`-Buttons darunter umgebaut werden (kein verschachteltes `<button>` in `<a>`).

**Verifiziert im Browser (localhost:3100, Chrome-Automation):**
- Admin-Übersicht zeigte vor dem Fix bereits 7 Wohnungen mit „Position X von 7" — Public-Slider zeigte aber nur 3. Nach dem Fix: alle 7 im Slider (`WOHNUNGSTYP 1 VON 7` … `7 VON 7`), inkl. Filterbuttons und Galerie darunter.
- Neue Test-Wohnung im Admin angelegt (`/admin/wohnungen/neu`) → erschien sofort als 8. Eintrag im Slider und in der Galerie-Filterleiste → wieder gelöscht.
  - **Hinweis für zukünftige Sessions:** Der „Wohnung löschen"-Button nutzt `ConfirmSubmitButton` mit `window.confirm(...)` — das blockt die Chrome-Automation (native Dialoge dürfen laut Systemregeln nicht ausgelöst werden). Zum Aufräumen des Testeintrags wurde stattdessen ein Wegwerf-Skript nach dem Muster von `scripts/update-business-details.mts` geschrieben, mit `tsx` ausgeführt und danach wieder gelöscht — kein Weg, das über die Browser-UI zu tun, ohne den Confirm-Dialog auszulösen.
- Auf/Ab-Reorder in der Admin-Übersicht getestet (Weinberg-Loft nach oben, dann wieder runter) → Reihenfolge ändert sich sofort, `revalidatePath` greift ohne Reload.
- `npx tsc --noEmit` und `npx eslint` auf den geänderten Dateien: sauber, keine Fehler.

**Was NICHT verändert wurde (bewusst, war nicht Teil des Auftrags):**
- Alt-Text pro Bild ist beim Upload weiterhin leer (`alt: ""`) und im Admin nicht editierbar — nur Upload/Löschen/Sortieren. Kein Blocker für den aktuellen Auftrag, aber falls SEO/Barrierefreiheit der Bild-Alt-Texte mal wichtig wird, bräuchte es ein zusätzliches Formularfeld pro Bild.
- Die „Ausstattung"-Sektion unten auf `/wohnung` (Betten, Küche, Bad, …) ist weiterhin global/statisch aus dem Dictionary, nicht pro Wohnung editierbar — der Auftrag sprach von „Infos" im Sinne von Größe/Gäste/Schlafzimmer (die editierbar sind), nicht von einer pro-Wohnung-Ausstattungsliste. Falls das gewünscht ist, wäre das ein separates, größeres Schema-/UI-Thema.

Frühere offene Punkte aus noch älteren Sessions (SSO-Schutz auf `.vercel.app`-URLs, Rechtsdaten-Domain-Mismatch, `main` hinter Production) — Stand dazu siehe Git-Historie/vorherige Commits, hier nicht dupliziert.

## Architektur (weiterhin gültig)

- **DB:** Vercel Postgres via Neon, Drizzle ORM (`drizzle-orm/neon-http`, **kein** `db.transaction()` — Treiber unterstützt keine Transaktionen). Reorder-Operationen (Bilder wie auch Wohnungen) sind deshalb zwei sequenzielle `UPDATE`s statt einer Transaktion — bei einem sehr seltenen Race würde man einfach nochmal klicken müssen, kein funktionaler Bug.
- **Blob:** `@vercel/blob`, Store `auszeit-website-11`, `access: public`
- **Auth:** NextAuth v5 (Credentials-Provider, JWT-Session), kein Users-Table — Admin-Identität aus `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` (bcrypt) Env-Vars.
- **Rendering:** DB-lesende Seiten sind `export const dynamic = "force-dynamic"` + `revalidatePath(...)` in Server Actions.
- **Wohnungen-Schema** (`src/db/schema.ts`): `apartments` (slug, name, description, sizeSqm, guests, bedrooms, sortOrder) + `apartmentImages` (url, alt, sortOrder, cascade on delete). `getApartments()`/`getApartment(id)` in `src/db/queries.ts` liefern immer inkl. sortierter `images`-Relation.
- **`siteSettings`-Schema:** Singleton-Row (immer nur eine Zeile), Kontaktdaten + Rechtstexte + (seit dieser Session) Branding/Theme/Startseiten-Felder, siehe oben.
- **Public-Seite `/[lang]/wohnung`:** zeigt alle DB-Wohnungen im Slider (`WohnungenSlider`/`WohnungenShowcase`), keine künstliche Obergrenze. Reihenfolge = `sortOrder`, steuerbar im Admin.
