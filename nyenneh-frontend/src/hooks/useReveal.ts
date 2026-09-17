import { useCallback, useState } from "react";

// fire a bit before the element reaches the fold so it is already easing in by
// the time you see it. No threshold on purpose - a section taller than the
// viewport would never reach one.
const ROOT_MARGIN = "0px 0px -80px 0px";

interface RevealOptions {
  delay?: number; // ms, for staggering a row of cards
}

// Fades an element in the first time you scroll to it. Spread the result onto
// whatever element you like, so grids keep their own markup:
//
//   const { ref, className, style } = useReveal({ delay: index * 80 });
//   <li ref={ref} style={style} className={cn("...", className)}>
//
// Destructure it, don't hold onto the object - the react-hooks lint rule treats
// anything you pass to a ref prop as a ref and won't let you read the rest
// during render. Fires once and then stops watching.
export function useReveal<T extends HTMLElement = HTMLElement>({
  delay = 0,
}: RevealOptions = {}) {
  const [shown, setShown] = useState(false);

  // callback ref so we start observing the moment it mounts
  const ref = useCallback(
    (node: T | null) => {
      if (!node || shown) return;

      // no observer or reduced motion, just show it
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced || typeof IntersectionObserver === "undefined") {
        setShown(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setShown(true);
          observer.disconnect();
        },
        { rootMargin: ROOT_MARGIN },
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [shown],
  );

  return {
    ref,
    // animate-reveal fills backwards so a delayed card stays hidden until its turn
    className: shown ? "animate-reveal motion-reduce:animate-none" : "opacity-0",
    style: delay && shown ? { animationDelay: `${delay}ms` } : undefined,
  };
}
