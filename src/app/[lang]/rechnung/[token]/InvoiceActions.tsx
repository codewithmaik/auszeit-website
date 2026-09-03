"use client";

import { Printer, Download } from "lucide-react";

export default function InvoiceActions({ pdfUrl }: { pdfUrl: string | null }) {
  return (
    <div className="no-print flex items-center gap-3 justify-center py-5 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest text-white font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors cursor-pointer"
      >
        <Printer className="w-4 h-4" strokeWidth={1.75} />
        Als PDF speichern / drucken
      </button>
      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors"
        >
          <Download className="w-4 h-4" strokeWidth={1.75} />
          PDF herunterladen
        </a>
      )}
    </div>
  );
}
