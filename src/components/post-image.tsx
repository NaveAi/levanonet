import Image from "next/image";
import { isRemoteImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";

export function PostImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const remote = isRemoteImage(src);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      unoptimized={remote}
      className={cn("object-cover", className)}
      sizes="(max-width: 672px) 100vw"
    />
  );
}
