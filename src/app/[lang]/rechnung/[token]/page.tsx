import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvoiceByToken } from "@/db/queries";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";
import InvoiceActions from "./InvoiceActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Rechnung", robots: { index: false, follow: false } };

export default async function RechnungPage({
  params,
}: {
  params: Promise<{ lang: string; token: string }>;
}) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);
  if (!invoice) notFound();

  return (
    <div className="rechnung-viewport min-h-screen bg-[#e9e9e1] print:bg-white">
      <InvoiceActions pdfUrl={invoice.pdfUrl} />
      <div className="invoice-frame mx-auto mb-10 w-[210mm] max-w-full overflow-x-auto bg-white shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)] print:m-0 print:shadow-none print:w-auto">
        <InvoiceDocument data={invoice.data} />
      </div>
    </div>
  );
}
