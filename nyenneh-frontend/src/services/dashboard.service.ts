import { get } from "./api";
import { num } from "./adapters";
import { endpoints } from "./endpoints";
import type { AdminDashboardStats, StudentDashboardStats } from "@/types";

type Row = Record<string, unknown>;

export const dashboardService = {
  admin: async (): Promise<AdminDashboardStats> => {
    const data = await get<Row>(endpoints.dashboard.admin);
    return {
      total_students: num(data.total_students),
      total_courses: num(data.total_courses),
      total_departments: num(data.total_departments),
      pending_enrollments: num(data.pending_enrollments),
      registered_enrollments: num(data.registered_enrollments),
      current_semester: (data.current_semester as string | null) ?? null,
      outstanding_fees: num(data.outstanding_fees),
      collected_fees: num(data.collected_fees),
      enrollment_by_level: ((data.enrollment_by_level as Row[]) ?? []).map((row) => ({
        level: num(row.level),
        count: num(row.count),
      })),
    };
  },

  student: async (): Promise<StudentDashboardStats> => {
    const data = await get<Row>(endpoints.dashboard.student);
    return {
      cgpa: num(data.cgpa),
      registered_courses: num(data.registered_courses),
      credit_units: num(data.credit_units),
      outstanding_balance: num(data.outstanding_balance),
      current_semester: (data.current_semester as string | null) ?? null,
    };
  },
};
