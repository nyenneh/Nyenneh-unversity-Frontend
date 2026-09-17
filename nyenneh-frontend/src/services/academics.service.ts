import { del, get, patch, post, unwrapList } from "./api";
import {
  fromEnrollmentStatus,
  fromSemester,
  fromWeekday,
  toClassSlot,
  toCourse,
  toDepartment,
  toEnrollment,
  toFaculty,
  toLecturer,
  toProgramme,
  toSemesterTerm,
  toSession,
} from "./adapters";
import { endpoints } from "./endpoints";
import type {
  AcademicSession,
  ClassSlot,
  Course,
  Department,
  Enrollment,
  EnrollmentStatus,
  Faculty,
  Lecturer,
  Programme,
  SemesterTerm,
  Weekday,
} from "@/types";

type Row = Record<string, unknown>;

export interface CourseFilters {
  search?: string;
  department?: number | "";
  level?: number | "";
  semester?: string;
}

export interface DepartmentInput {
  name: string;
  code: string;
  faculty: number;
  description?: string;
}

export interface CourseInput {
  code: string;
  title: string;
  description: string;
  credit_units: number;
  level: number;
  semester: "first" | "second";
  department: number;
  capacity: number | null; // null = no seat limit
  is_active: boolean;
}

export interface ClassSlotInput {
  course: number;
  day: Weekday;
  start_time: string; // "HH:MM"
  end_time: string;
  venue: string;
  lecturer: number | null;
}

export interface SlotFilters {
  course?: number;
  day?: Weekday;
  lecturer?: number;
  semester?: "first" | "second";
}

// the API filters on semester_number, we use "first"/"second"
function courseParams(filters: CourseFilters) {
  const { semester, ...rest } = filters;
  return {
    ...rest,
    ...(semester ? { semester_number: fromSemester(semester) } : {}),
  };
}

function courseBody(payload: Partial<CourseInput>) {
  const { semester, ...rest } = payload;
  return {
    ...rest,
    ...(semester ? { semester_number: fromSemester(semester) } : {}),
  };
}

// the API numbers the weekdays and wants seconds on the times
function slotBody(payload: Partial<ClassSlotInput>) {
  const { day, ...rest } = payload;
  return {
    ...rest,
    ...(day ? { day: fromWeekday(day) } : {}),
  };
}

export const academicsService = {
  /* ---- reference data --------------------------------------------------- */

  listFaculties: async (): Promise<Faculty[]> =>
    unwrapList(await get<Row[]>(endpoints.faculties.list)).map(toFaculty),

  listSessions: async (): Promise<AcademicSession[]> =>
    unwrapList(await get<Row[]>(endpoints.sessions.list)).map(toSession),

  listSemesters: async (): Promise<SemesterTerm[]> =>
    unwrapList(await get<Row[]>(endpoints.semesters.list)).map(toSemesterTerm),

  currentSemester: async (): Promise<SemesterTerm | null> => {
    try {
      return toSemesterTerm(await get<Row>(endpoints.semesters.current));
    } catch {
      // 404 until the registry marks one current, which isn't an error
      return null;
    }
  },

  listProgrammes: async (): Promise<Programme[]> =>
    unwrapList(await get<Row[]>(endpoints.programmes.list)).map(toProgramme),

  /* ---- departments ------------------------------------------------------ */

  listDepartments: async (): Promise<Department[]> =>
    unwrapList(await get<Row[]>(endpoints.departments.list)).map(toDepartment),

  createDepartment: async (payload: DepartmentInput) =>
    toDepartment(await post<Row>(endpoints.departments.list, payload)),

  updateDepartment: async (id: number, payload: Partial<DepartmentInput>) =>
    toDepartment(await patch<Row>(endpoints.departments.detail(id), payload)),

  deleteDepartment: (id: number) => del(endpoints.departments.detail(id)),

  /* ---- courses ---------------------------------------------------------- */

  listCourses: async (filters: CourseFilters = {}): Promise<Course[]> =>
    unwrapList(
      await get<Row[]>(endpoints.courses.list, { params: courseParams(filters) }),
    ).map(toCourse),

  createCourse: async (payload: CourseInput) =>
    toCourse(await post<Row>(endpoints.courses.list, courseBody(payload))),

  updateCourse: async (id: number, payload: Partial<CourseInput>) =>
    toCourse(await patch<Row>(endpoints.courses.detail(id), courseBody(payload))),

  deleteCourse: (id: number) => del(endpoints.courses.detail(id)),

  /* ---- class slots ------------------------------------------------------ */

  listSlots: async (filters: SlotFilters = {}): Promise<ClassSlot[]> =>
    unwrapList(
      await get<Row[]>(endpoints.slots.list, {
        params: {
          ...(filters.course ? { course: filters.course } : {}),
          ...(filters.lecturer ? { lecturer: filters.lecturer } : {}),
          ...(filters.day ? { day: fromWeekday(filters.day) } : {}),
          ...(filters.semester
            ? { semester_number: fromSemester(filters.semester) }
            : {}),
        },
      }),
    ).map(toClassSlot),

  mySchedule: async (): Promise<ClassSlot[]> =>
    unwrapList(await get<Row[]>(endpoints.slots.mySchedule)).map(toClassSlot),

  createSlot: async (payload: ClassSlotInput) =>
    toClassSlot(await post<Row>(endpoints.slots.list, slotBody(payload))),

  updateSlot: async (id: number, payload: Partial<ClassSlotInput>) =>
    toClassSlot(await patch<Row>(endpoints.slots.detail(id), slotBody(payload))),

  deleteSlot: (id: number) => del(endpoints.slots.detail(id)),

  listLecturers: async (): Promise<Lecturer[]> =>
    unwrapList(
      await get<Row[]>(endpoints.lecturers.list, { params: { role: "LECTURER" } }),
    ).map(toLecturer),

  /* ---- enrollments ------------------------------------------------------ */

  listEnrollments: async (
    params: { student?: number; status?: string } = {},
  ): Promise<Enrollment[]> =>
    unwrapList(
      await get<Row[]>(endpoints.enrollments.list, {
        params: {
          ...params,
          ...(params.status
            ? { status: fromEnrollmentStatus(params.status as EnrollmentStatus) }
            : {}),
        },
      }),
    ).map(toEnrollment),

  // student comes from the token, and it lands pending until the registry
  // approves it
  enroll: async (courseId: number, semesterId: number) =>
    toEnrollment(
      await post<Row>(endpoints.enrollments.list, {
        course: courseId,
        semester: semesterId,
      }),
    ),

  // marks it dropped rather than deleting the row, so the history survives
  dropEnrollment: (id: number) => del(endpoints.enrollments.detail(id)),

  // registry decisions. approve re-checks there is still a seat.
  approveEnrollment: async (id: number) =>
    toEnrollment(await post<Row>(endpoints.enrollments.approve(id))),

  rejectEnrollment: async (id: number, note = "") =>
    toEnrollment(await post<Row>(endpoints.enrollments.reject(id), { note })),
};
