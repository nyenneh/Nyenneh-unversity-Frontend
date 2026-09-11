import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "@/components/ui/States";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types";

/**
 * Gate for a branch of the route tree.
 *
 * Rendering waits for the persisted session to rehydrate, otherwise a refresh on
 * a deep link would bounce a signed-in user to /login for a frame.
 */
export function ProtectedRoute({ allow }: { allow: Role[] }) {
  const location = useLocation();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState label="Restoring your session…" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    // `from` lets the login page send the user back where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // The API refuses every endpoint until an emailed password is replaced, so
  // there is nothing to render behind this until that is done.
  if (user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  if (user && !allow.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
