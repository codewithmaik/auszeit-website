import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
};

// ".btn" ist die Marker-Klasse für die im Design-Editor wählbare, sitewide
// geltende Hover-Animation (siehe html[data-button-anim="..."] .btn-Regeln in
// globals.css) — dadurch braucht keine Verwendungsstelle dieses Buttons einen
// eigenen Animations-Prop.
export const BUTTON_BASE_CLASS =
  "btn inline-flex items-center gap-2 px-[30px] py-[14px] font-sans text-[0.78rem] tracking-[0.14em] uppercase border transition-colors duration-200";
const base = BUTTON_BASE_CLASS;

// Randdicke/-radius und (falls im Design-Editor gesetzt) Button-/Rahmenfarbe
// kommen aus CSS-Variablen auf <html> (src/app/layout.tsx) — ohne Override
// entsprechen die Fallbacks exakt dem bisherigen festen Look. Die
// Farb-Overrides gelten bewusst nur für "primary"/"outline" (beide ohnehin
// markenfarben-basiert); "outline-light" bleibt an sein festes Weiß auf
// dunklem Hero-/Fotohintergrund gebunden, damit Overrides dort nicht die
// Lesbarkeit über Fotos gefährden.
export const BUTTON_VARIANT_CLASS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--button-bg,var(--color-forest))] text-white border-[color:var(--button-border-color,transparent)] hover:brightness-90",
  outline:
    "bg-transparent text-[var(--button-bg,var(--color-forest))] border-[color:var(--button-border-color,var(--button-bg,var(--color-forest)))] hover:bg-[var(--button-bg,var(--color-forest))] hover:text-white",
  "outline-light": "bg-transparent text-white border-white/80 hover:bg-white hover:text-forest",
};
const variants = BUTTON_VARIANT_CLASS;

export const BUTTON_SHAPE_STYLE = {
  borderWidth: "var(--button-border-width)",
  borderRadius: "var(--button-radius)",
} as const;
const shapeStyle = BUTTON_SHAPE_STYLE;

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} style={shapeStyle}>
      {children}
    </Link>
  );
}
