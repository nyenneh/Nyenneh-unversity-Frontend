import type { ReactNode } from "react";

import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /** Milliseconds to hold back, for staggering siblings. */
  delay?: number;
  className?: string;
}

/**
 * A plain wrapper around `useReveal`, for the common case of easing a block of
 * content in as it is scrolled to.
 *
 * Where the element already exists — a card in a grid, an item in a list —
 * reach for the hook instead and spread it onto that element. Wrapping a grid
 * item in a div makes the wrapper the grid item, which breaks the row.
 */
export function Reveal({ children, delay, className }: RevealProps) {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLDivElement>({ delay });

  return (
    <div ref={revealRef} style={revealStyle} className={cn(className, revealClass)}>
      {children}
    </div>
  );
}
