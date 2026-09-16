import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Restores the scrolling a browser does for free on a normal page load.
 *
 * The public site is now several routes rather than one long page, so the
 * header's "/#academics" links are cross-route navigations: React Router
 * changes the URL without moving the viewport, and arriving on a new page
 * leaves you wherever you were scrolled to on the last one.
 *
 * Mounted inside the router; renders nothing.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));

    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return false;

      // A deep link to one answer should open it — the questions page renders
      // answers in collapsed <details>, and scrolling to a closed one is no help.
      if (target instanceof HTMLDetailsElement) target.open = true;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scrollToTarget()) return;

    // The target is on a lazily loaded page that has not painted yet; try once
    // more on the next frame rather than giving up on the first miss.
    const frame = requestAnimationFrame(() => void scrollToTarget());
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
