import { getSiteSettings, getInvoiceSettings } from "@/db/queries";
import { updateSiteSettings, updateInvoiceSettings } from "./actions";

export const metadata = { title: "Einstellungen" };
export const dynamic = "force-dynamic";

const inputClass =
  "w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";

export default async function AdminSettingsPage() {
  const [settings, invoice] = await Promise.all([getSiteSettings(), getInvoiceSettings()]);

  return (
    <div className="max-w-[720px]">
      <h1 className="text-[1.8rem] mb-2">Einstellungen</h1>
      <p className="text-ink-soft mb-8">
        Diese Angaben werden site-weit verwendet — u. a. im Footer, auf der Kontaktseite und in den
        Suchmaschinen-Metadaten.
      </p>

      <form action={updateSiteSettings} className="bg-white border border-line rounded-[2px] p-6 mb-8">
        <h2 className="text-[1.15rem] mb-4">Kontaktdaten</h2>

        <div className="mb-4">
          <label htmlFor="contactAddress" className={labelClass}>Adresse</label>
          <input
            type="text"
            id="contactAddress"
            name="contactAddress"
            required
            defaultValue={settings.contactAddress}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5 mb-6">
          <div>
            <label htmlFor="contactPhone" className={labelClass}>Telefon</label>
            <input
              type="text"
              id="contactPhone"
              name="contactPhone"
              required
              defaultValue={settings.contactPhone}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className={labelClass}>E-Mail</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              required
              defaultValue={settings.contactEmail}
              className={inputClass}
            />
          </div>
        </div>

        <h2 className="text-[1.15rem] mb-4">Impressum</h2>
        <div className="mb-6">
          <label htmlFor="impressumContent" className={labelClass}>Inhalt Deutsch (§ 5 TMG)</label>
          <textarea
            id="impressumContent"
            name="impressumContent"
            rows={12}
            defaultValue={settings.impressumContent}
            className={`${inputClass} font-mono text-[0.82rem] leading-relaxed`}
          />
          <p className="text-[0.78rem] text-ink-soft mt-1.5">
            Wird auf <code>/de/impressum</code> angezeigt. Zeilenumbrüche werden übernommen.
          </p>
        </div>
        <div className="mb-6">
          <label htmlFor="impressumContentEn" className={labelClass}>Inhalt Englisch</label>
          <textarea
            id="impressumContentEn"
            name="impressumContentEn"
            rows={12}
            defaultValue={settings.impressumContentEn}
            className={`${inputClass} font-mono text-[0.82rem] leading-relaxed`}
          />
          <p className="text-[0.78rem] text-ink-soft mt-1.5">
            Wird auf <code>/en/impressum</code> angezeigt. Leer lassen, um die deutsche Fassung anzuzeigen.
          </p>
        </div>

        <h2 className="text-[1.15rem] mb-4">Datenschutzerklärung</h2>
        <div className="mb-6">
          <label htmlFor="datenschutzContent" className={labelClass}>Inhalt Deutsch</label>
          <textarea
            id="datenschutzContent"
            name="datenschutzContent"
            rows={12}
            defaultValue={settings.datenschutzContent}
            className={`${inputClass} font-mono text-[0.82rem] leading-relaxed`}
          />
          <p className="text-[0.78rem] text-ink-soft mt-1.5">
            Wird auf <code>/de/datenschutz</code> angezeigt. Zeilenumbrüche werden übernommen.
          </p>
        </div>
        <div className="mb-6">
          <label htmlFor="datenschutzContentEn" className={labelClass}>Inhalt Englisch</label>
          <textarea
            id="datenschutzContentEn"
            name="datenschutzContentEn"
            rows={12}
            defaultValue={settings.datenschutzContentEn}
            className={`${inputClass} font-mono text-[0.82rem] leading-relaxed`}
          />
          <p className="text-[0.78rem] text-ink-soft mt-1.5">
            Wird auf <code>/en/datenschutz</code> angezeigt. Leer lassen, um die deutsche Fassung anzuzeigen.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
        >
          Änderungen speichern
        </button>
      </form>

      <form action={updateInvoiceSettings} className="bg-white border border-line rounded-[2px] p-6 mb-8">
        <h2 className="text-[1.15rem] mb-1">Rechnungsdaten</h2>
        <p className="text-[0.82rem] text-ink-soft mb-5">
          Grundlage für den Rechnungsgenerator im Posteingang (Aussteller, Steuer, Bank, Nummernkreis).
        </p>

        <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft mb-1">Aussteller</h3>
        <p className="text-[0.78rem] text-ink-soft mb-3 mt-0">
          Vorausgefüllt aus den Kontaktdaten oben (Impressum) — hier nur bei Bedarf abweichend anpassen.
        </p>
        <div className="grid grid-cols-2 gap-3.5 mb-4 max-[560px]:grid-cols-1">
          <div className="col-span-2 max-[560px]:col-span-1">
            <label htmlFor="issuerName" className={labelClass}>Name / Firma</label>
            <input id="issuerName" name="issuerName" defaultValue={invoice.issuerName} className={inputClass} />
          </div>
          <div className="col-span-2 max-[560px]:col-span-1">
            <label htmlFor="issuerAddressLine" className={labelClass}>Straße &amp; Hausnr.</label>
            <input id="issuerAddressLine" name="issuerAddressLine" defaultValue={invoice.issuerAddressLine} className={inputClass} />
          </div>
          <div>
            <label htmlFor="issuerZip" className={labelClass}>PLZ</label>
            <input id="issuerZip" name="issuerZip" defaultValue={invoice.issuerZip} className={inputClass} />
          </div>
          <div>
            <label htmlFor="issuerCity" className={labelClass}>Ort</label>
            <input id="issuerCity" name="issuerCity" defaultValue={invoice.issuerCity} className={inputClass} />
          </div>
          <div>
            <label htmlFor="issuerCountry" className={labelClass}>Land</label>
            <input id="issuerCountry" name="issuerCountry" defaultValue={invoice.issuerCountry} className={inputClass} />
          </div>
          <div>
            <label htmlFor="issuerPhone" className={labelClass}>Telefon</label>
            <input id="issuerPhone" name="issuerPhone" defaultValue={invoice.issuerPhone} className={inputClass} />
          </div>
          <div>
            <label htmlFor="issuerEmail" className={labelClass}>E-Mail</label>
            <input id="issuerEmail" name="issuerEmail" type="email" defaultValue={invoice.issuerEmail} className={inputClass} />
          </div>
          <div>
            <label htmlFor="issuerWebsite" className={labelClass}>Website</label>
            <input id="issuerWebsite" name="issuerWebsite" defaultValue={invoice.issuerWebsite} className={inputClass} />
          </div>
          <div className="col-span-2 max-[560px]:col-span-1">
            <label htmlFor="logoUrl" className={labelClass}>Logo-URL (optional)</label>
            <input id="logoUrl" name="logoUrl" defaultValue={invoice.logoUrl ?? ""} placeholder="https://…" className={inputClass} />
          </div>
        </div>

        <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft mb-3">Umsatzsteuer</h3>
        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2.5 text-[0.88rem] cursor-pointer">
            <input type="radio" name="taxMode" value="kleinunternehmer" defaultChecked={invoice.taxMode === "kleinunternehmer"} className="accent-forest" />
            Kleinunternehmer (§ 19 UStG) — keine USt. ausweisen
          </label>
          <label className="flex items-center gap-2.5 text-[0.88rem] cursor-pointer">
            <input type="radio" name="taxMode" value="regelbesteuerung" defaultChecked={invoice.taxMode === "regelbesteuerung"} className="accent-forest" />
            Regelbesteuerung — Netto/USt/Brutto ausweisen
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3.5 mb-4 max-[560px]:grid-cols-1">
          <div>
            <label htmlFor="taxNumber" className={labelClass}>Steuernummer</label>
            <input id="taxNumber" name="taxNumber" defaultValue={invoice.taxNumber} className={inputClass} />
          </div>
          <div>
            <label htmlFor="vatId" className={labelClass}>USt-IdNr.</label>
            <input id="vatId" name="vatId" defaultValue={invoice.vatId} className={inputClass} />
          </div>
          <div>
            <label htmlFor="vatRateAccommodation" className={labelClass}>USt-Satz Übernachtung (%)</label>
            <input id="vatRateAccommodation" name="vatRateAccommodation" type="number" step="0.1" defaultValue={invoice.vatRateAccommodation} className={inputClass} />
          </div>
          <div>
            <label htmlFor="vatRateExtras" className={labelClass}>USt-Satz Zusatzleistungen (%)</label>
            <input id="vatRateExtras" name="vatRateExtras" type="number" step="0.1" defaultValue={invoice.vatRateExtras} className={inputClass} />
          </div>
        </div>

        <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft mb-3">Bankverbindung</h3>
        <div className="grid grid-cols-2 gap-3.5 mb-4 max-[560px]:grid-cols-1">
          <div>
            <label htmlFor="accountHolder" className={labelClass}>Kontoinhaber</label>
            <input id="accountHolder" name="accountHolder" defaultValue={invoice.accountHolder} className={inputClass} />
          </div>
          <div>
            <label htmlFor="bankName" className={labelClass}>Bank</label>
            <input id="bankName" name="bankName" defaultValue={invoice.bankName} className={inputClass} />
          </div>
          <div>
            <label htmlFor="iban" className={labelClass}>IBAN</label>
            <input id="iban" name="iban" defaultValue={invoice.iban} className={inputClass} />
          </div>
          <div>
            <label htmlFor="bic" className={labelClass}>BIC</label>
            <input id="bic" name="bic" defaultValue={invoice.bic} className={inputClass} />
          </div>
        </div>

        <h3 className="text-[0.8rem] tracking-[0.08em] uppercase text-ink-soft mb-3">Nummernkreis &amp; Zahlung</h3>
        <div className="grid grid-cols-3 gap-3.5 mb-4 max-[560px]:grid-cols-1">
          <div>
            <label htmlFor="invoiceNumberPrefix" className={labelClass}>Präfix</label>
            <input id="invoiceNumberPrefix" name="invoiceNumberPrefix" defaultValue={invoice.invoiceNumberPrefix} className={inputClass} />
          </div>
          <div>
            <label htmlFor="invoiceNumberNextSeq" className={labelClass}>Nächste Nummer</label>
            <input id="invoiceNumberNextSeq" name="invoiceNumberNextSeq" type="number" min="1" defaultValue={invoice.invoiceNumberNextSeq} className={inputClass} />
          </div>
          <div>
            <label htmlFor="paymentTermDays" className={labelClass}>Zahlungsziel (Tage)</label>
            <input id="paymentTermDays" name="paymentTermDays" type="number" min="0" defaultValue={invoice.paymentTermDays} className={inputClass} />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="footerNote" className={labelClass}>Fußzeile (optional)</label>
          <input id="footerNote" name="footerNote" defaultValue={invoice.footerNote} className={inputClass} />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
        >
          Rechnungsdaten speichern
        </button>
      </form>
    </div>
  );
}
