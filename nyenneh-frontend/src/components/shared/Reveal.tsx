import type { ReactNode } from "react";

import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number; // ms, for staggering siblings
  className?: string;
}

// Wrapper round useReveal for the usual case of fading in a block of content.
// If the element already exists (a card in a grid, an item in a list) use the
// hook directly instead - wrapping a grid item in a div makes the div the grid
// item and the row breaks.
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
