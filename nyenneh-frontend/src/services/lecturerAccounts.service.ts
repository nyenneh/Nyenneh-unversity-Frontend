// Admin-side lecturer accounts.
//
// A lecturer is just a portal account with role "LECTURER" - there is no
// separate lecturer table like students have - so reads and edits go to
// auth/users/. Creating one is the odd one out: that goes to the academic app,
// which makes the account and the teaching load in the same request. Either
// way we never collect a password, the server generates one and emails it.
//
// lecturer.service.ts is the other half: what a lecturer does once signed in.

import { del, get, patch, post, unwrapList } from "./api";
import { num, toCourseAllocation, toLecturerAccount } from "./adapters";
import { endpoints } from "./endpoints";
import type { CourseAllocation, LecturerAccount } from "@/types";

type Row = Record<string, unknown>;

// "Ada Byron Lovelace" -> ["Ada", "Byron", "Lovelace"]
// First word, last word, everything in between is the middle name. Same split
// the server does on create, so a name survives a round trip through the form.
export function splitFullName(fullName: string): [string, string, string] {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ["", "", ""];
  if (parts.length === 1) return [parts[0], "", ""];
  return [parts[0], parts.slice(1, -1).join(" "), parts[parts.length - 1]];
}

export interface LecturerAccountFilters {
  search?: string;
  is_active?: boolean;
}

// what the form actually collects - one name field, not three
export interface LecturerAccountInput {
  full_name: string;
  email: string;
  title?: string;
  phone_number?: string;
  courses?: number[]; // this semester, they can hold several
}

export interface LecturerCreated extends LecturerAccount {
  temporary_password_sent: boolean;
  courses_allocated: number;
  allocations: CourseAllocation[];
  detail?: string;
}

function params(filters: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export const lecturerAccountsService = {
  list: async (filters: LecturerAccountFilters = {}): Promise<LecturerAccount[]> => {
    const data = await get<Row[] | { results: Row[] }>(endpoints.lecturers.list, {
      params: params({ ...filters, role: "LECTURER" }),
    });
    return unwrapList(data).map(toLecturerAccount);
  },

  // Account and teaching load in one request. The server does both in a
  // transaction, so a course it rejects doesn't leave a stray account behind,
  // and it splits full_name itself.
  //
  // temporary_password_sent comes back separately on purpose: if the mail
  // fails the lecturer still exists and the admin can use resendPassword.
  create: async (input: LecturerAccountInput): Promise<LecturerCreated> => {
    const data = await post<Row>(endpoints.lecturers.onboard, input);
    return {
      ...toLecturerAccount(data),
      temporary_password_sent: Boolean(data.temporary_password_sent),
      courses_allocated: num(data.courses_allocated),
      allocations: ((data.allocations as Row[]) ?? []).map(toCourseAllocation),
      detail: typeof data.detail === "string" ? data.detail : undefined,
    };
  },

  // The accounts API wants the name in parts, so split it the same way the
  // server does on create.
  //
  // No email: it is the sign-in address and read-only once the account exists.
  // No courses either - you change a load on the allocations screen, which can
  // also take a course away, and this form can't express that.
  update: async (
    id: number,
    input: Partial<LecturerAccountInput>,
  ): Promise<LecturerAccount> => {
    const [first_name, middle_name, last_name] = splitFullName(input.full_name ?? "");
    return toLecturerAccount(
      await patch<Row>(endpoints.lecturers.detail(id), {
        title: input.title,
        first_name,
        middle_name,
        last_name,
        phone_number: input.phone_number,
      }),
    );
  },

  // kills the login only, the teaching history stays on the account
  deactivate: (id: number) => del(endpoints.lecturers.detail(id)),

  activate: async (id: number): Promise<LecturerAccount> =>
    toLecturerAccount(await post<Row>(endpoints.lecturers.activate(id))),

  resendPassword: async (id: number): Promise<string> => {
    const data = await post<Row>(endpoints.lecturers.resendPassword(id));
    return typeof data.detail === "string" ? data.detail : "A new temporary password was sent.";
  },
};
