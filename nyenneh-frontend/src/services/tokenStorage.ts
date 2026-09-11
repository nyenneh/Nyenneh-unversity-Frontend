import type { AuthTokens } from "@/types";

const ACCESS_KEY = "nyenneh.access_token";
const REFRESH_KEY = "nyenneh.refresh_token";

/**
 * Token persistence lives on its own so that the axios instance and the auth
 * store can both reach it without importing each other.
 */
export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: ({ access, refresh }: AuthTokens) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  setAccess: (access: string) => localStorage.setItem(ACCESS_KEY, access),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
