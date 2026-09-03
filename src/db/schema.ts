import { pgTable, serial, text, integer, timestamp, jsonb, boolean, date } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ein einziger, seitenweiter Verfügbarkeitskalender (nicht pro Wohnung, das
// Kontaktformular fragt keine Wohnung ab). Nur belegte Tage haben eine
// Zeile — ein Tag ohne Eintrag gilt als frei.
export const calendarDays = pgTable("calendar_days", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  guestName: text("guest_name"),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  guests: text("guests"),
  note: text("note"),
  bookingRequestId: integer("booking_request_id").references(() => bookingRequests.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookingRequestsRelations = relations(bookingRequests, ({ many }) => ({
  calendarDays: many(calendarDays),
}));

export const calendarDaysRelations = relations(calendarDays, ({ one }) => ({
  bookingRequest: one(bookingRequests, {
    fields: [calendarDays.bookingRequestId],
    references: [bookingRequests.id],
  }),
}));

export type BookingRequestStatus = "neu" | "gebucht" | "abgelehnt" | "archiviert";
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Apartment = typeof apartments.$inferSelect;
export type ApartmentImage = typeof apartmentImages.$inferSelect;
export type NewApartment = typeof apartments.$inferInsert;
export type NewApartmentImage = typeof apartmentImages.$inferInsert;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type NewBookingRequest = typeof bookingRequests.$inferInsert;
export type CalendarDay = typeof calendarDays.$inferSelect;
export type NewCalendarDay = typeof calendarDays.$inferInsert;
