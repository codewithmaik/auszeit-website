import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-t border-b border-line">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="font-serif text-forest text-[1.05rem]">{item.question}</span>
            <ChevronDown
              className="w-5 h-5 text-gold flex-none transition-transform duration-300 group-open:rotate-180"
              strokeWidth={1.5}
            />
          </summary>
          <p className="mt-3 text-ink-soft text-[0.92rem] max-w-[720px]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
