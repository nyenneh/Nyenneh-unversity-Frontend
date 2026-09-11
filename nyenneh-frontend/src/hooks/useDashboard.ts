import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/services/dashboard.service";
import { queryKeys } from "./queryKeys";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: dashboardService.admin,
  });
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.student,
    queryFn: dashboardService.student,
  });
}
