import { getSiteSettings } from "@/db/queries";
import { updateSiteSettings } from "./actions";

export const metadata = { title: "Einstellungen" };
export const dynamic = "force-dynamic";

const inputClass =
  "w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

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
          <label htmlFor="impressumContent" className={labelClass}>Inhalt (§ 5 TMG)</label>
          <textarea
            id="impressumContent"
            name="impressumContent"
            rows={12}
            defaultValue={settings.impressumContent}
            className={`${inputClass} font-mono text-[0.82rem] leading-relaxed`}
          />
          <p className="text-[0.78rem] text-ink-soft mt-1.5">
            Wird auf <code>/impressum</code> angezeigt. Zeilenumbrüche werden übernommen.
          </p>
        </div>

        <h2 className="text-[1.15rem] mb-4">Datenschutzerklärung</h2>
        <div className="mb-6">
          <label htmlFor="datenschutzContent" className={labelClass}>Inhalt</label>
          <textarea
            id="datenschutzContent"
            name="datenschutzContent"
            rows={12}
            defaultValue={settings.datenschutzContent}
            className={`${inputClass} font-mono text-[0.82rem] leading-relaxed`}
          />
          <p className="text-[0.78rem] text-ink-soft mt-1.5">
            Wird auf <code>/datenschutz</code> angezeigt. Zeilenumbrüche werden übernommen.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
        >
          Änderungen speichern
        </button>
      </form>
    </div>
  );
}
