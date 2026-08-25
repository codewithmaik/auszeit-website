import type { LucideIcon } from "lucide-react";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import BrandIcon, { type BrandIconName } from "@/components/BrandIcon";

type PhotoCardProps = {
  image: string;
  imageAlt: string;
  title: string;
  text: string;
  meta?: string;
  icon?: LucideIcon;
  brandIcon?: BrandIconName;
  delay?: number;
};

export default function PhotoCard({
  image,
  imageAlt,
  title,
  text,
  meta,
  icon: Icon,
  brandIcon,
  delay = 0,
}: PhotoCardProps) {
  return (
    <Reveal delay={delay} className="rounded-[2px] overflow-hidden border border-line bg-white flex flex-col">
      <div className="p-6 pb-4">
        {(brandIcon || Icon) && (
          <div className="h-10 flex items-center mb-3">
            {brandIcon ? (
              <BrandIcon name={brandIcon} alt="" size={40} />
            ) : Icon ? (
              <Icon className="w-6 h-6 text-gold" strokeWidth={1.5} />
            ) : null}
          </div>
        )}
        <h3 className="text-[1rem] mb-1">{title}</h3>
        {meta && <span className="block text-[0.68rem] tracking-[0.08em] uppercase text-ink-soft/70">{meta}</span>}
      </div>
      <div className="relative min-h-[220px] flex-1 flex items-center justify-center p-6">
        <Photo
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 380px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <p className="relative z-10 text-white text-center text-[0.88rem] leading-relaxed max-w-[92%] m-0">
          {text}
        </p>
      </div>
    </Reveal>
  );
}
