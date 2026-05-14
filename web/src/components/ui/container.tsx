import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type Width = "default" | "narrow" | "wide";

const WIDTHS: Record<Width, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

interface Props extends HTMLAttributes<HTMLDivElement> {
  width?: Width;
}

/**
 * Wrapper d'alignement standard — gère le padding latéral mobile-first
 * et la largeur max selon le contexte.
 */
export function Container({
  className,
  width = "default",
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        WIDTHS[width],
        className
      )}
      {...rest}
    />
  );
}
