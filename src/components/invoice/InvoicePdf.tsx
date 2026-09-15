import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import {
  computeInvoiceTotals,
  formatEuro,
  formatInvoiceDate,
  addDaysIso,
  nightsBetween,
  KLEINUNTERNEHMER_NOTE,
  type InvoiceData,
} from "@/lib/invoice";

// PDF-Zwilling zu InvoiceDocument.tsx (HTML). Gemeinsame Datenquelle:
// InvoiceData + computeInvoiceTotals. @react-pdf/renderer braucht kein
// Chromium und rendert auf Vercel schnell/deterministisch.

const INK = "#20241c";
const SOFT = "#6b7160";
const LINE = "#d9dcd0";
const ACCENT = "#2c3226";

const s = StyleSheet.create({
  page: { paddingTop: 56, paddingBottom: 56, paddingHorizontal: 52, fontSize: 9.5, color: INK, lineHeight: 1.5, fontFamily: "Helvetica" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  issuerName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: ACCENT, letterSpacing: 0.5 },
  rightBlock: { textAlign: "right", color: SOFT, fontSize: 8.5 },
  rule: { borderBottomWidth: 2, borderBottomColor: ACCENT, marginVertical: 10 },
  senderLine: { fontSize: 7, color: SOFT, borderBottomWidth: 0.5, borderBottomColor: LINE, paddingBottom: 3, marginBottom: 6 },
  recipientName: { fontFamily: "Helvetica-Bold" },
  metaLabel: { color: SOFT, paddingRight: 12 },
  metaVal: { fontFamily: "Helvetica-Bold", textAlign: "right" },
  h1: { fontSize: 16, fontFamily: "Helvetica-Bold", color: ACCENT, marginTop: 20, marginBottom: 6 },
  intro: { color: SOFT, marginBottom: 12 },
  th: { fontFamily: "Helvetica-Bold", borderBottomWidth: 1.5, borderBottomColor: ACCENT, paddingVertical: 5 },
  td: { paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: LINE },
  totalsBox: { marginTop: 12, alignSelf: "flex-end", minWidth: 200 },
  note: { marginTop: 10, color: SOFT, fontStyle: "italic" },
  payBox: { marginTop: 20, padding: 12, backgroundColor: "#f6f6f0" },
  footer: { position: "absolute", left: 52, right: 52, bottom: 28, borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 6, fontSize: 7, color: SOFT, flexDirection: "row", justifyContent: "space-between" },
  watermark: { position: "absolute", top: 320, left: 90, fontSize: 80, fontFamily: "Helvetica-Bold", color: "#efe9dd", transform: "rotate(-24deg)" },
});

function cell(width: string | number, extra?: object) {
  return { width, ...extra } as const;
}

export function InvoicePdf({ data }: { data: InvoiceData }) {
  const totals = computeInvoiceTotals(data);
  const isDraft = !data.invoiceNumber;
  const issueDate = data.issueDate ?? new Date().toISOString().split("T")[0];
  const dueDate = addDaysIso(issueDate, data.paymentTermDays);
  const nights = nightsBetween(data.servicePeriod.from, data.servicePeriod.to);
  const { issuer, recipient } = data;
  const showVat = !totals.isKleinunternehmer;

  const meta: [string, string][] = [
    ["Rechnungs-Nr.", data.invoiceNumber ?? "— (Entwurf)"],
    ["Rechnungsdatum", formatInvoiceDate(data.issueDate)],
    ["Leistungszeitraum", `${formatInvoiceDate(data.servicePeriod.from)} – ${formatInvoiceDate(data.servicePeriod.to)}`],
    ["Wohnung", data.apartmentName || "—"],
    ["Gäste", data.guests || "—"],
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {isDraft && <Text style={s.watermark}>ENTWURF</Text>}

        <View style={s.row}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, kein DOM-<img> */}
            {issuer.logoUrl ? <Image src={issuer.logoUrl} style={{ height: 38 }} /> : null}
            <View>
              <Text style={s.issuerName}>{issuer.name}</Text>
              {issuer.website ? <Text style={{ color: SOFT }}>{issuer.website}</Text> : null}
            </View>
          </View>
          <View style={s.rightBlock}>
            <Text>{issuer.addressLine}</Text>
            <Text>{issuer.zip} {issuer.city}</Text>
            {issuer.country ? <Text>{issuer.country}</Text> : null}
            {issuer.phone ? <Text>Tel. {issuer.phone}</Text> : null}
            {issuer.email ? <Text>{issuer.email}</Text> : null}
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.row}>
          <View style={{ maxWidth: 240 }}>
            <Text style={s.senderLine}>
              {issuer.name} · {issuer.addressLine} · {issuer.zip} {issuer.city}
            </Text>
            <Text style={s.recipientName}>{recipient.name}</Text>
            <Text>{recipient.addressLine}</Text>
            <Text>{recipient.zip} {recipient.city}</Text>
            {recipient.country && recipient.country !== "Deutschland" ? <Text>{recipient.country}</Text> : null}
          </View>
          <View>
            {meta.map(([k, v]) => (
              <View key={k} style={{ flexDirection: "row", marginBottom: 2 }}>
                <Text style={s.metaLabel}>{k}</Text>
                <Text style={[s.metaVal, { minWidth: 120 }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={s.h1}>{isDraft ? "Rechnungsentwurf" : `Rechnung ${data.invoiceNumber}`}</Text>
        <Text style={s.intro}>
          Vielen Dank für Ihre Buchung. Für Ihren Aufenthalt
          {nights > 0 ? ` (${nights} ${nights === 1 ? "Nacht" : "Nächte"})` : ""} in{" "}
          {data.apartmentName || "unserer Ferienwohnung"} berechnen wir folgende Leistungen:
        </Text>

        {/* Positionen */}
        <View style={[s.row, s.th]}>
          <Text style={cell("7%")}>Pos.</Text>
          <Text style={cell(showVat ? "43%" : "51%")}>Beschreibung</Text>
          <Text style={[cell("12%"), { textAlign: "right" }]}>Menge</Text>
          <Text style={[cell("18%"), { textAlign: "right" }]}>Einzelpreis</Text>
          {showVat ? <Text style={[cell("8%"), { textAlign: "right" }]}>USt.</Text> : null}
          <Text style={[cell("18%"), { textAlign: "right" }]}>Betrag</Text>
        </View>
        {totals.lines.map((l, i) => (
          <View key={i} style={[s.row, s.td]}>
            <Text style={[cell("7%"), { color: SOFT }]}>{i + 1}</Text>
            <Text style={cell(showVat ? "43%" : "51%")}>{l.description}</Text>
            <Text style={[cell("12%"), { textAlign: "right" }]}>{String(l.qty)}</Text>
            <Text style={[cell("18%"), { textAlign: "right" }]}>{formatEuro(l.unitPrice)}</Text>
            {showVat ? <Text style={[cell("8%"), { textAlign: "right" }]}>{l.vatRate} %</Text> : null}
            <Text style={[cell("18%"), { textAlign: "right" }]}>{formatEuro(l.net)}</Text>
          </View>
        ))}

        {/* Summen */}
        <View style={s.totalsBox}>
          {totals.isKleinunternehmer ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Gesamtbetrag</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{formatEuro(totals.grossTotal)}</Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                <Text style={{ color: SOFT }}>Nettobetrag</Text>
                <Text>{formatEuro(totals.netTotal)}</Text>
              </View>
              {totals.vatGroups.map((g) => (
                <View key={g.rate} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                  <Text style={{ color: SOFT }}>zzgl. {g.rate} % USt.</Text>
                  <Text>{formatEuro(g.vat)}</Text>
                </View>
              ))}
              <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: ACCENT, paddingTop: 4, marginTop: 2 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Gesamtbetrag</Text>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{formatEuro(totals.grossTotal)}</Text>
              </View>
            </>
          )}
        </View>

        {totals.isKleinunternehmer ? <Text style={s.note}>{KLEINUNTERNEHMER_NOTE}</Text> : null}

        <View style={s.payBox}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Zahlungshinweis</Text>
          <Text style={{ marginBottom: 6 }}>
            Bitte überweisen Sie den Gesamtbetrag von {formatEuro(totals.grossTotal)} ohne Abzug bis zum{" "}
            {formatInvoiceDate(dueDate)}
            {data.invoiceNumber ? ` unter Angabe der Rechnungsnummer ${data.invoiceNumber}` : ""} auf folgendes Konto:
          </Text>
          {[
            ["Kontoinhaber", issuer.accountHolder || issuer.name],
            ["IBAN", issuer.iban || "—"],
            ["BIC", issuer.bic || "—"],
            ["Bank", issuer.bankName || "—"],
          ].map(([k, v]) => (
            <View key={k} style={{ flexDirection: "row", marginBottom: 1.5 }}>
              <Text style={{ color: SOFT, width: 80 }}>{k}</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{v}</Text>
            </View>
          ))}
        </View>

        {data.note ? <Text style={{ marginTop: 14 }}>{data.note}</Text> : null}

        <View style={s.footer} fixed>
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{issuer.name}</Text>
            <Text>{issuer.addressLine}, {issuer.zip} {issuer.city}</Text>
            <Text>
              {[
                issuer.taxNumber ? `Steuernummer: ${issuer.taxNumber}` : null,
                issuer.vatId ? `USt-IdNr.: ${issuer.vatId}` : null,
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </Text>
          </View>
          <View style={{ textAlign: "right" }}>
            {issuer.phone ? <Text>Tel. {issuer.phone}</Text> : null}
            {issuer.email ? <Text>{issuer.email}</Text> : null}
            {issuer.iban ? <Text>IBAN {issuer.iban}</Text> : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
