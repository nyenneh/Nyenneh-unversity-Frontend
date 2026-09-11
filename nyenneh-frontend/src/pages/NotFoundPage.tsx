import { Link } from "react-router-dom";

import { useCurrentUser } from "@/hooks/useAuth";
import { homePathForRole } from "@/lib/utils";

export default function NotFoundPage() {
  const user = useCurrentUser();
  const home = user ? homePathForRole(user.role) : "/login";

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-900">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          The page you are looking for has moved or never existed.
        </p>
        <Link
          to={home}
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-500 px-5 text-sm font-medium text-navy-950 transition hover:bg-brand-400"
        >
          Back to the portal
        </Link>
      </div>
    </div>
  );
}
