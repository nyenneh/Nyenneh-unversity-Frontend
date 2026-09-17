import { get, post } from "./api";
import { toUser, type ApiUser } from "./adapters";
import { endpoints } from "./endpoints";
import type { LoginResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

interface ApiLoginResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

// The roll number is on the student record, not the account, so the header
// needs a second call for it. A non-student has no such record and the 404 is
// expected - we just show no roll number.
//
// accessToken is passed in at login because the request interceptor reads the
// token from storage and the store only writes it after login resolves.
async function rollNumberFor(
  user: User,
  accessToken?: string,
): Promise<string | null> {
  if (user.role !== "student") return null;
  try {
    const student = await get<{ roll_number?: string }>(
      endpoints.students.me,
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    );
    return student.roll_number ?? null;
  } catch {
    return null;
  }
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const data = await post<ApiLoginResponse>(endpoints.auth.login, payload);
    const user = toUser(data.user);
    return {
      access: data.access,
      refresh: data.refresh,
      user: { ...user, roll_number: await rollNumberFor(user, data.access) },
    };
  },

  me: async (): Promise<User> => {
    const api = await get<ApiUser>(endpoints.auth.me);
    const user = toUser(api);
    return { ...user, roll_number: await rollNumberFor(user) };
  },

  changePassword: (payload: { current_password: string; new_password: string }) =>
    post<{ detail: string }>(endpoints.auth.changePassword, {
      ...payload,
      // server wants it twice, the form only asks once
      confirm_password: payload.new_password,
    }),
};
