# Devnotes — laufender Stand

> Scratch-Datei für Session-Kontinuität. Wird bei größeren Unterbrechungen aktualisiert, damit eine neue Session nahtlos weitermachen kann. Kein öffentlich relevantes Doc — bei Bedarf löschen/ins .gitignore, wenn das Projekt "fertig" ist.

## Aktueller Stand

**Branch:** `feature/admin-design-editor` — gepusht nach `origin` (GitHub `codewithmaik/auszeit-website-11`), **nicht** nach `main` gemerged. Working tree sauber (bis auf absichtlich ungetrackte `.agents/`, `.claude/`, `auszeit-apartments/`, `skills-lock.json`, s. u.).
**Dev-Server:** läuft im Hintergrund auf `http://localhost:3002`, Log unter `/tmp/auszeit-dev.log`. **`ADMIN_PASSWORD_HASH` in `.env.local` ist aktuell temporär auf ein Test-Passwort gesetzt** (für die laufenden Browser-Klicktests dieser Session, User-Zustimmung eingeholt) — Original-Hash liegt gesichert unter `/private/tmp/claude-501/.../scratchpad/env.local.backup`, wird am Ende dieser Session exakt zurückgesetzt (Diff verifiziert).
**Production:** läuft über `auszeit-mosel.vercel.app` — **das ist die einzige gültige Domain für dieses Projekt**, alle anderen `.vercel.app`-Aliase (`auszeit-website-11.vercel.app`, `auszeit-mosel-codewithmaik.vercel.app`) werden nach jedem Deploy wieder entfernt (s. „Domain-Aufräumen" unten, inkl. **wichtigem Hinweis für jeden künftigen Deploy**).

Der komplette Admin-Design-Editor (siehe „Frühere Session" unten) ist inzwischen committed (`9bdeec9`, `4eeda79`, `28f74cd`) und deployed — der frühere Hinweis „noch nicht committed" in dieser Datei war veraltet.

## Session: Design-Editor Runde 2 — Entwurf-Absicherung, Navbar/Footer im Preview, individuelle Buttons (laufend)

**Auftrag:** (1) Verifizieren, dass Textfarb-Änderungen etc. wirklich nur im Entwurf landen statt live zu wirken (User-Meldung, war seit 2 Sessions nie im Browser getestet). (2) Navbar ins Live-Vorschau-Preview aufnehmen, Farbpalette nur noch als Popup bei Navbar-Klick statt fixer Formular-Sektion. (3) Footer ins Preview, Footer-Texte editierbar. (4) Button-Gestaltung von global auf individuell pro Button umstellen (Hero-CTA 1/2, Navbar-CTA), inkl. Checkbox „alle Buttons linken" und Popup-internem Undo. Vollständiger Plan unter `~/.claude/plans/hazy-tumbling-bubble.md`. Scope-Entscheidung mit dem User abgestimmt: individuelle Button-Gestaltung gilt nur für die 3 im Preview sichtbaren Buttons, alle übrigen Buttons der Website (Wohnung/Bewertungen/Slider) bleiben am gemeinsamen Default-Stil.

**Phase 0 — Entwurf/Veröffentlichen-Trennung verifiziert: KEIN Bug gefunden.** Browser-Klicktest (temp. `ADMIN_PASSWORD_HASH`): Textfarbe eines Feldes geändert → Admin-Preview live, `/de` in zweitem Tab nach Reload unverändert → „Veröffentlichen" → `/de` zeigt Änderung → Änderung wieder zurückgesetzt und erneut veröffentlicht (Baseline sauber wiederhergestellt). Die bestehende Entwurf/Veröffentlichen-Architektur aus der letzten Session funktioniert wie vorgesehen; Punkt 1+2 der User-Meldung war also entweder veraltetes Feedback aus einer Session vor dem Entwurf/Veröffentlichen-Umbau, oder bezog sich auf die (gewollt) sofort reagierende Admin-eigene Vorschau. **Nebenbefund (nicht behoben, nicht Teil dieses Auftrags):** Der veröffentlichte `hero.title2`-Text enthielt einen Test-Artefakt-Suffix „.jkjk" (vermutlich Tipp-Test aus einer früheren Session, versehentlich veröffentlicht) — sollte bei Gelegenheit vom User bereinigt werden.

**Phase 2 — Navbar im Preview + Farbpalette als Popup — erledigt, committed (`eba3ef6`), gepusht.** `HomePreviewEditor.tsx`: „Branding"- und „Farbpalette"-Formularsektionen entfernt, stattdessen dekorative Navbar-Nachbildung (Logo/Logo-Schriftzug/Nav-Links/Anfragen-Button, keine echten Links) ganz oben in der Live-Vorschau. Klick auf Logo/Logo-Schriftzug (mit `stopPropagation`) öffnet weiterhin `ImageEditPopup`; Klick auf die restliche Navbar-Fläche öffnet neues `PaletteEditPopup` (`EditPopup.tsx`, `ActiveEditor`-Union um `kind: "palette"` erweitert) — Inhalt 1:1 aus der alten Sektion übernommen (10 Templates + „Eigene Farben"-Regler + Zurücksetzen). Keine Schema-/Action-Änderung nötig, bestehende `saveThemeColors`/`resetThemeColors` weiterverwendet. Nav-Link-Labels sind als statische DE/EN-Konstante hartkodiert (`PREVIEW_NAV_LABELS`) — bewusst nicht editierbar, da sitewide/dictionary-basiert und außerhalb des Design-Scopes. Im Browser verifiziert: Navbar rendert korrekt, Klick öffnet Popup, Template-Klick übernimmt Farben in die Vorschau (inkl. Buttons-Sektion, die weiterhin `colors.primary` als Default nutzt), Testfarbe danach wieder verworfen.

**Phase 3 — Footer im Preview + editierbare Footer-Texte — erledigt, committed (`3269b98`), gepusht.** Neue `siteSettings`-Spalten `footerContentDe`/`footerContentEn` (jsonb, `FooterContent`-Typ: `tagline`/`navHeading`/`kontaktHeading`/`copyrightSuffix`), `DesignDraft` erweitert, `db:push` gegen Dev-DB ausgeführt. Neue Server Actions `saveFooterContent`/`resetFooterContent` (`design/actions.ts`, analog `saveHomeTextAndStyles`/`resetHomeContent`). `fields.ts` um eigene `FOOTER_FIELDS`-Registry + `buildFooterContentFormData` erweitert (kleiner als `FIELDS`, da Footer-Texte bewusst nicht stylebar sind — kein Font-Picker/Farbe im Popup, nur DE/EN-Text). `HomePreviewEditor.tsx`: `openTextEditor`/`handleSaveText` branchen jetzt zuerst auf `FOOTER_FIELDS[id]`, bevor sie auf die Home-`FIELDS`-Registry zurückfallen — dadurch konnte das bestehende `TextEditPopup` 1:1 wiederverwendet werden. Footer-Nachbildung (Tagline, Navigation-Spalte mit den bereits fest hartkodierten Nav-Labels aus Phase 2, Kontakt-Spalte mit Platzhaltertext „Kontaktdaten aus Einstellungen", Copyright-Zeile, feste Legal-Link-Labels) rendert jetzt am Ende der Live-Vorschau, innerhalb desselben `previewThemeStyle`-Wrappers. Öffentliche `Footer.tsx` liest `settings.footerContentDe/En` mit Fallback auf `dict.footer` (identisches Muster wie `homeContentDe/En` in `[lang]/page.tsx`) — nur die 4 editierbaren Felder, Impressum/Datenschutz/Cookie/Credit-Zeile bleiben fest aus dem Dictionary. **Nebenfund gefixt:** `DEFAULT_SETTINGS` in `src/db/queries.ts` (Fallback-Objekt für nicht konfigurierte DB) hatte kein `footerContentDe/En` — TS-Fehler, ergänzt.

Im Browser verifiziert: Footer erscheint korrekt am Ende der Vorschau, Klick auf Tagline öffnet Popup mit DE/EN-Feldern (kein Stil-Bereich, wie gewollt), Änderung übernimmt sich in die Vorschau, Testtext danach wieder verworfen (`Entwurf verwerfen`).

**Noch offen (nächste Schritte dieser Session):** Phase 4 (individuelle Button-Gestaltung + Link-Checkbox + Popup-Undo), Phase 5 (End-to-End-Test aller neuen Features + `ADMIN_PASSWORD_HASH` final zurücksetzen).

## Session: Design-Editor — Entwurf/Veröffentlichen-Workflow + erweiterte Optionen (laufend)

**Auftrag:** Design-Menü überarbeiten — (1) Änderungen sollen nur noch in einem Entwurf landen und erst nach explizitem „Veröffentlichen" auf der echten Website sichtbar werden (bisher: sofort live), (2) die Vorschau soll Änderungen weiterhin sofort/live zeigen, (3) Text-Editier-Optionen um Fett/Kursiv/Unterstrichen + freie Schriftart pro Feld erweitern, (4) Bildzuschnitt beim Upload, (5) globale Button-Gestaltung (Randdicke/-farbe, Button-Farbe, Border-Radius, 10 Hover-Animationen), (6) immer sichtbarer „Zurück"-Button für die letzte Entwurfs-Änderung. Plan mit dem User abgestimmt (inkl. 3 Rückfragen: „Bild" in der Textformat-Liste = Tippfehler für „Fett"; Schriftart-Auswahl pro Textfeld statt global; Button-Optionen global für die ganze Website statt nur die 2 Hero-CTAs), vollständiger Plan liegt unter `~/.claude/plans/squishy-coalescing-scroll.md`.

**Umsetzung in 5 Phasen** (jede Phase: eigener Commit + Push + Devnotes-Update):
1. Entwurf/Veröffentlichen/Zurück-Infrastruktur — **erledigt, committed (`b8e56b9`), gepusht.**
2. Text-Erweiterungen (Fett/Kursiv/Unterstrichen + Schriftart pro Feld) — **erledigt, committed (`04e0381`), gepusht.** Neue Datei `src/lib/fonts.ts` mit 6 kuratierten Google Fonts (Inter, Lora, Merriweather, Montserrat, Nunito, Raleway; alle OFL-lizenziert, via `next/font/google` selbst gehostet — DSGVO-unbedenklich, siehe Kommentar in der Datei). Dropdown im `TextEditPopup`, Anwendung in `Editable` (Admin) + `styleFor()` (öffentliche Seite).
3. Bildzuschnitt — **erledigt, committed (`33983e6`), gepusht.** Neue Abhängigkeit `react-easy-crop` (MIT); `ImageEditPopup` zeigt nach Dateiauswahl einen Zuschnitt-Schritt mit festem Seitenverhältnis (Hero 16:9, Wohlfühl 4:3, Logo 1:1 rund, Logo-Schriftzug 3:1), Ergebnis wird clientseitig auf Canvas gerendert und als fertig zugeschnittene Datei hochgeladen.
4. Globale Button-Gestaltung — **erledigt, committed (`e8b2aa2`), gepusht.** Neue „Buttons"-Sektion im Editor (Randdicke, Button-/Rahmenfarbe, Border-Radius, 10 CSS-Hover-Animationen aus neuer Datei `src/lib/button-animations.ts`). Technik: CSS-Variablen (`--button-bg`/`--button-border-color`/`--button-border-width`/`--button-radius`) + ein `data-button-anim`-Attribut, dessen Regeln (`[data-button-anim="x"] .btn:hover` in `globals.css`) automatisch auf jedes Element mit der neuen `.btn`-Marker-Klasse wirken (`Button.tsx`) — dadurch musste **keine** bestehende Verwendungsstelle von `Button.tsx` (Header, Footer, Formulare, Hero-CTA auf der öffentlichen Seite, die den `Button` bereits wiederverwendet) angefasst werden. Farb-Overrides gelten bewusst nur für die markenfarben-basierten Varianten „primary"/„outline"; die weiße „outline-light"-Variante (dunkle Hero-/Fotohintergründe) bleibt unverändert, um die Lesbarkeit über Fotos nicht zu gefährden — falls das anders gewünscht ist, bitte Bescheid geben.
5. End-to-End-Check + Devnotes-Abschluss — **noch offen, blockiert auf Browser-Login** (s. „Was noch offen ist" unten).

**Phase 1 im Detail** (Commit `b8e56b9`):
- Neue `siteSettings`-Spalten (`src/db/schema.ts`, per `db:push` bereits gegen die Dev-DB ausgeführt): `designDraft` (jsonb, kompletter Entwurfs-Snapshot), `designDraftHistory` (jsonb-Array, Ringpuffer für „Zurück", Cap 20 Einträge), plus `buttonBorderWidth`/`buttonColor`/`buttonBorderColor`/`buttonBorderRadius`/`buttonAnimation` (Spalten für Phase 4 schon angelegt, aktuell ungenutzt/immer `null`).
- `DesignDraft`-Typ + `publishedDesignSnapshot()`/`effectiveDesignState()`-Helper (rein funktional, keine DB-Abhängigkeit) in `src/db/home-content.ts` — bauen den Entwurfs-Snapshot aus dem veröffentlichten Zustand bzw. liefern den effektiven Arbeitszustand (Entwurf ?? veröffentlicht).
- `src/app/admin/(dashboard)/design/actions.ts` komplett umgebaut: zentraler `saveDesignDraft()`-Helper (schreibt in den Entwurf, pusht vorherigen Entwurfsstand in die History), `publishDesign()` (kopiert Entwurf → veröffentlichte Spalten, räumt ersetzte Blob-Bilder auf, leert Entwurf+History), `discardDesignDraft()` (verwirft Entwurf, gibt den veröffentlichten Snapshot zurück, räumt verwaiste Blobs auf), `undoDesignDraft()` (holt letzten History-Eintrag zurück, gibt ihn zurück). Bild-Uploads schreiben die Blob-URL jetzt in den Entwurf statt direkt in die veröffentlichte Spalte — **wichtig:** dadurch wird das alte Blob beim Ersetzen nicht mehr sofort gelöscht (das würde das noch live geschaltete Bild kaputt machen), sondern erst beim Veröffentlichen/Verwerfen aufgeräumt.
- `HomePreviewEditor.tsx`: neue Toolbar oben (Zurück/Entwurf verwerfen/Veröffentlichen mit Inline-Bestätigung statt `window.confirm()`), Branding (Logo/Logo-Schriftzug) aus `design/page.tsx` hierher verschoben und auf denselben Klick-Popup-Mechanismus wie Hero-/Wohlfühl-Bild umgestellt (`ImageEditPopup` um `previewAspectClassName`/`round`-Props erweitert) — das war nötig, damit Logo-Änderungen denselben Entwurfszustand teilen wie der Rest (sonst hätte man den Seiten-Reload-Umweg über `router.refresh()`/Remount-`key` gebraucht; stattdessen synct `applyDraftState()` nach Undo/Verwerfen alle Felder manuell im Client-State).
- `HomeTextStyles` (`src/db/home-content.ts`) um `bold`/`italic`/`underline`/`fontFamily` erweitert; `TextEditPopup` (`EditPopup.tsx`) hat jetzt drei Toggle-Buttons (Fett/Kursiv/Unterstrichen); Admin-Vorschau (`Editable`) und öffentliche Seite (`styleFor()` in `src/app/[lang]/page.tsx`) wenden beide `fontWeight`/`fontStyle`/`textDecoration` an. `fontFamily` ist im Typ/in der Sanitize-Funktion schon vorbereitet, aber noch nirgends im UI wählbar (kommt mit der kuratierten Font-Liste in Phase 2).
- Verifiziert: `npx tsc --noEmit` und `npx eslint` auf allen geänderten Dateien sauber. `db:push` gegen die Dev-DB erfolgreich.
- **Noch nicht verifiziert:** der eigentliche Klick-Weg im Browser (Login → `/admin/design` → Entwurf anlegen → Vorschau bleibt live unverändert auf der öffentlichen Seite → Veröffentlichen → öffentliche Seite zeigt Änderung → Zurück/Verwerfen testen). Grund: zum Einloggen bräuchte es entweder das echte Admin-Passwort oder ein kurzzeitiges Ersetzen von `ADMIN_PASSWORD_HASH` in `.env.local` (wie in einer früheren Session gemacht) — der dafür nötige `node -e "bcrypt.hashSync(...)"`-Befehl wurde diesmal vom Auto-Mode-Classifier blockiert (als sensible Credential-Operation eingestuft). Es wurde **nicht** versucht, das zu umgehen. Für den Rest der Session daher: entweder der User loggt sich einmal selbst unter `/admin/design` (oder `/bierp4a4/login`) ein und ich mache mit der bereits authentifizierten Chrome-Session weiter, oder der User erlaubt den bcrypt-Befehl explizit.

## Was noch offen ist (aktuelle Session)

Phasen 1–4 sind alle committed und gepusht (`b8e56b9`, `04e0381`, `33983e6`, `e8b2aa2`, Devnotes-Commits dazwischen). `npx tsc --noEmit` und `npx eslint` sind nach jeder Phase über alle geänderten Dateien sauber durchgelaufen, der Dev-Server (`localhost:3002`) kompiliert ohne Fehler.

**Phase 5 (End-to-End-Klicktest im Browser) wurde bewusst übersprungen** — der Login dafür brauchte entweder ein kurzzeitiges Ersetzen von `ADMIN_PASSWORD_HASH` (der dafür nötige `node -e "bcrypt.hashSync(...)"`-Befehl wurde vom Auto-Mode-Classifier als sensible Credential-Operation blockiert) oder dass der User sich selbst einloggt. Der User hat sich explizit dafür entschieden, **ohne** Browser-Test zu committen und die Website bei Gelegenheit selbst zu prüfen. Das heißt: alles ist auf `feature/admin-design-editor` gepusht und typ-/lint-sauber, aber **der eigentliche Klick-Weg im Adminpanel ist nicht verifiziert** — insbesondere:

1. Login → `/admin/design` → kompletter Editor lädt fehlerfrei.
2. Entwurf/Veröffentlichen/Zurück: Text bearbeiten → Vorschau live → **öffentliche Seite bleibt unverändert**, bis „Veröffentlichen" geklickt wird → danach sichtbar. „Zurück" mehrfach nutzbar. „Entwurf verwerfen" stellt den veröffentlichten Stand wieder her.
3. Fett/Kursiv/Unterstrichen + Schriftart-Dropdown im Text-Popup.
4. Bildzuschnitt (react-easy-crop) für alle vier Slots (Hero/Wohlfühl/Logo/Logo-Schriftzug), inkl. rundem Zuschnitt beim Logo.
5. Buttons-Sektion: Randdicke/Farbe/Rahmenfarbe/Radius/Animation setzen, veröffentlichen, auf `/de` prüfen (insbesondere ob die 10 CSS-Animationen wie erwartet aussehen — die visuelle Feinabstimmung wurde nie im Browser gesehen, nur aus der CSS-Definition heraus konstruiert).

**Nächste Session sollte mit genau diesem Klicktest starten**, bevor an weiteren Features gebaut wird — das ist die einzige noch fehlende Absicherung für die komplette Session.

Danach: ggf. `feature/admin-design-editor` mit dem User besprechen (Merge nach `main`? Bislang läuft Production direkt vom Branch, s. „Was noch offen ist" weiter unten in den älteren Sessions).

## Session: Startseite als Live-Vorschau-Editor + Farbpaletten-Templates

**Auftrag:** Design-Menüpunkt komplett umgebaut — statt langem Formular eine anklickbare Live-Vorschau der Startseite (Klick auf Text/Bild → Popup zum Bearbeiten, inkl. Schriftgröße/-farbe je Feld), plus 10 kuratierte Farbpaletten-Templates zum Ein-Klick-Anwenden.

- Neue Komponenten unter `src/components/admin/home-editor/` (`HomePreviewEditor.tsx`, `EditPopup.tsx`, `fields.ts` = Feld-Registry mit Get/Set pro Pfad, `palettes.ts` = die 10 Templates).
- Neue DB-Spalte `home_text_styles` (jsonb, `siteSettings`) — Schriftgröße/-farbe-Override je Feldpfad, geteilt über beide Sprachen. Per `db:push` live in Neon angelegt.
- **Wichtig:** Die öffentliche Startseite (`src/app/[lang]/page.tsx`) muss `settings.homeTextStyles` selbst auslesen und anwenden (`styleFor()`-Helper) — das wurde in dieser Session zunächst vergessen (nur die Admin-Vorschau hat die Styles gerendert) und beim Live-Test in Chrome nachträglich gefixt. Bei ähnlichen Erweiterungen des Editors immer prüfen, ob Admin-Vorschau UND öffentliche Seite beide den neuen State lesen.
- End-to-End im Chrome-Browser getestet (Login, Textstil-Popup, Palette-Klick, Persistenz nach Reload, Wirkung auf der echten `/de`-Seite) — dafür kurzzeitig `ADMIN_PASSWORD_HASH` in `.env.local` auf ein Test-Passwort gesetzt und danach exakt zurückgesetzt (Diff verifiziert).
- Commit `ea5d6db`, gepusht, per `vercel --prod --scope codewithmaik` deployed. Danach wie gewohnt `auszeit-mosel.vercel.app` per `vercel alias set` nachgezogen und die beiden Nebenaliase entfernt (s. Hinweis unten — passiert bei **jedem** `--prod`-Deploy erneut).

## Frühere Session: Footer-Link + Domain-Aufräumen

**Auftrag:** Im Footer bei „Technische Umsetzung: codewithmaik" zusätzlich „coding-johnny" verlinken (→ `https://johnomwata-dev.vercel.app`), danach commit/push/deploy. Anschließend: Deploy soll wie bisher unter `auszeit-mosel.vercel.app` laufen, alle anderen Domains fürs Projekt entfernen.

- `src/components/Footer.tsx`: Credit-Zeile umgebaut — Prefix + zwei separate `<a>`-Links („codewithmaik" → codewithmaik.com, „coding-johnny" → johnomwata-dev.vercel.app), gleiche Hover-Unterstrich-Optik wie vorher, durch „&" getrennt. Commit `0d60548`.
- **Domain-Befund:** Das Vercel-Projekt `auszeit-mosel` hatte zwischenzeitlich 3 `.vercel.app`-Aliase: `auszeit-mosel.vercel.app` (Zieldomain), `auszeit-website-11.vercel.app` (war durch einen `vercel --prod`-Deploy zur „Latest Production URL" geworden, obwohl `auszeit-mosel.vercel.app` gar nicht mitaktualisiert wurde) und `auszeit-mosel-codewithmaik.vercel.app` (Team-Default-Alias). **Fix:** `vercel alias set` hat `auszeit-mosel.vercel.app` explizit auf den aktuellen Production-Deployment gesetzt, danach `vercel alias rm` für die beiden anderen. Verifiziert: `auszeit-mosel.vercel.app` → 200 (redirect auf `/de`), `auszeit-website-11.vercel.app` → 404.
- **Hinweis für zukünftige Deploys:** `vercel project ls` zeigt in der Spalte „Latest Production URL" ggf. weiterhin eine veraltete Domain an (gecachtes Projekt-Metadatenfeld, kein Live-Routing) — die tatsächlich aktive Domain ist die, die in `vercel alias ls` auf den neuesten Deployment-Hash zeigt. Bei künftigen `vercel --prod`-Deploys prüfen, ob `auszeit-mosel.vercel.app` automatisch mitaktualisiert wird oder ob wieder ein manuelles `vercel alias set` nötig ist.
- **Bestätigt reproduzierbar (2026-08-30):** Jeder `vercel --prod`-Deploy legt automatisch die beiden Aliase `auszeit-website-11.vercel.app` und `auszeit-mosel-codewithmaik.vercel.app` neu an (Projekt-Default-Aliase), **ohne** `auszeit-mosel.vercel.app` mitzuziehen — das bleibt auf dem vorherigen Deployment stehen, bis man es manuell nachzieht. **Nach jedem Production-Deploy also immer:**
  1. `vercel alias set <neue-deployment-url> auszeit-mosel.vercel.app --scope codewithmaik`
  2. `vercel alias rm auszeit-website-11.vercel.app --scope codewithmaik --yes`
  3. `vercel alias rm auszeit-mosel-codewithmaik.vercel.app --scope codewithmaik --yes`
  4. Verifizieren: `curl -o /dev/null -w '%{http_code}' https://auszeit-mosel.vercel.app/de` → `200`, `.../auszeit-website-11.vercel.app/de` → `404`.
  `auszeit-mosel.vercel.app` ist laut User die **einzige gültige Domain** für dieses Projekt — alle anderen `.vercel.app`-Aliase sind unerwünscht und nach jedem Deploy zu entfernen.

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
