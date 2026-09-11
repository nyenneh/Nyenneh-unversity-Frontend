import { useEffect } from "react";

import { Academics } from "@/components/landing/Academics";
import { Admissions } from "@/components/landing/Admissions";
import { CampusLife } from "@/components/landing/CampusLife";
import { Hero } from "@/components/landing/Hero";
import { PortalPreview } from "@/components/landing/PortalPreview";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

/**
 * Public front door. Unlike the portal pages this is reachable signed out —
 * the header swaps its call to action when there is a session.
 */
export default function LandingPage() {
  // Every call to action here leads to the sign-in screen, which is its own
  // chunk. Fetch it once the browser is idle so the click is instant without
  // the download competing with first paint.
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

      {/* The sticky header would cover an anchor target, so offset the scroll. */}
      <main id="main" className="scroll-mt-16 [&_section]:scroll-mt-16">
        <Hero />
        <Academics />
        <PortalPreview />
        <Admissions />
        <CampusLife />
      </main>

      <SiteFooter />
    </div>
  );
}
