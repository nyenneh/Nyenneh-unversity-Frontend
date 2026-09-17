import { del, get, patch, post, unwrapList } from "./api";
import { fromStudentStatus, toStudent } from "./adapters";
import { endpoints } from "./endpoints";
import type { Student, StudentStatus } from "@/types";

type Row = Record<string, unknown>;

export interface StudentFilters {
  search?: string;
  programme?: number | "";
  department?: number | "";
  level?: number | "";
  status?: StudentStatus | "";
}

// Admitting a student makes two records at once, the login account and the
// academic record. That is why the name is split here - the account needs the
// parts separately.
export interface StudentInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string;
  address: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  roll_number: string;
  level: number;
  programme: number;
  entry_session: number;
  status: StudentStatus;
}

// django wants "" for not provided, never null
const blank = (value: string | null | undefined) => value ?? "";

function toApi(payload: Partial<StudentInput>) {
  const body: Record<string, unknown> = {};

  if (payload.first_name !== undefined) body.first_name = payload.first_name;
  if (payload.last_name !== undefined) body.last_name = payload.last_name;
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.phone !== undefined) body.phone_number = blank(payload.phone);
  if (payload.gender !== undefined) body.gender = blank(payload.gender);
  if (payload.address !== undefined) body.address = blank(payload.address);
  if (payload.guardian_name !== undefined) {
    body.guardian_name = blank(payload.guardian_name);
  }
  if (payload.guardian_phone !== undefined) {
    body.guardian_phone = blank(payload.guardian_phone);
  }
  if (payload.level !== undefined) body.level = payload.level;
  if (payload.programme !== undefined) body.programme = payload.programme;
  if (payload.entry_session !== undefined) body.entry_session = payload.entry_session;
  if (payload.status !== undefined) body.status = fromStudentStatus(payload.status);

  // leave a blank date out entirely, "" comes back as a 400
  if (payload.date_of_birth) body.date_of_birth = payload.date_of_birth;

  // leave it out and the registry allocates the next number for the department
  if (payload.roll_number) body.roll_number = payload.roll_number;

  return body;
}

export const studentsService = {
  list: async (filters: StudentFilters = {}): Promise<Student[]> =>
    unwrapList(
      await get<Row[]>(endpoints.students.list, {
        params: {
          ...filters,
          ...(filters.status ? { status: fromStudentStatus(filters.status) } : {}),
        },
      }),
    ).map(toStudent),

  retrieve: async (id: number) => toStudent(await get<Row>(endpoints.students.detail(id))),

  me: async () => toStudent(await get<Row>(endpoints.students.me)),

  // admits them and emails a temporary password to the new account
  create: async (payload: StudentInput) =>
    toStudent(await post<Row>(endpoints.students.list, toApi(payload))),

  update: async (id: number, payload: Partial<StudentInput>) =>
    toStudent(await patch<Row>(endpoints.students.detail(id), toApi(payload))),

  // withdraws them and deactivates the account, nothing is actually deleted
  remove: (id: number) => del(endpoints.students.detail(id)),
};
