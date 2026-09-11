import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { endpoints } from "./endpoints";
import { tokenStorage } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: baseURL.endsWith("/") ? baseURL : `${baseURL}/`,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Callback the auth store registers so a dead session can clear app state. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// While one refresh is in flight, other 401s wait on the same promise instead of
// firing a refresh call each.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) throw new Error("No refresh token");

  // A bare axios call, so a 401 here cannot re-enter this interceptor.
  const { data } = await axios.post<{ access: string }>(
    `${api.defaults.baseURL}${endpoints.auth.refresh}`,
    { refresh },
    { headers: { "Content-Type": "application/json" } },
  );
  tokenStorage.setAccess(data.access);
  return data.access;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthCall = original?.url?.includes(endpoints.auth.refresh);

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const access = await refreshPromise;
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch {
        tokenStorage.clear();
        onSessionExpired?.();
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Turns a DRF error payload into a single sentence fit for a toast.
 *
 * DRF replies in several shapes: {"detail": "..."}, {"field": ["msg"]}, or a
 * bare string, so all three are handled here rather than at every call site.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (!error.response) return "Cannot reach the server. Check that the backend is running.";

  const data = error.response.data as unknown;
  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const detail = record.detail ?? record.error ?? record.message;
    if (typeof detail === "string") return detail;

    const firstField = Object.entries(record)[0];
    if (firstField) {
      const [field, value] = firstField;
      const text = Array.isArray(value) ? String(value[0]) : String(value);
      return field === "non_field_errors" ? text : `${field}: ${text}`;
    }
  }

  return fallback;
}

/** Small helpers so services read as `get<Course[]>(...)` instead of axios noise. */
export async function get<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await api.get<T>(url, config);
  return data;
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await api.post<T>(url, body, config);
  return data;
}

export async function patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await api.patch<T>(url, body, config);
  return data;
}

export async function del(url: string, config?: AxiosRequestConfig) {
  await api.delete(url, config);
}

/**
 * DRF list endpoints are paginated when a page size is configured and plain
 * arrays when it is not; both shapes are accepted so the UI does not care.
 */
export function unwrapList<T>(payload: T[] | { results: T[] }): T[] {
  return Array.isArray(payload) ? payload : (payload?.results ?? []);
}

export default api;
