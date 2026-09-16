import { Academics } from "@/components/landing/Academics";
import { Admissions } from "@/components/landing/Admissions";
import { CampusLife } from "@/components/landing/CampusLife";
import { Contact } from "@/components/landing/Contact";
import { Hero } from "@/components/landing/Hero";
import { Leadership } from "@/components/landing/Leadership";
import { PortalPreview } from "@/components/landing/PortalPreview";
import { Questions } from "@/components/landing/Questions";

/**
 * Public front door. Unlike the portal pages this is reachable signed out —
 * the header swaps its call to action when there is a session.
 *
 * The chrome (header, footer, skip link) belongs to PublicLayout, which this
 * page shares with leadership, questions and contact. Questions, leadership
 * and contact each show a summary here and continue on their own page.
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Academics />
      <PortalPreview />
      <Admissions />
      <Questions />
      <Leadership />
      <CampusLife />
      <Contact />
    </>
  );
}
