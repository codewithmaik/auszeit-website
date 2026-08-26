import Image from "next/image";

export const ICONS = {
  trauben: "/images/icons/trauben.png",
  moselschleife: "/images/icons/moselschleife.png",
  fachwerkhaus: "/images/icons/fachwerkhaus.png",
  sonnenuntergang: "/images/icons/sonnenuntergang.png",
  herzen: "/images/icons/herzen.png",
  dorfplatz: "/images/icons/dorfplatz.png",
} as const;

export type BrandIconName = keyof typeof ICONS;

export default function BrandIcon({
  name,
  alt,
  size = 56,
  className = "",
}: {
  name: BrandIconName;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={ICONS[name]}
      alt={alt}
      width={size}
      height={size}
      className={`flex-none ${className}`}
    />
  );
}
