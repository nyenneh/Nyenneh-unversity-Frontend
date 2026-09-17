import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Puts back the scrolling a browser does for free on a normal page load.
// The public site is several routes now instead of one long page, so the
// header's "/#academics" links are cross-route navigations - React Router
// changes the URL without touching the viewport, and you land on the new page
// still scrolled to wherever you were on the old one.
// Mounted inside the router, renders nothing.
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

      // the questions page puts answers in collapsed <details>, so open it -
      // scrolling someone to a closed answer is no use
      if (target instanceof HTMLDetailsElement) target.open = true;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scrollToTarget()) return;

    // probably a lazy page that hasn't painted yet, so try again next frame
    // instead of giving up on the first miss
    const frame = requestAnimationFrame(() => void scrollToTarget());
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
