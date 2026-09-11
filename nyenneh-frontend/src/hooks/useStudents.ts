import { useQuery } from "@tanstack/react-query";

import {
  studentsService,
  type StudentFilters,
  type StudentInput,
} from "@/services/students.service";
import { queryKeys } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: () => studentsService.list(filters),
    // Keeps the previous rows on screen while a filter change is in flight.
    placeholderData: (previous) => previous,
  });
}

/**
 * One student in full.
 *
 * The roster list is a trimmed payload — enough to draw a row, but missing the
 * personal details the edit form writes back — so the form loads the record
 * proper before it is filled in.
 */
export function useStudent(id?: number) {
  return useQuery({
    queryKey: queryKeys.students.detail(id ?? 0),
    queryFn: () => studentsService.retrieve(id!),
    enabled: Boolean(id),
  });
}

export function useSaveStudent(id?: number) {
  return useMutationWithToast({
    mutationFn: (payload: StudentInput) =>
      id ? studentsService.update(id, payload) : studentsService.create(payload),
    invalidates: [queryKeys.students.all, queryKeys.dashboard.all],
    successMessage: id ? "Student record updated." : "Student enrolled.",
  });
}

export function useDeleteStudent() {
  return useMutationWithToast({
    mutationFn: (id: number) => studentsService.remove(id),
    invalidates: [queryKeys.students.all, queryKeys.dashboard.all],
    successMessage: "Student removed from the roster.",
  });
}
