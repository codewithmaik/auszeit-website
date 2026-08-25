import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

export default function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-forest pt-[90px] pb-[60px] text-center">
      <div className="max-w-[1180px] mx-auto px-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-white">{title}</h1>
        {children && <p className="text-white/75 max-w-[560px] mx-auto">{children}</p>}
      </div>
    </section>
  );
}
