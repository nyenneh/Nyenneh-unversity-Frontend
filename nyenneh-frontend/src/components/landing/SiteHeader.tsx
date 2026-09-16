import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Logo } from "@/components/shared/Logo";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cn, homePathForRole } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

/**
 * Two kinds of destination sit side by side here: sections of the landing page
 * and public pages of their own. Both are router links, so "/#academics" works
 * from the contact page as well as from the landing page — ScrollToHash does
 * the scrolling that a plain anchor would have done.
 */
const navLinks = [
  { label: "Academics", to: "/#academics" },
  { label: "Admissions", to: "/#admissions" },
  { label: "Questions", to: "/questions" },
  { label: "Leadership", to: "/leadership" },
  { label: "Contact", to: "/contact" },
];

/** Public site chrome. Sits on the navy hero, so it is navy all the way down. */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // A visitor already signed in gets sent to their own dashboard rather than
  // being asked to log in again.
  const signedIn = isAuthenticated() && user;
  const portalHref = signedIn ? homePathForRole(user.role) : "/login";
  const portalLabel = signedIn ? "Go to my portal" : "Student portal";

  // Only the standalone pages can be "current"; a section of the landing page
  // is wherever the visitor happens to have scrolled to.
  const isCurrent = (to: string) => !to.includes("#") && pathname === to;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-white">
          <Logo className="size-9" />
          <span className="text-base font-semibold tracking-tight">Nyenneh University</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isCurrent(link.to) ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition hover:text-white",
                isCurrent(link.to) ? "text-brand-300" : "text-navy-200",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to={portalHref} className={buttonClasses({ size: "sm" })}>
            {portalLabel}
          </Link>
        </div>

        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg text-white transition hover:bg-white/10 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="site-menu"
        hidden={!menuOpen}
        className={cn("border-t border-white/10 bg-navy-950 md:hidden")}
      >
        <nav aria-label="Primary" className="space-y-1 px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              aria-current={isCurrent(link.to) ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-white",
                isCurrent(link.to) ? "bg-white/10 text-brand-300" : "text-navy-100",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to={portalHref}
            onClick={() => setMenuOpen(false)}
            className={buttonClasses({ className: "mt-3 w-full" })}
          >
            {portalLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
