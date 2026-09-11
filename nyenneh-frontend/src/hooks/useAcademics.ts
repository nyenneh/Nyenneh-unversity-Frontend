import { useQuery } from "@tanstack/react-query";

import {
  academicsService,
  type ClassSlotInput,
  type CourseFilters,
  type CourseInput,
  type DepartmentInput,
  type SlotFilters,
} from "@/services/academics.service";
import { getErrorMessage } from "@/services/api";
import { titleCase } from "@/lib/utils";
import type { Weekday } from "@/types";
import { queryKeys } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

// --- reference data -------------------------------------------------------

/** Faculties, programmes and sessions barely change; keep them warm. */
const REFERENCE_STALE_TIME = 5 * 60 * 1000;

export function useFaculties() {
  return useQuery({
    queryKey: queryKeys.faculties.all,
    queryFn: academicsService.listFaculties,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useProgrammes() {
  return useQuery({
    queryKey: queryKeys.programmes.all,
    queryFn: academicsService.listProgrammes,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.all,
    queryFn: academicsService.listSessions,
    staleTime: REFERENCE_STALE_TIME,
  });
}

/** The semester registrations are filed against. Null until one is marked current. */
export function useCurrentSemester() {
  return useQuery({
    queryKey: queryKeys.semesters.current,
    queryFn: academicsService.currentSemester,
    staleTime: REFERENCE_STALE_TIME,
  });
}

// --- departments ----------------------------------------------------------

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: academicsService.listDepartments,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useSaveDepartment(id?: number) {
  return useMutationWithToast({
    mutationFn: (payload: DepartmentInput) =>
      id
        ? academicsService.updateDepartment(id, payload)
        : academicsService.createDepartment(payload),
    invalidates: [queryKeys.departments.all, queryKeys.dashboard.all],
    successMessage: id ? "Department updated." : "Department created.",
  });
}

export function useDeleteDepartment() {
  return useMutationWithToast({
    mutationFn: (id: number) => academicsService.deleteDepartment(id),
    invalidates: [queryKeys.departments.all, queryKeys.dashboard.all],
    successMessage: "Department deleted.",
  });
}

// --- courses --------------------------------------------------------------

export function useCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => academicsService.listCourses(filters),
    placeholderData: (previous) => previous,
  });
}

export function useSaveCourse(id?: number) {
  return useMutationWithToast({
    mutationFn: (payload: CourseInput) =>
      id ? academicsService.updateCourse(id, payload) : academicsService.createCourse(payload),
    invalidates: [queryKeys.courses.all, queryKeys.dashboard.all],
    successMessage: id ? "Course updated." : "Course added to the catalog.",
  });
}

export function useDeleteCourse() {
  return useMutationWithToast({
    mutationFn: (id: number) => academicsService.deleteCourse(id),
    invalidates: [queryKeys.courses.all, queryKeys.dashboard.all],
    successMessage: "Course removed.",
  });
}

// --- class slots ----------------------------------------------------------

export function useClassSlots(filters: SlotFilters = {}) {
  return useQuery({
    queryKey: queryKeys.slots.list(filters),
    queryFn: () => academicsService.listSlots(filters),
  });
}

/** The signed-in student's timetable, built from their approved courses. */
export function useMySchedule() {
  return useQuery({
    queryKey: queryKeys.slots.mine,
    queryFn: academicsService.mySchedule,
  });
}

export function useLecturers() {
  return useQuery({
    queryKey: queryKeys.lecturers.all,
    queryFn: academicsService.listLecturers,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useSaveClassSlot(id?: number) {
  return useMutationWithToast({
    mutationFn: (payload: ClassSlotInput) =>
      id ? academicsService.updateSlot(id, payload) : academicsService.createSlot(payload),
    invalidates: [queryKeys.slots.all],
    successMessage: id ? "Class slot updated." : "Class slot scheduled.",
  });
}

export function useDeleteClassSlot() {
  return useMutationWithToast({
    mutationFn: (id: number) => academicsService.deleteSlot(id),
    invalidates: [queryKeys.slots.all],
    successMessage: "Class slot removed.",
  });
}

/**
 * Registry flow: adding a course also puts its classes on the timetable.
 *
 * The course is created first, then one slot per selected day. A slot that
 * clashes with an existing booking is reported without discarding the course
 * that was already created, so the admin fixes the clash on the Class Slots
 * page rather than re-entering everything.
 */
export function useCreateCourseWithSchedule() {
  return useMutationWithToast({
    mutationFn: async ({
      course,
      days,
      start_time,
      end_time,
      venue,
      lecturer,
    }: {
      course: CourseInput;
      days: Weekday[];
      start_time: string;
      end_time: string;
      venue: string;
      lecturer: number | null;
    }) => {
      const created = await academicsService.createCourse(course);

      const clashes: string[] = [];
      for (const day of days) {
        try {
          await academicsService.createSlot({
            course: created.id,
            day,
            start_time,
            end_time,
            venue,
            lecturer,
          });
        } catch (error) {
          clashes.push(`${titleCase(day)}: ${getErrorMessage(error)}`);
        }
      }

      return { course: created, scheduled: days.length - clashes.length, clashes };
    },
    invalidates: [queryKeys.courses.all, queryKeys.slots.all, queryKeys.dashboard.all],
    successMessage: ({ course, scheduled }) =>
      `${course.code} added with ${scheduled} class${scheduled === 1 ? "" : "es"} scheduled.`,
  });
}

// --- enrollments ----------------------------------------------------------

export function useEnrollments(params: { student?: number; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.enrollments.list(params),
    queryFn: () => academicsService.listEnrollments(params),
  });
}

export function useEnroll() {
  return useMutationWithToast({
    mutationFn: ({ courseId, semesterId }: { courseId: number; semesterId: number }) =>
      academicsService.enroll(courseId, semesterId),
    invalidates: [
      queryKeys.enrollments.all,
      queryKeys.courses.all,
      queryKeys.dashboard.all,
    ],
    successMessage: (enrollment) =>
      `${enrollment.course_code} submitted for approval.`,
  });
}

export function useDropEnrollment() {
  return useMutationWithToast({
    mutationFn: (id: number) => academicsService.dropEnrollment(id),
    invalidates: [
      queryKeys.enrollments.all,
      queryKeys.courses.all,
      queryKeys.slots.all,
      queryKeys.grades.all,
      queryKeys.dashboard.all,
    ],
    successMessage: "Course dropped.",
  });
}

/** The registry deciding on a request. Approving it releases nothing; rejecting frees the seat. */
export function useReviewEnrollment() {
  return useMutationWithToast({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: number;
      action: "approve" | "reject";
      note?: string;
    }) =>
      action === "approve"
        ? academicsService.approveEnrollment(id)
        : academicsService.rejectEnrollment(id, note),
    invalidates: [
      queryKeys.enrollments.all,
      queryKeys.courses.all,
      queryKeys.slots.all,
      queryKeys.grades.all,
      queryKeys.dashboard.all,
    ],
    successMessage: (enrollment) =>
      enrollment.status === "registered"
        ? `${enrollment.student_name} approved for ${enrollment.course_code}.`
        : `${enrollment.course_code} registration rejected.`,
  });
}
