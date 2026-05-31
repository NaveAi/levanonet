import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-zinc-200/80 bg-white/90 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 resize-none",
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400",
        "dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-100",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
