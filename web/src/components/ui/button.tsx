import { cn } from "@/lib/cn";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-colors focus-visible:outline-offset-4 disabled:opacity-50 " +
  "disabled:pointer-events-none whitespace-nowrap";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-paper hover:bg-brand-dark",
  secondary: "bg-paper text-ink border border-paper-line hover:bg-paper-muted",
  ghost: "text-ink hover:bg-paper-muted",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    />
  );
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
}

/**
 * Variante "lien" du bouton — utilise Next/Link en interne pour les URLs locales,
 * et reste un <a> pour les liens externes / mailto / tel.
 */
export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  href,
  ...rest
}: LinkButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  if (isExternal) {
    return <a href={href} className={classes} {...rest} />;
  }
  return <Link href={href} className={classes} {...rest} />;
}
