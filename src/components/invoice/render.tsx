import { renderToBuffer } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/invoice";
import { InvoicePdf } from "./InvoicePdf";

/** Rendert die Rechnung als PDF-Buffer (Server, kein Chromium). */
export function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoicePdf data={data} />);
}
