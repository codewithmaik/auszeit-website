"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

const SIZE_CLASS = {
  md: "max-w-[480px]",
  lg: "max-w-[680px]",
  xl: "max-w-[960px]",
  // 25 % breiter als `md` — für die Kalender-Pop-ups (siehe `align="left"`).
  cal: "max-w-[600px]",
} as const;

export default function Modal({
  onClose,
  title,
  children,
  size = "md",
  align = "center",
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: keyof typeof SIZE_CLASS;
  /** "left" rückt das Pop-up mit etwas Abstand an den linken Bildschirmrand statt es zu zentrieren. */
  align?: "center" | "left";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center p-4 bg-black/50 ${
        align === "left" ? "justify-start pl-6 max-[640px]:pl-4" : "justify-center"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[3px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)] w-full ${SIZE_CLASS[size]} max-h-[88vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-[1rem] m-0">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-soft hover:text-forest transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
