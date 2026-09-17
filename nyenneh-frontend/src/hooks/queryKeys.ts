import type { CourseFilters, SlotFilters } from "@/services/academics.service";
import type { InvoiceFilters } from "@/services/finance.service";
import type { GradeFilters } from "@/services/grades.service";
import type { LecturerAccountFilters } from "@/services/lecturerAccounts.service";
import type { AllocationFilters } from "@/services/lecturer.service";
import type { StudentFilters } from "@/services/students.service";

// All the query keys in one place. Mutations invalidate by prefix
// (queryKeys.courses.all and so on), so adding a new filtered list doesn't
// mean going round adding invalidations for it.
export const queryKeys = {
  faculties: {
    all: ["faculties"] as const,
  },
  programmes: {
    all: ["programmes"] as const,
  },
  sessions: {
    all: ["sessions"] as const,
  },
  semesters: {
    current: ["semesters", "current"] as const,
  },
  departments: {
    all: ["departments"] as const,
  },
  courses: {
    all: ["courses"] as const,
    list: (filters: CourseFilters) => ["courses", "list", filters] as const,
  },
  slots: {
    all: ["slots"] as const,
    list: (filters: SlotFilters) => ["slots", "list", filters] as const,
    mine: ["slots", "mine"] as const,
  },
  lecturers: {
    all: ["lecturers"] as const,
    list: (filters: LecturerAccountFilters) => ["lecturers", "list", filters] as const,
  },
  students: {
    all: ["students"] as const,
    list: (filters: StudentFilters) => ["students", "list", filters] as const,
    detail: (id: number) => ["students", "detail", id] as const,
  },
  enrollments: {
    all: ["enrollments"] as const,
    list: (params: { student?: number; status?: string }) =>
      ["enrollments", "list", params] as const,
  },
  grades: {
    all: ["grades"] as const,
    list: (filters: GradeFilters) => ["grades", "list", filters] as const,
    myResults: ["grades", "my-results"] as const,
  },
  finance: {
    all: ["finance"] as const,
    invoices: (filters: InvoiceFilters) => ["finance", "invoices", filters] as const,
    myInvoices: ["finance", "my-invoices"] as const,
    payments: (params: { invoice?: number }) => ["finance", "payments", params] as const,
  },
  allocations: {
    all: ["allocations"] as const,
    list: (filters: AllocationFilters) => ["allocations", "list", filters] as const,
  },
  attendance: {
    all: ["attendance"] as const,
    meetings: (params: { course?: number; semester?: number }) =>
      ["attendance", "meetings", params] as const,
    register: (meeting: number) => ["attendance", "register", meeting] as const,
    summary: (params: { course: number; semester?: number }) =>
      ["attendance", "summary", params] as const,
    mine: ["attendance", "mine"] as const,
  },
  quizzes: {
    all: ["quizzes"] as const,
    list: (params: { course?: number; semester?: number }) =>
      ["quizzes", "list", params] as const,
    markSheet: (quiz: number) => ["quizzes", "mark-sheet", quiz] as const,
    mine: ["quizzes", "my-scores"] as const,
  },
  markSheet: {
    all: ["mark-sheet"] as const,
    list: (params: { course: number; semester: number }) =>
      ["mark-sheet", params] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    admin: ["dashboard", "admin"] as const,
    student: ["dashboard", "student"] as const,
    lecturer: ["dashboard", "lecturer"] as const,
  },
} as const;
