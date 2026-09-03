// Rechnungsgenerator — Typen + reine Rechen-/Formatierungs-Helfer.
// Bewusst ohne React- und DB-Importe: wird von der DB-Schicht (jsonb-Typen in
// src/db/schema.ts), den Server Actions, der HTML-Vorschau
// (src/components/admin/invoice/InvoiceDocument.tsx) und dem PDF-Renderer
// (InvoicePdf.tsx) gemeinsam genutzt.

import { BUSINESS } from "./site";

export type InvoiceTaxMode = "kleinunternehmer" | "regelbesteuerung";

/** Aussteller-/Steuer-/Bankdaten — Admin-pflegbar unter „Einstellungen". */
export type InvoiceSettings = {
  issuerName: string;
  issuerAddressLine: string;
  issuerZip: string;
  issuerCity: string;
  issuerCountry: string;
  issuerPhone: string;
  issuerEmail: string;
  issuerWebsite: string;
  logoUrl: string | null;

  taxMode: InvoiceTaxMode;
  taxNumber: string; // Steuernummer
  vatId: string; // USt-IdNr

  accountHolder: string;
  iban: string;
  bic: string;
  bankName: string;

  // Regelbesteuerung: Standard-USt-Sätze für die zwei üblichen Positionsarten.
  vatRateAccommodation: number; // z. B. 7 (Beherbergung, ermäßigt)
  vatRateExtras: number; // z. B. 19 (Endreinigung o. Ä.)

  invoiceNumberPrefix: string; // z. B. "AZ-2026-"
  invoiceNumberNextSeq: number; // nächste laufende Nummer

  paymentTermDays: number; // Zahlungsziel in Tagen
  footerNote: string; // freie Fußzeile
};

export type InvoiceLineItem = {
  description: string;
  qty: number;
  unitPrice: number; // EUR, brutto=netto solange Kleinunternehmer
  vatRate: number; // Prozent (0 bei Kleinunternehmer)
};

export type InvoiceParty = {
  name: string;
  addressLine: string;
  zip: string;
  city: string;
  country: string;
  email: string;
};

/**
 * Immutabler Snapshot einer Rechnung zum Zeitpunkt des Speicherns. Anzeige und
 * PDF rechnen ausschließlich hiergegen, nie gegen die Live-Einstellungen.
 */
export type InvoiceData = {
  issuer: {
    name: string;
    addressLine: string;
    zip: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string | null;
    taxNumber: string;
    vatId: string;
    accountHolder: string;
    iban: string;
    bic: string;
    bankName: string;
    footerNote: string;
  };
  recipient: InvoiceParty;
  invoiceNumber: string | null; // null = Entwurf
  issueDate: string | null; // ISO, null = Entwurf
  servicePeriod: { from: string; to: string }; // Anreise / Abreise (ISO)
  apartmentName: string;
  guests: string;
  lineItems: InvoiceLineItem[];
  taxMode: InvoiceTaxMode;
  paymentTermDays: number;
  note: string;
};

// --- Defaults / Auflösung -----------------------------------------------------

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  issuerName: BUSINESS.name,
  issuerAddressLine: BUSINESS.streetAddress,
  issuerZip: BUSINESS.postalCode,
  issuerCity: BUSINESS.addressLocality,
  issuerCountry: "Deutschland",
  issuerPhone: BUSINESS.telephone,
  issuerEmail: BUSINESS.email,
  issuerWebsite: "",
  logoUrl: null,
  taxMode: "kleinunternehmer",
  taxNumber: "",
  vatId: "",
  accountHolder: "",
  iban: "",
  bic: "",
  bankName: "",
  vatRateAccommodation: 7,
  vatRateExtras: 19,
  invoiceNumberPrefix: `AZ-${new Date().getFullYear()}-`,
  invoiceNumberNextSeq: 1,
  paymentTermDays: 14,
  footerNote: "",
};

export function resolveInvoiceSettings(raw: Partial<InvoiceSettings> | null | undefined): InvoiceSettings {
  return { ...DEFAULT_INVOICE_SETTINGS, ...(raw ?? {}) };
}

export function buildNextInvoiceNumber(settings: InvoiceSettings): string {
  return `${settings.invoiceNumberPrefix}${String(settings.invoiceNumberNextSeq).padStart(4, "0")}`;
}

/** Baut den immutablen `issuer`-Block aus den aktuellen Einstellungen. */
export function issuerFromSettings(s: InvoiceSettings): InvoiceData["issuer"] {
  return {
    name: s.issuerName,
    addressLine: s.issuerAddressLine,
    zip: s.issuerZip,
    city: s.issuerCity,
    country: s.issuerCountry,
    phone: s.issuerPhone,
    email: s.issuerEmail,
    website: s.issuerWebsite,
    logoUrl: s.logoUrl,
    taxNumber: s.taxNumber,
    vatId: s.vatId,
    accountHolder: s.accountHolder,
    iban: s.iban,
    bic: s.bic,
    bankName: s.bankName,
    footerNote: s.footerNote,
  };
}

export type InvoiceInput = {
  recipient: InvoiceParty;
  servicePeriod: { from: string; to: string };
  apartmentName: string;
  guests: string;
  lineItems: InvoiceLineItem[];
  note: string;
};

/** Baut den immutablen Rechnungs-Snapshot (noch ohne Nummer/Datum = Entwurf). */
export function buildInvoiceData(input: InvoiceInput, settings: InvoiceSettings): InvoiceData {
  return {
    issuer: issuerFromSettings(settings),
    recipient: input.recipient,
    invoiceNumber: null,
    issueDate: null,
    servicePeriod: input.servicePeriod,
    apartmentName: input.apartmentName,
    guests: input.guests,
    lineItems: input.lineItems,
    taxMode: settings.taxMode,
    paymentTermDays: settings.paymentTermDays,
    note: input.note,
  };
}

// --- Rechnen ----------------------------------------------------------------

export type InvoiceVatGroup = { rate: number; net: number; vat: number };

export type InvoiceTotals = {
  lines: (InvoiceLineItem & { net: number })[];
  vatGroups: InvoiceVatGroup[]; // leer bei Kleinunternehmer
  netTotal: number;
  vatTotal: number;
  grossTotal: number;
  isKleinunternehmer: boolean;
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeInvoiceTotals(data: Pick<InvoiceData, "lineItems" | "taxMode">): InvoiceTotals {
  const isKleinunternehmer = data.taxMode === "kleinunternehmer";
  const lines = data.lineItems.map((item) => ({
    ...item,
    net: round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)),
  }));

  const netTotal = round2(lines.reduce((sum, l) => sum + l.net, 0));

  if (isKleinunternehmer) {
    return {
      lines,
      vatGroups: [],
      netTotal,
      vatTotal: 0,
      grossTotal: netTotal,
      isKleinunternehmer,
    };
  }

  const byRate = new Map<number, number>();
  for (const l of lines) {
    const rate = Number(l.vatRate) || 0;
    byRate.set(rate, round2((byRate.get(rate) ?? 0) + l.net));
  }
  const vatGroups: InvoiceVatGroup[] = [...byRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, net]) => ({ rate, net, vat: round2((net * rate) / 100) }));

  const vatTotal = round2(vatGroups.reduce((sum, g) => sum + g.vat, 0));
  return {
    lines,
    vatGroups,
    netTotal,
    vatTotal,
    grossTotal: round2(netTotal + vatTotal),
    isKleinunternehmer,
  };
}

// --- Formatierung ----------------------------------------------------------

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function formatEuro(n: number): string {
  return EURO.format(Number.isFinite(n) ? n : 0);
}

/** "2026-09-20" -> "20.09.2026" */
export function formatInvoiceDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

/** ISO-Datum + n Tage. */
export function addDaysIso(iso: string, days: number): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split("T")[0];
}

/** Nächte zwischen Anreise (inkl.) und Abreise (exkl.). */
export function nightsBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export const KLEINUNTERNEHMER_NOTE =
  "Gemäß § 19 Abs. 1 UStG wird keine Umsatzsteuer berechnet.";
