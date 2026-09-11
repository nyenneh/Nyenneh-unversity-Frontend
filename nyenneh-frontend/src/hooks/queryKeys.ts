import type { CourseFilters, SlotFilters } from "@/services/academics.service";
import type { InvoiceFilters } from "@/services/finance.service";
import type { GradeFilters } from "@/services/grades.service";
import type { StudentFilters } from "@/services/students.service";

/**
 * Central key factory. Mutations invalidate by prefix (e.g. `queryKeys.courses.all`),
 * so a new filtered list never needs a matching invalidation added by hand.
 */
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
  dashboard: {
    all: ["dashboard"] as const,
    admin: ["dashboard", "admin"] as const,
    student: ["dashboard", "student"] as const,
  },
} as const;
