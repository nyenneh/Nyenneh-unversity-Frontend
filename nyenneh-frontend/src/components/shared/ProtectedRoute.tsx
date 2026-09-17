import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "@/components/ui/States";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types";

// Guards a branch of the route tree. Waits for the saved session to rehydrate
// first, otherwise refreshing on a deep link flashes a signed-in user over to
// /login for a frame.
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
    // `from` lets the login page send them back where they were going
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // the API refuses everything until the emailed password is replaced, so
  // there is nothing worth rendering behind here yet
  if (user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  if (user && !allow.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
