import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setSessionExpiredHandler } from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";
import type { AuthTokens, Role, User } from "@/types";

interface AuthState {
  user: User | null;
  /** False until the persisted session has been read back from storage. */
  hydrated: boolean;
  setHydrated: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: Role[]) => boolean;
  signIn: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      isAuthenticated: () => Boolean(get().user && tokenStorage.getAccess()),

      hasRole: (...roles) => {
        const role = get().user?.role;
        return role ? roles.includes(role) : false;
      },

      signIn: (user, tokens) => {
        tokenStorage.set(tokens);
        set({ user });
      },

      setUser: (user) => set({ user }),

      signOut: () => {
        tokenStorage.clear();
        set({ user: null });
      },
    }),
    {
      name: "nyenneh.auth",
      // Tokens live in tokenStorage; only the profile is mirrored here so the
      // shell can render immediately on reload without waiting for /auth/me/.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

// A refresh failure anywhere in the app drops the session immediately.
setSessionExpiredHandler(() => useAuthStore.getState().signOut());
