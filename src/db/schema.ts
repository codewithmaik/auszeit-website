import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type {
  HomeContent,
  HomeTextStyles,
  FooterContent,
  NavLabels,
  ButtonStyles,
  DesignDraft,
  LogoMode,
  IconOverrides,
} from "./home-content";
import type { InvoiceData, InvoiceSettings } from "../lib/invoice";

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  contactAddress: text("contact_address").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  impressumContent: text("impressum_content").notNull().default(""),
  impressumContentEn: text("impressum_content_en").notNull().default(""),
  datenschutzContent: text("datenschutz_content").notNull().default(""),
  datenschutzContentEn: text("datenschutz_content_en").notNull().default(""),

  // Navbar-Branding (Logo/Logo-Schriftzug als Bild-Upload)
  logoImageUrl: text("logo_image_url"),
  logoTextImageUrl: text("logo_text_image_url"),
  // Größenfaktor des Logo-Schriftzugs (String einer Dezimalzahl 0.6–1.6),
  // null = Standardgröße. "combined" = ein Bild (logoImageUrl) ersetzt Logo
  // UND Schriftzug, logoTextImageUrl wird dann ignoriert.
  logoTextScale: text("logo_text_scale"),
  logoMode: text("logo_mode").notNull().default("separate").$type<LogoMode>(),

  // Sitewide Farbpalette — kuratierte Kernfarben, überschreiben die CSS-Variablen
  // aus globals.css. null = Standardfarbe aus dem Code.
  themePrimary: text("theme_primary"),
  themePrimaryDark: text("theme_primary_dark"),
  themeAccent: text("theme_accent"),
  themeBackground: text("theme_background"),

  // Startseiten-Bilder
  homeHeroImageUrl: text("home_hero_image_url"),
  homeWohlfuehlImageUrl: text("home_wohlfuehl_image_url"),
  // Ausgewählte Hintergrundbild-Animation (Key aus IMAGE_ANIMATION_OPTIONS,
  // src/lib/image-animations.ts). null = kein Animations-Effekt.
  homeHeroAnimation: text("home_hero_animation"),
  homeWohlfuehlAnimation: text("home_wohlfuehl_animation"),

  // Startseiten-Texte je Sprache, komplettes Objekt (Struktur siehe HomeContent).
  // null = Dictionary-Default wird verwendet.
  homeContentDe: jsonb("home_content_de").$type<HomeContent>(),
  homeContentEn: jsonb("home_content_en").$type<HomeContent>(),

  // Schriftgröße/-farbe je Startseiten-Textfeld (Feldpfad -> Override), gilt für
  // beide Sprachen gleichermaßen (rein visuelle Einstellung). null/fehlender
  // Eintrag = Standardgröße/-farbe aus dem Layout.
  homeTextStyles: jsonb("home_text_styles").$type<HomeTextStyles>(),

  // Editierbare Footer-Texte je Sprache (Tagline, Spalten-Überschriften,
  // Copyright-Suffix). null = Dictionary-Default (dict.footer) wird verwendet.
  footerContentDe: jsonb("footer_content_de").$type<FooterContent>(),
  footerContentEn: jsonb("footer_content_en").$type<FooterContent>(),

  // Editierbare Navbar-Link-Texte je Sprache (geteilt zwischen Header und
  // Footer-Navigationsspalte). null = Dictionary-Default (dict.nav) wird
  // verwendet.
  navLabelsDe: jsonb("nav_labels_de").$type<NavLabels>(),
  navLabelsEn: jsonb("nav_labels_en").$type<NavLabels>(),

  // Default-Button-Stil — Fallback für alle Buttons, die keinen individuellen
  // Override haben (buttonStyles unten), inkl. aller Buttons außerhalb des
  // Design-Preview-Scopes (Wohnung/Bewertungen/Slider). null = Standard.
  buttonBorderWidth: text("button_border_width"),
  buttonColor: text("button_color"),
  buttonBorderColor: text("button_border_color"),
  buttonBorderRadius: text("button_border_radius"),
  buttonAnimation: text("button_animation"),

  // Individuelle Button-Gestaltung je Button-ID (siehe BUTTON_IDS in
  // home-content.ts) — überschreibt den Default-Stil oben nur für diesen einen
  // Button. `buttonsLinked` steuert die "Für alle Buttons übernehmen"-Checkbox
  // im Button-Popup: bei true schreibt jede Änderung gleichzeitig in alle drei
  // Button-IDs UND in den Default-Stil (siehe saveButtonEdit-Action).
  buttonStyles: jsonb("button_styles").$type<ButtonStyles>(),
  buttonsLinked: boolean("buttons_linked").notNull().default(false),

  // Icon-Overrides für Feature-Kacheln/Schritte/Vertrauensleiste (Index ->
  // hochgeladene Bild-URL). null/fehlender Eintrag = Standard-Icon.
  featureIconOverrides: jsonb("feature_icon_overrides").$type<IconOverrides>(),
  stepIconOverrides: jsonb("step_icon_overrides").$type<IconOverrides>(),
  trustIconOverrides: jsonb("trust_icon_overrides").$type<IconOverrides>(),

  // Globaler Foto-Filter für alle Wohnungs-Fotos (Titelbilder + Galerie),
  // Template-Key aus PHOTO_FILTER_OPTIONS (src/lib/photo-filters.ts).
  // apartmentPhotoFilter = veröffentlicht, null = kein Filter. Eigener
  // leichtgewichtiger Entwurf/Veröffentlichen-Mechanismus (nur ein Wert statt
  // eines kompletten Snapshots wie beim Design-Editor, s. designDraft oben):
  // apartmentPhotoFilterDraft null = kein offener Entwurf (Anzeige folgt dem
  // veröffentlichten Wert), Sentinel-String "none" = Entwurf explizit „kein
  // Filter", jeder andere Wert = Template-Key.
  apartmentPhotoFilter: text("apartment_photo_filter"),
  apartmentPhotoFilterDraft: text("apartment_photo_filter_draft"),

  // Aussteller-/Steuer-/Bankdaten + Nummernkreis für den Rechnungsgenerator
  // (Posteingang → „Als gebucht" → „Rechnung vorbereiten"). Komplettes Objekt,
  // Struktur siehe InvoiceSettings (src/lib/invoice.ts). null = Defaults aus
  // BUSINESS (src/lib/site.ts) / Feldvorgaben.
  invoiceSettings: jsonb("invoice_settings").$type<InvoiceSettings>(),

  // Entwurf/Veröffentlichen-Workflow: `designDraft` hält den kompletten, noch
  // nicht veröffentlichten Bearbeitungsstand aller obigen Design-Felder (siehe
  // DesignDraft-Typ). null = kein offener Entwurf, Admin-Vorschau zeigt den
  // veröffentlichten Stand. `designDraftHistory` ist ein Ringpuffer vorheriger
  // Entwurfs-Snapshots für den „Zurück"-Button (neuester Eintrag zuerst).
  designDraft: jsonb("design_draft").$type<DesignDraft>(),
  designDraftHistory: jsonb("design_draft_history").$type<DesignDraft[]>(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sizeSqm: text("size_sqm").notNull(),
  guests: text("guests").notNull(),
  bedrooms: text("bedrooms").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const apartmentImages = pgTable("apartment_images", {
  id: serial("id").primaryKey(),
  apartmentId: integer("apartment_id")
    .notNull()
    .references(() => apartments.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apartmentsRelations = relations(apartments, ({ many }) => ({
  images: many(apartmentImages),
}));

export const apartmentImagesRelations = relations(apartmentImages, ({ one }) => ({
  apartment: one(apartments, {
    fields: [apartmentImages.apartmentId],
    references: [apartments.id],
  }),
}));

// Posteingang: Buchungsanfragen aus dem Kontaktformular (aktuell noch mit
// Dummy-Daten befüllt, da das Formular selbst noch nicht produktiv sendet).
export const bookingRequests = pgTable("booking_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: text("guests").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("neu").$type<BookingRequestStatus>(),
  // Sprache, in der das Kontaktformular abgeschickt wurde ("de" | "en").
  locale: text("locale").notNull().default("de"),
  // Kompletter Formular-Datensatz beim Absenden (alle Felder + Zeitpunkt),
  // rohe Kopie für Nachvollziehbarkeit / spätere Felder.
  rawPayload: jsonb("raw_payload").$type<Record<string, string>>(),
  // Beim Bestätigen gewählte Wohnung — für die Anzeige „Gebucht · Wohnung X"
  // in der Anfragenliste. null = noch keine Wohnung zugeordnet.
  apartmentId: integer("apartment_id").references(() => apartments.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// E-Mail-/Notiz-Konversation je Buchungsanfrage (Posteingang → Anfrage öffnen
// → Chatverlauf). Die erste Zeile jeder Anfrage ist die Formular-Nachricht
// selbst (channel "form", direction "incoming"). Ausgehende Antworten werden
// über Resend verschickt (src/lib/email.ts) und hier protokolliert.
export const bookingMessages = pgTable("booking_messages", {
  id: serial("id").primaryKey(),
  bookingRequestId: integer("booking_request_id")
    .notNull()
    .references(() => bookingRequests.id, { onDelete: "cascade" }),
  direction: text("direction").notNull().$type<"incoming" | "outgoing">(),
  channel: text("channel").notNull().$type<"form" | "email" | "note">(),
  fromName: text("from_name"),
  fromEmail: text("from_email"),
  toEmail: text("to_email"),
  subject: text("subject"),
  body: text("body").notNull().default(""),
  // Resend-Message-ID bei ausgehenden E-Mails (null bei Notizen / Formular /
  // fehlgeschlagenem Versand).
  providerMessageId: text("provider_message_id"),
  // Admin-Login, der die Nachricht ausgelöst hat (null bei Formular/eingehend).
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rechnungen aus dem Buchungs-Popup. `data` ist ein immutabler Snapshot aller
// Angaben zum Zeitpunkt des Speicherns (Aussteller, Empfänger, Positionen,
// Steuermodus) — die Anzeige rechnet nie gegen die Live-Einstellungen.
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  bookingRequestId: integer("booking_request_id").references(() => bookingRequests.id, {
    onDelete: "set null",
  }),
  // null solange Entwurf; beim Finalisieren aus dem Nummernkreis vergeben.
  invoiceNumber: text("invoice_number").unique(),
  status: text("status").notNull().default("entwurf").$type<"entwurf" | "final">(),
  // Öffentlicher Share-Token (crypto.randomUUID() ohne Bindestriche).
  token: text("token").notNull().unique(),
  data: jsonb("data").notNull().$type<InvoiceData>(),
  // Blob-URL der generierten PDF (erst nach „Absenden"/„Link teilen").
  pdfUrl: text("pdf_url"),
  issuedAt: date("issued_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Verfügbarkeitskalender pro Wohnung. Nur belegte Tage haben eine Zeile — ein
// Tag ohne Eintrag gilt für diese Wohnung als frei. Jede Zeile gehört zu genau
// einer Wohnung (`apartmentId`) und zu genau einer Buchung (`bookingGroupId`,
// gruppiert alle Tage einer Belegung, damit Bearbeiten/Freigeben die ganze
// Buchung trifft). Gastdaten sind pro Tag denormalisiert.
export const calendarDays = pgTable(
  "calendar_days",
  {
    id: serial("id").primaryKey(),
    apartmentId: integer("apartment_id")
      .notNull()
      .references(() => apartments.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    // Buchungsspanne, zu der dieser Tag gehört (Anreise inkl., Abreise exkl.).
    checkIn: date("check_in"),
    checkOut: date("check_out"),
    // Gruppiert alle Tage einer Belegung (crypto.randomUUID() in der Action).
    bookingGroupId: text("booking_group_id").notNull(),
    guestName: text("guest_name"),
    guestEmail: text("guest_email"),
    guestPhone: text("guest_phone"),
    guests: text("guests"),
    note: text("note"),
    bookingRequestId: integer("booking_request_id").references(() => bookingRequests.id, {
      onDelete: "set null",
    }),
    // Verknüpfte Rechnung (aus dem Buchungs-Popup mit „Rechnung vorbereiten").
    // Für die „Rechnung erstellt"-Zeile im Kalender-Popup. null = keine Rechnung.
    invoiceId: integer("invoice_id").references(() => invoices.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("calendar_days_apartment_date_uq").on(t.apartmentId, t.date)],
);

export const bookingRequestsRelations = relations(bookingRequests, ({ one, many }) => ({
  calendarDays: many(calendarDays),
  messages: many(bookingMessages),
  invoices: many(invoices),
  apartment: one(apartments, {
    fields: [bookingRequests.apartmentId],
    references: [apartments.id],
  }),
}));

export const bookingMessagesRelations = relations(bookingMessages, ({ one }) => ({
  bookingRequest: one(bookingRequests, {
    fields: [bookingMessages.bookingRequestId],
    references: [bookingRequests.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  bookingRequest: one(bookingRequests, {
    fields: [invoices.bookingRequestId],
    references: [bookingRequests.id],
  }),
}));

export const calendarDaysRelations = relations(calendarDays, ({ one }) => ({
  bookingRequest: one(bookingRequests, {
    fields: [calendarDays.bookingRequestId],
    references: [bookingRequests.id],
  }),
  apartment: one(apartments, {
    fields: [calendarDays.apartmentId],
    references: [apartments.id],
  }),
  invoice: one(invoices, {
    fields: [calendarDays.invoiceId],
    references: [invoices.id],
  }),
}));

export type BookingRequestStatus =
  | "neu"
  | "in_bearbeitung"
  | "gebucht"
  | "abgelehnt"
  | "archiviert";
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Apartment = typeof apartments.$inferSelect;
export type ApartmentImage = typeof apartmentImages.$inferSelect;
export type NewApartment = typeof apartments.$inferInsert;
export type NewApartmentImage = typeof apartmentImages.$inferInsert;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type NewBookingRequest = typeof bookingRequests.$inferInsert;
export type CalendarDay = typeof calendarDays.$inferSelect;
export type NewCalendarDay = typeof calendarDays.$inferInsert;
export type BookingMessage = typeof bookingMessages.$inferSelect;
export type NewBookingMessage = typeof bookingMessages.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
