import type { LucideIcon } from "lucide-react";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { Avatar } from "@/components/shared/Avatar";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { cn, titleCase } from "@/lib/utils";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface PortalLayoutProps {
  subtitle: string;
  navItems: NavItem[];
}

/**
 * The shell both roles share: fixed sidebar from `lg` up, slide-over drawer
 * below it. Admin and student differ only in the nav list, so they configure
 * this rather than each maintaining a copy.
 */
export function PortalLayout({ subtitle, navItems }: PortalLayoutProps) {
  const user = useCurrentUser();
  const logout = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-950 text-navy-100">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Logo className="size-9 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Nyenneh University</p>
          <p className="truncate text-xs text-navy-300">{subtitle}</p>
        </div>
      </div>

      <nav className="scrollbar-slim flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            // Navigating on mobile should close the drawer behind you.
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-brand-500 text-navy-950 shadow-sm"
                  : "text-navy-200 hover:bg-white/10 hover:text-white",
              )
            }
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar name={user?.full_name ?? "?"} src={user?.avatar_url} className="size-8" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.full_name}</p>
            <p className="truncate text-xs text-navy-300">
              {user?.roll_number ?? titleCase(user?.role ?? "")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-200 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            {drawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>

          <p className="truncate text-sm font-medium text-ink-600">{subtitle}</p>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-ink-500 sm:block">{user?.email}</span>
            <Avatar name={user?.full_name ?? "?"} src={user?.avatar_url} className="size-8" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
