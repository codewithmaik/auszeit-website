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
    <Reveal delay={delay} className="relative rounded-[2px] overflow-hidden min-h-[300px] flex flex-col justify-end">
      <Photo
        src={image}
        alt={imageAlt}
        fill
        sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 380px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/5" />
      <div className="relative z-10 p-6">
        {brandIcon ? (
          <BrandIcon name={brandIcon} alt="" size={40} className="mb-3" />
        ) : Icon ? (
          <Icon className="w-6 h-6 text-gold mb-3" strokeWidth={1.5} />
        ) : null}
        <h3 className="text-white text-[1rem] mb-1">{title}</h3>
        {meta && (
          <span className="block text-[0.68rem] tracking-[0.08em] uppercase text-white/70 mb-2">{meta}</span>
        )}
        <p className="text-white/85 text-[0.88rem] m-0">{text}</p>
      </div>
    </Reveal>
  );
}
