import Image, { type StaticImageData } from "next/image";

type FramePhotoProps = {
  src: StaticImageData;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  ratio?: string;
};

export function FramePhoto({
  src,
  alt,
  className = "",
  sizes = "(max-width: 1024px) 100vw, 40vw",
  priority,
  ratio = "4/3",
}: FramePhotoProps) {
  return (
    <div style={{ aspectRatio: ratio }} className={`relative w-full overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
