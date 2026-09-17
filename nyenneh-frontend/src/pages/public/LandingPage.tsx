import { About } from "@/components/landing/About";
import { Academics } from "@/components/landing/Academics";
import { Admissions } from "@/components/landing/Admissions";
import { CampusLife } from "@/components/landing/CampusLife";
import { Contact } from "@/components/landing/Contact";
import { Hero } from "@/components/landing/Hero";
import { Leadership } from "@/components/landing/Leadership";
import { PortalPreview } from "@/components/landing/PortalPreview";
import { Questions } from "@/components/landing/Questions";

// The front door. Reachable signed out, unlike the portal pages - the header
// just swaps its call to action when there is a session.
//
// Header, footer and skip link all live in PublicLayout, shared with
// leadership, questions and contact. Each of those shows a summary here and
// then carries on on its own page.
export default function LandingPage() {
  return (
    <>
      <Hero />
      <About />
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
