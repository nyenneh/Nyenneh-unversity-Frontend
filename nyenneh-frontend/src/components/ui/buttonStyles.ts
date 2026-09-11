import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-navy-950 hover:bg-brand-400 shadow-sm",
  secondary: "bg-ink-100 text-ink-800 hover:bg-ink-200",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  outline: "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-sm gap-2",
  icon: "h-9 w-9",
};

/**
 * The button recipe on its own, so an anchor or router <Link> can look exactly
 * like a <Button> without nesting a button inside a link. It lives outside
 * Button.tsx so that file keeps exporting only components (fast refresh).
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}
