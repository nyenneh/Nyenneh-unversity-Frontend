import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { useCurrentUser } from "@/hooks/useAuth";
import { homePathForRole } from "@/lib/utils";

export default function ForbiddenPage() {
  const user = useCurrentUser();
  const home = user ? homePathForRole(user.role) : "/login";

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="max-w-sm text-center">
        <span className="inline-flex rounded-full bg-red-50 p-3 text-red-600">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-ink-900">Not your area</h1>
        <p className="mt-2 text-sm text-ink-500">
          Your account does not have access to that part of the portal.
        </p>
        <Link
          to={home}
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-500 px-5 text-sm font-medium text-navy-950 transition hover:bg-brand-400"
        >
          Back to my dashboard
        </Link>
      </div>
    </div>
  );
}
