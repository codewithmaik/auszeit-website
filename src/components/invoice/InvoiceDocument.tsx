import {
  computeInvoiceTotals,
  formatEuro,
  formatInvoiceDate,
  addDaysIso,
  nightsBetween,
  KLEINUNTERNEHMER_NOTE,
  type InvoiceData,
} from "@/lib/invoice";

/**
 * DIN-A4-Rechnung als HTML — genutzt für die Live-Vorschau im Buchungs-Popup
 * und für die öffentliche Seite `/[lang]/rechnung/[token]`. Rein
 * präsentational (keine Hooks), damit sie server- wie clientseitig rendert.
 * Der visuell gematchte PDF-Zwilling liegt in InvoicePdf.tsx.
 *
 * Pflichtangaben nach § 14 UStG sind vollständig abgebildet: Name + Anschrift
 * beider Parteien, Steuernummer/USt-IdNr, Ausstellungsdatum, fortlaufende
 * Rechnungsnummer, Menge/Art der Leistung, Leistungszeitraum, Entgelt,
 * Steuersatz + -betrag bzw. § 19-Hinweis.
 */

const C = {
  ink: "#20241c",
  soft: "#6b7160",
  line: "#d9dcd0",
  accent: "#2c3226",
  gold: "#9a7b3f",
  bg: "#ffffff",
};

const money: React.CSSProperties = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

export default function InvoiceDocument({ data }: { data: InvoiceData }) {
  const totals = computeInvoiceTotals(data);
  const isDraft = !data.invoiceNumber;
  const issueDate = data.issueDate ?? new Date().toISOString().split("T")[0];
  const dueDate = addDaysIso(issueDate, data.paymentTermDays);
  const nights = nightsBetween(data.servicePeriod.from, data.servicePeriod.to);
  const { issuer, recipient } = data;

  const taxIdLine = [
    issuer.taxNumber ? `Steuernummer: ${issuer.taxNumber}` : null,
    issuer.vatId ? `USt-IdNr.: ${issuer.vatId}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div
      className="invoice-sheet"
      style={{
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        padding: "22mm 20mm 18mm",
        background: C.bg,
        color: C.ink,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: "10.5px",
        lineHeight: 1.5,
        position: "relative",
      }}
    >
      {isDraft && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              transform: "rotate(-24deg)",
              fontSize: "84px",
              letterSpacing: "0.15em",
              fontWeight: 700,
              color: "rgba(154,123,63,0.10)",
            }}
          >
            ENTWURF
          </span>
        </div>
      )}

      {/* Kopf */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {issuer.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={issuer.logoUrl} alt="" style={{ height: "44px", width: "auto", objectFit: "contain" }} />
          ) : null}
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.04em", color: C.accent }}>
              {issuer.name}
            </div>
            {issuer.website ? <div style={{ color: C.soft }}>{issuer.website}</div> : null}
          </div>
        </div>
        <div style={{ textAlign: "right", color: C.soft, fontSize: "9.5px", lineHeight: 1.6 }}>
          <div>{issuer.addressLine}</div>
          <div>
            {issuer.zip} {issuer.city}
          </div>
          {issuer.country ? <div>{issuer.country}</div> : null}
          {issuer.phone ? <div>Tel. {issuer.phone}</div> : null}
          {issuer.email ? <div>{issuer.email}</div> : null}
        </div>
      </div>

      <div style={{ borderBottom: `2px solid ${C.accent}`, margin: "10px 0 18px" }} />

      {/* Adressfeld + Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "24px" }}>
        <div style={{ maxWidth: "85mm" }}>
          <div style={{ fontSize: "8px", color: C.soft, borderBottom: `0.5px solid ${C.line}`, paddingBottom: "3px", marginBottom: "8px" }}>
            {issuer.name} · {issuer.addressLine} · {issuer.zip} {issuer.city}
          </div>
          <div style={{ fontWeight: 600 }}>{recipient.name}</div>
          <div>{recipient.addressLine}</div>
          <div>
            {recipient.zip} {recipient.city}
          </div>
          {recipient.country && recipient.country !== "Deutschland" ? <div>{recipient.country}</div> : null}
        </div>

        <table style={{ fontSize: "10px", borderCollapse: "collapse", alignSelf: "flex-start" }}>
          <tbody>
            {[
              ["Rechnungs-Nr.", data.invoiceNumber ?? "— (Entwurf)"],
              ["Rechnungsdatum", formatInvoiceDate(data.issueDate)],
              ["Leistungszeitraum", `${formatInvoiceDate(data.servicePeriod.from)} – ${formatInvoiceDate(data.servicePeriod.to)}`],
              ["Wohnung", data.apartmentName || "—"],
              ["Gäste", data.guests || "—"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: C.soft, padding: "2px 14px 2px 0", verticalAlign: "top" }}>{k}</td>
                <td style={{ fontWeight: 600, padding: "2px 0", textAlign: "right" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Titel + Einleitung */}
      <h1 style={{ fontSize: "17px", fontWeight: 700, color: C.accent, margin: "22px 0 6px" }}>
        {isDraft ? "Rechnungsentwurf" : `Rechnung ${data.invoiceNumber}`}
      </h1>
      <p style={{ margin: "0 0 14px", color: C.soft }}>
        Vielen Dank für Ihre Buchung. Für Ihren Aufenthalt
        {nights > 0 ? ` (${nights} ${nights === 1 ? "Nacht" : "Nächte"})` : ""} in{" "}
        {data.apartmentName || "unserer Ferienwohnung"} berechnen wir folgende Leistungen:
      </p>

      {/* Positionen */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${C.accent}`, textAlign: "left" }}>
            <th style={{ padding: "6px 4px", width: "6%" }}>Pos.</th>
            <th style={{ padding: "6px 4px" }}>Beschreibung</th>
            <th style={{ padding: "6px 4px", width: "10%", textAlign: "right" }}>Menge</th>
            <th style={{ padding: "6px 4px", width: "16%", textAlign: "right" }}>Einzelpreis</th>
            {!totals.isKleinunternehmer && (
              <th style={{ padding: "6px 4px", width: "8%", textAlign: "right" }}>USt.</th>
            )}
            <th style={{ padding: "6px 4px", width: "16%", textAlign: "right" }}>Betrag</th>
          </tr>
        </thead>
        <tbody>
          {totals.lines.map((l, i) => (
            <tr key={i} style={{ borderBottom: `0.5px solid ${C.line}` }}>
              <td style={{ padding: "6px 4px", color: C.soft }}>{i + 1}</td>
              <td style={{ padding: "6px 4px" }}>{l.description}</td>
              <td style={{ padding: "6px 4px", textAlign: "right", ...money }}>{l.qty}</td>
              <td style={{ padding: "6px 4px", textAlign: "right", ...money }}>{formatEuro(l.unitPrice)}</td>
              {!totals.isKleinunternehmer && (
                <td style={{ padding: "6px 4px", textAlign: "right", ...money }}>{l.vatRate} %</td>
              )}
              <td style={{ padding: "6px 4px", textAlign: "right", ...money }}>{formatEuro(l.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summen */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
        <table style={{ fontSize: "10px", borderCollapse: "collapse", minWidth: "70mm" }}>
          <tbody>
            {totals.isKleinunternehmer ? (
              <tr>
                <td style={{ padding: "5px 14px 5px 0", fontWeight: 700 }}>Gesamtbetrag</td>
                <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 700, ...money }}>
                  {formatEuro(totals.grossTotal)}
                </td>
              </tr>
            ) : (
              <>
                <tr>
                  <td style={{ padding: "4px 14px 4px 0", color: C.soft }}>Nettobetrag</td>
                  <td style={{ padding: "4px 0", textAlign: "right", ...money }}>{formatEuro(totals.netTotal)}</td>
                </tr>
                {totals.vatGroups.map((g) => (
                  <tr key={g.rate}>
                    <td style={{ padding: "4px 14px 4px 0", color: C.soft }}>zzgl. {g.rate} % USt.</td>
                    <td style={{ padding: "4px 0", textAlign: "right", ...money }}>{formatEuro(g.vat)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `1px solid ${C.accent}` }}>
                  <td style={{ padding: "6px 14px 6px 0", fontWeight: 700 }}>Gesamtbetrag</td>
                  <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 700, ...money }}>
                    {formatEuro(totals.grossTotal)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {totals.isKleinunternehmer && (
        <p style={{ margin: "10px 0 0", color: C.soft, fontStyle: "italic" }}>{KLEINUNTERNEHMER_NOTE}</p>
      )}

      {/* Zahlungshinweis */}
      <div style={{ marginTop: "22px", padding: "12px 14px", background: "#f6f6f0", borderRadius: "2px" }}>
        <div style={{ fontWeight: 600, marginBottom: "4px" }}>Zahlungshinweis</div>
        <p style={{ margin: "0 0 6px" }}>
          Bitte überweisen Sie den Gesamtbetrag von <strong>{formatEuro(totals.grossTotal)}</strong> ohne Abzug bis
          zum <strong>{formatInvoiceDate(dueDate)}</strong>
          {data.invoiceNumber ? (
            <>
              {" "}
              unter Angabe der Rechnungsnummer <strong>{data.invoiceNumber}</strong>
            </>
          ) : null}{" "}
          auf folgendes Konto:
        </p>
        <table style={{ fontSize: "9.5px", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Kontoinhaber", issuer.accountHolder || issuer.name],
              ["IBAN", issuer.iban || "—"],
              ["BIC", issuer.bic || "—"],
              ["Bank", issuer.bankName || "—"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: C.soft, padding: "1.5px 12px 1.5px 0" }}>{k}</td>
                <td style={{ fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.note ? (
        <p style={{ marginTop: "16px", whiteSpace: "pre-wrap" }}>{data.note}</p>
      ) : null}

      {/* Fuß */}
      <div
        style={{
          position: "absolute",
          left: "20mm",
          right: "20mm",
          bottom: "12mm",
          borderTop: `0.5px solid ${C.line}`,
          paddingTop: "8px",
          fontSize: "8px",
          color: C.soft,
          lineHeight: 1.6,
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>{issuer.name}</div>
          <div>
            {issuer.addressLine}, {issuer.zip} {issuer.city}
          </div>
          {taxIdLine ? <div>{taxIdLine}</div> : null}
        </div>
        <div style={{ textAlign: "right" }}>
          {issuer.phone ? <div>Tel. {issuer.phone}</div> : null}
          {issuer.email ? <div>{issuer.email}</div> : null}
          {issuer.iban ? <div>IBAN {issuer.iban}</div> : null}
        </div>
      </div>

      {issuer.footerNote ? (
        <p style={{ position: "absolute", left: "20mm", right: "20mm", bottom: "6mm", fontSize: "8px", color: C.soft, textAlign: "center", margin: 0 }}>
          {issuer.footerNote}
        </p>
      ) : null}
    </div>
  );
}
