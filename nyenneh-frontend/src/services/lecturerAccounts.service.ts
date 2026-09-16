/**
 * Admin-side lecturer accounts.
 *
 * A lecturer *is* a portal account with `role: "LECTURER"` — there is no
 * separate lecturer record the way students have one — so the reads and the
 * edits here go to the accounts API (`auth/users/`). Creating one is the
 * exception: it goes to the academic app, which makes the account and the
 * teaching load together. No password is collected either way; one is generated
 * and emailed.
 *
 * `lecturer.service.ts` is the other side of this: what a lecturer does once
 * they are signed in. This module is only what an admin does *to* the account.
 */

import { del, get, patch, post, unwrapList } from "./api";
import { num, toCourseAllocation, toLecturerAccount } from "./adapters";
import { endpoints } from "./endpoints";
import type { CourseAllocation, LecturerAccount } from "@/types";

type Row = Record<string, unknown>;

/**
 * "Ada Byron Lovelace" -> ["Ada", "Byron", "Lovelace"].
 *
 * First word, last word, everything between as the middle name — the inverse of
 * the server's `get_full_name()`, and the same split it applies on create, so a
 * name survives a round trip through the edit form unchanged.
 */
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

/**
 * What the form collects: one `full_name` field rather than three name fields,
 * and the courses the lecturer teaches.
 */
export interface LecturerAccountInput {
  full_name: string;
  email: string;
  title?: string;
  phone_number?: string;
  /** Courses to teach this semester. A lecturer may hold several. */
  courses?: number[];
}

/** Result of a create: the account, its load, and whether the email left. */
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

  /**
   * Creates the account *and* its teaching load in one request, the way
   * admitting a student creates a login and an academic record together. The
   * server does both atomically, so a course it rejects leaves no account
   * behind, and it splits `full_name` into the parts the account model stores.
   *
   * The email is reported separately from the account: a mail outage still
   * leaves a usable lecturer, whose password the admin can send with
   * `resendPassword`.
   */
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

  /**
   * Edits the personal details through the accounts API, which takes the name in
   * parts — so the single form field is split here the same way the server
   * splits it on create.
   *
   * `email` is left out: it is the sign-in address, and the accounts API treats
   * it as read-only once the account exists. Courses are left out too — an
   * existing lecturer's load is changed on the allocations screen, which can
   * withdraw a course as well as add one, something this form cannot express.
   */
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

  /** Deactivates the login; the teaching history stays attached to the account. */
  deactivate: (id: number) => del(endpoints.lecturers.detail(id)),

  activate: async (id: number): Promise<LecturerAccount> =>
    toLecturerAccount(await post<Row>(endpoints.lecturers.activate(id))),

  resendPassword: async (id: number): Promise<string> => {
    const data = await post<Row>(endpoints.lecturers.resendPassword(id));
    return typeof data.detail === "string" ? data.detail : "A new temporary password was sent.";
  },
};
