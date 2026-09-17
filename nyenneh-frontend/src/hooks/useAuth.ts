import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/services/api";
import { authService, type LoginPayload } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { homePathForRole } from "@/lib/utils";

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

export function useLogin(redirectTo?: string) {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ user, access, refresh }) => {
      signIn(user, { access, refresh });

      // nothing else is reachable until they have changed it
      if (user.must_change_password) {
        navigate("/change-password", { replace: true });
        return;
      }

      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}.`);
      navigate(redirectTo ?? homePathForRole(user.role), { replace: true });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not sign you in.")),
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = useAuthStore((state) => state.signOut);

  return () => {
    signOut();
    // wipe the cache so the next login never sees the last person's data
    queryClient.clear();
    navigate("/login", { replace: true });
  };
}
