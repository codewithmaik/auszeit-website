import type { Apartment } from "@/db/schema";

const inputClass =
  "w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";

export default function ApartmentFormFields({ apartment }: { apartment?: Apartment }) {
  return (
    <>
      <div className="mb-4">
        <label htmlFor="name" className={labelClass}>Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={apartment?.name}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-3.5 mb-4">
        <div>
          <label htmlFor="sizeSqm" className={labelClass}>Größe</label>
          <input
            type="text"
            id="sizeSqm"
            name="sizeSqm"
            placeholder="60 m²"
            required
            defaultValue={apartment?.sizeSqm}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="guests" className={labelClass}>Gäste</label>
          <input
            type="text"
            id="guests"
            name="guests"
            placeholder="4 Gäste"
            required
            defaultValue={apartment?.guests}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="bedrooms" className={labelClass}>Schlafzimmer</label>
          <input
            type="text"
            id="bedrooms"
            name="bedrooms"
            placeholder="2 Schlafzimmer"
            required
            defaultValue={apartment?.bedrooms}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="description" className={labelClass}>Beschreibung</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={apartment?.description}
          className={inputClass}
        />
      </div>
    </>
  );
}
