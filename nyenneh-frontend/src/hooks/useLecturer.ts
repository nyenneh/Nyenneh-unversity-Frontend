import { useQuery } from "@tanstack/react-query";

import {
  lecturerService,
  type AllocationFilters,
  type AssignCoursesInput,
  type MeetingInput,
  type QuizInput,
  type QuizScoreEntry,
  type RegisterEntry,
  type ResultEntry,
} from "@/services/lecturer.service";
import { queryKeys } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

// --- dashboard & teaching load ---

export function useLecturerDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.lecturer,
    queryFn: lecturerService.dashboard,
  });
}

export function useAllocations(filters: AllocationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.allocations.list(filters),
    queryFn: () => lecturerService.listAllocations(filters),
    placeholderData: (previous) => previous,
  });
}

export function useAssignCourses() {
  return useMutationWithToast({
    mutationFn: (input: AssignCoursesInput) => lecturerService.assignCourses(input),
    invalidates: [queryKeys.allocations.all, queryKeys.dashboard.all],
    // the server says what actually changed, which beats a generic "saved"
    // when someone re-submits a load they didn't touch
    successMessage: (result) => result.detail || "Teaching load updated.",
  });
}

export function useRemoveAllocation() {
  return useMutationWithToast({
    mutationFn: (id: number) => lecturerService.removeAllocation(id),
    invalidates: [queryKeys.allocations.all, queryKeys.dashboard.all],
    successMessage: "Allocation removed.",
  });
}

// --- attendance ---

export function useMeetings(filters: { course?: number; semester?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.attendance.meetings(filters),
    queryFn: () => lecturerService.listMeetings(filters),
    placeholderData: (previous) => previous,
  });
}

export function useCreateMeeting() {
  return useMutationWithToast({
    mutationFn: (input: MeetingInput) => lecturerService.createMeeting(input),
    invalidates: [queryKeys.attendance.all, queryKeys.dashboard.all],
    successMessage: "Class recorded. Take the register when you are ready.",
  });
}

export function useDeleteMeeting() {
  return useMutationWithToast({
    mutationFn: (id: number) => lecturerService.deleteMeeting(id),
    invalidates: [queryKeys.attendance.all, queryKeys.dashboard.all],
    successMessage: "Class removed.",
  });
}

// only enabled once a meeting is picked, so the list view fires nothing
export function useRegister(meetingId: number | null) {
  return useQuery({
    queryKey: queryKeys.attendance.register(meetingId ?? 0),
    queryFn: () => lecturerService.register(meetingId as number),
    enabled: meetingId !== null,
  });
}

export function useTakeRegister() {
  return useMutationWithToast({
    mutationFn: ({ meeting, entries }: { meeting: number; entries: RegisterEntry[] }) =>
      lecturerService.takeRegister(meeting, entries),
    invalidates: [queryKeys.attendance.all, queryKeys.dashboard.all],
    successMessage: (records) => `Register taken for ${records.length} student(s).`,
  });
}

export function useAttendanceSummary(course: number | null, semester?: number) {
  return useQuery({
    queryKey: queryKeys.attendance.summary({ course: course ?? 0, semester }),
    queryFn: () => lecturerService.attendanceSummary(course as number, semester),
    enabled: course !== null,
  });
}

export function useMyAttendance(semester?: number) {
  return useQuery({
    queryKey: queryKeys.attendance.mine,
    queryFn: () => lecturerService.myAttendance(semester),
  });
}

// --- quizzes ---

export function useQuizzes(filters: { course?: number; semester?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.quizzes.list(filters),
    queryFn: () => lecturerService.listQuizzes(filters),
    placeholderData: (previous) => previous,
  });
}

export function useSaveQuiz(id?: number) {
  return useMutationWithToast({
    mutationFn: (input: QuizInput) =>
      id ? lecturerService.updateQuiz(id, input) : lecturerService.createQuiz(input),
    invalidates: [queryKeys.quizzes.all, queryKeys.dashboard.all],
    successMessage: id ? "Quiz updated." : "Quiz created.",
  });
}

export function useDeleteQuiz() {
  return useMutationWithToast({
    mutationFn: (id: number) => lecturerService.deleteQuiz(id),
    invalidates: [queryKeys.quizzes.all, queryKeys.dashboard.all],
    successMessage: "Quiz deleted.",
  });
}

export function useQuizMarkSheet(quizId: number | null) {
  return useQuery({
    queryKey: queryKeys.quizzes.markSheet(quizId ?? 0),
    queryFn: () => lecturerService.quizMarkSheet(quizId as number),
    enabled: quizId !== null,
  });
}

export function useSaveQuizScores() {
  return useMutationWithToast({
    mutationFn: ({ quiz, entries }: { quiz: number; entries: QuizScoreEntry[] }) =>
      lecturerService.saveQuizScores(quiz, entries),
    // the CA suggestion on the mark sheet comes off these, so refetch it too
    invalidates: [queryKeys.quizzes.all, queryKeys.markSheet.all, queryKeys.dashboard.all],
    successMessage: (scores) => `Recorded ${scores.length} score(s).`,
  });
}

// --- final marks ---

export function useMarkSheet(course: number | null, semester: number | null) {
  return useQuery({
    queryKey: queryKeys.markSheet.list({ course: course ?? 0, semester: semester ?? 0 }),
    queryFn: () => lecturerService.markSheet(course as number, semester as number),
    enabled: course !== null && semester !== null,
  });
}

export function useSaveResults() {
  return useMutationWithToast({
    mutationFn: (entries: ResultEntry[]) => lecturerService.saveResults(entries),
    invalidates: [
      queryKeys.markSheet.all,
      queryKeys.grades.all,
      queryKeys.dashboard.all,
    ],
    successMessage: (results) => `Saved ${results.length} result(s).`,
  });
}
