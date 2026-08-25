import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
};

const base =
  "inline-flex items-center gap-2 px-[30px] py-[14px] font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] border transition-colors duration-200";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-forest text-white border-transparent hover:bg-forest-dark",
  outline: "bg-transparent text-forest border-forest hover:bg-forest hover:text-white",
  "outline-light":
    "bg-transparent text-white border-white/80 hover:bg-white hover:text-forest",
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
