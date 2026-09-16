import { useCallback, useState } from "react";

/**
 * Fires a little before the element reaches the fold, so it is already easing
 * in by the time it is properly on screen. A threshold is deliberately not
 * used: a section taller than the viewport can never reach one.
 */
const ROOT_MARGIN = "0px 0px -80px 0px";

interface RevealOptions {
  /** Milliseconds to hold back, for staggering a row of cards. */
  delay?: number;
}

/**
 * Reveals an element the first time it is scrolled into view.
 *
 * Spread onto any element — a div, an li, an article — so a grid keeps its own
 * markup rather than gaining a wrapper that would break the layout:
 *
 *     const {
 *       ref: revealRef,
 *       className: revealClass,
 *       style: revealStyle,
 *     } = useReveal({ delay: index * 80 });
 *
 *     <li ref={revealRef} style={revealStyle} className={cn("…", revealClass)}>
 *
 * Destructure it rather than keeping the object: react-hooks/refs treats any
 * object that feeds a `ref` prop as a ref, and rejects reading its other
 * properties during render.
 *
 * The reveal is a keyframe animation rather than a transition, so it never
 * competes with the `transition hover:…` a card already carries.
 *
 * It reveals once and then stops observing: content that has been read does not
 * fade out again on the way back up. Anyone who has asked their system not to
 * animate gets the content immediately, with no animation at all.
 */
export function useReveal<T extends HTMLElement = HTMLElement>({
  delay = 0,
}: RevealOptions = {}) {
  const [shown, setShown] = useState(false);

  // A callback ref rather than a ref object: observation starts the moment the
  // element mounts, and React tears the observer down through the cleanup it
  // returns — there is no ref value to read during render.
  const ref = useCallback(
    (node: T | null) => {
      if (!node || shown) return;

      // No observer, or the visitor asked for no motion: show it and stop.
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced || typeof IntersectionObserver === "undefined") {
        setShown(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setShown(true);
          // One-shot: nothing needs watching once it has been revealed.
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
    // `animate-reveal` fills backwards, so a delayed card stays invisible until
    // its turn rather than flashing in and then animating.
    className: shown ? "animate-reveal motion-reduce:animate-none" : "opacity-0",
    style: delay && shown ? { animationDelay: `${delay}ms` } : undefined,
  };
}
