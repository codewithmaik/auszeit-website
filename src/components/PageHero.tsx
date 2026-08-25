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
        <h1 className="text-white text-[clamp(2.6rem,5.5vw,4.2rem)] leading-[1.05] mb-6">{title}</h1>
        {children && <p className="text-white/75 max-w-[560px] mx-auto">{children}</p>}
      </div>
    </section>
  );
}
