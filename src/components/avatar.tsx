import { cn } from "@/lib/utils";
import { isRemoteImage } from "@/lib/image-url";
import Image from "next/image";

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-9 w-9 text-xs ring-2",
    md: "h-11 w-11 text-sm ring-2",
    lg: "h-20 w-20 text-2xl ring-[3px]",
  };
  const initial = name.charAt(0).toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size === "lg" ? 80 : size === "md" ? 44 : 36}
        height={size === "lg" ? 80 : size === "md" ? 44 : 36}
        unoptimized={isRemoteImage(src)}
        className={cn(
          "rounded-full object-cover ring-violet-500/20 shadow-md",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-violet-600",
        "flex items-center justify-center font-bold text-white shadow-md shadow-violet-500/25 ring-violet-500/20",
        sizes[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
