import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25",
  secondary:
    "bg-white/80 text-zinc-900 hover:bg-white border border-zinc-200/80 dark:bg-zinc-800/80 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
  outline:
    "border-2 border-violet-500/30 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/50",
  ghost:
    "bg-transparent hover:bg-violet-500/10 text-zinc-700 dark:text-zinc-300",
  danger:
    "bg-gradient-to-l from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
      md: "px-4 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-6 py-3 text-base rounded-2xl gap-2",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200",
          "disabled:opacity-50 disabled:pointer-events-none interactive-scale",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
