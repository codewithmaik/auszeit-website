import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { ButtonStyleOverride } from "@/db/home-content";
import { fontFamilyFor } from "@/lib/fonts";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
  /** Individueller Design-Editor-Override für genau diese eine Button-Instanz
   *  (Hero-CTAs, Navbar-CTA) — überschreibt die sitewide Default-CSS-Vars nur
   *  für dieses Element. Ohne Override (Standard) unverändertes Verhalten. */
  styleOverride?: ButtonStyleOverride | null;
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
// entsprechen die Fallbacks exakt dem bisherigen festen Look. "outline-light"
// (heller Button auf dunklem Hero-/Fotohintergrund) liest Hintergrund/Rahmen
// jetzt ebenfalls aus --button-bg/--button-border-color, mit dem bisherigen
// Weiß/Transparent als Fallback — ohne aktiven Override also exakt der
// bisherige Look. Der Hover-Zustand bleibt bewusst fest (weißer Hintergrund,
// Waldgrün-Text), damit der Button über Fotos immer einen klaren,
// kontrastreichen Hover-Zustand behält, unabhängig vom gewählten Ruhe-Stil.
export const BUTTON_VARIANT_CLASS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--button-bg,var(--color-forest))] text-white border-[color:var(--button-border-color,transparent)] hover:brightness-90",
  outline:
    "bg-transparent text-[var(--button-bg,var(--color-forest))] border-[color:var(--button-border-color,var(--button-bg,var(--color-forest)))] hover:bg-[var(--button-bg,var(--color-forest))] hover:text-white",
  "outline-light":
    "bg-[var(--button-bg,transparent)] text-white border-[color:var(--button-border-color,rgba(255,255,255,0.8))] hover:bg-white hover:text-forest",
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
  styleOverride,
}: ButtonProps) {
  const overrideStyle: CSSProperties = styleOverride
    ? ({
        ...(styleOverride.borderWidth && { "--button-border-width": styleOverride.borderWidth }),
        ...(styleOverride.color && { "--button-bg": styleOverride.color }),
        ...(styleOverride.borderColor && { "--button-border-color": styleOverride.borderColor }),
        ...(styleOverride.borderRadius && { "--button-radius": styleOverride.borderRadius }),
        ...(styleOverride.bold && { fontWeight: 700 }),
        ...(styleOverride.italic && { fontStyle: "italic" }),
        ...(styleOverride.underline && { textDecoration: "underline" }),
        ...(fontFamilyFor(styleOverride.fontFamily) && { fontFamily: fontFamilyFor(styleOverride.fontFamily) }),
        ...(styleOverride.lineHeight && { lineHeight: styleOverride.lineHeight }),
        ...(styleOverride.letterSpacing && { letterSpacing: styleOverride.letterSpacing }),
      } as CSSProperties)
    : {};
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...shapeStyle, ...overrideStyle }}
      data-button-anim={styleOverride?.animation ?? undefined}
    >
      {children}
    </Link>
  );
}
