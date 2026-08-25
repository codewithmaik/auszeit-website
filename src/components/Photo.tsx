import Image, { type ImageProps } from "next/image";
import { getBlurDataURL } from "@/lib/blur";

type PhotoProps = Omit<ImageProps, "placeholder" | "blurDataURL" | "src" | "alt"> & {
  src: string;
  alt: string;
};

export default function Photo({ src, alt, ...props }: PhotoProps) {
  return <Image src={src} alt={alt} placeholder="blur" blurDataURL={getBlurDataURL(src)} {...props} />;
}
