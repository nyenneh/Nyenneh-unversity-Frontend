import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

// Wraps every page you can reach signed out: landing, leadership, questions,
// contact. Header and footer sit outside the <Outlet> so moving between them
// only swaps the content and leaves the nav alone.
export default function PublicLayout() {
  // every CTA out here ends up at the login screen, which is its own chunk.
  // grab it once the browser is idle so the click feels instant without the
  // download getting in the way of first paint.
  useEffect(() => {
    const prefetch = () => void import("@/pages/auth/LoginPage");

    if (typeof requestIdleCallback === "function") {
      const handle = requestIdleCallback(prefetch);
      return () => cancelIdleCallback(handle);
    }

    const timer = setTimeout(prefetch, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-900"
      >
        Skip to content
      </a>

      <SiteHeader />

      {/* offset the scroll or the sticky header sits on top of the anchor */}
      <main id="main" className="scroll-mt-16 [&_section]:scroll-mt-16">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
