import { useQuery } from "@tanstack/react-query";

import {
  gradesService,
  type GradeFilters,
  type GradeScoreInput,
} from "@/services/grades.service";
import { queryKeys } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

export function useGrades(filters: GradeFilters = {}) {
  return useQuery({
    queryKey: queryKeys.grades.list(filters),
    queryFn: () => gradesService.list(filters),
    placeholderData: (previous) => previous,
  });
}

export function useMyResults() {
  return useQuery({
    queryKey: queryKeys.grades.myResults,
    queryFn: gradesService.myResults,
  });
}

export function useSaveGradeScores() {
  return useMutationWithToast({
    mutationFn: ({ id, ...scores }: GradeScoreInput & { id: number }) =>
      gradesService.updateScores(id, scores),
    invalidates: [queryKeys.grades.all, queryKeys.dashboard.all],
    successMessage: (grade) => `Scores saved for ${grade.student_name}.`,
  });
}

export function usePublishGrades() {
  return useMutationWithToast({
    mutationFn: (ids: number[]) => gradesService.publish(ids),
    invalidates: [queryKeys.grades.all],
    successMessage: ({ updated }) =>
      `${updated} result${updated === 1 ? "" : "s"} published to students.`,
  });
}
