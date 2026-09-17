import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setSessionExpiredHandler } from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";
import type { AuthTokens, Role, User } from "@/types";

interface AuthState {
  user: User | null;
  hydrated: boolean; // false until the saved session has been read back
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
      // tokens live in tokenStorage. we only keep the profile here so the shell
      // can paint on reload without waiting for /auth/me/ to come back.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

// a failed refresh anywhere in the app drops the session there and then
setSessionExpiredHandler(() => useAuthStore.getState().signOut());
