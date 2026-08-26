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
    <section className="bg-forest pt-[60px] pb-[40px] text-center">
      <div className="max-w-[1180px] mx-auto px-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-white text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.1] mb-5">{title}</h1>
        {children && <p className="text-white/75 max-w-[560px] mx-auto">{children}</p>}
      </div>
    </section>
  );
}
