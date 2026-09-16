import { useQuery } from "@tanstack/react-query";

import {
  lecturerAccountsService,
  type LecturerAccountFilters,
  type LecturerAccountInput,
  type LecturerCreated,
} from "@/services/lecturerAccounts.service";
import { queryKeys } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

/**
 * The admin's view of lecturer accounts. Every mutation invalidates
 * `queryKeys.lecturers.all`, which the course and allocation pickers read, so a
 * lecturer created here is selectable on the allocations page straight away.
 * Creating also invalidates the allocation and dashboard keys, because the same
 * request may have handed the lecturer a teaching load.
 */
export function useLecturerAccounts(filters: LecturerAccountFilters = {}) {
  return useQuery({
    queryKey: queryKeys.lecturers.list(filters),
    queryFn: () => lecturerAccountsService.list(filters),
    placeholderData: (previous) => previous,
  });
}

export function useSaveLecturer(id?: number) {
  return useMutationWithToast({
    mutationFn: (input: LecturerAccountInput) =>
      id
        ? lecturerAccountsService.update(id, input)
        : lecturerAccountsService.create(input),
    invalidates: [
      queryKeys.lecturers.all,
      queryKeys.allocations.all,
      queryKeys.dashboard.all,
    ],
    successMessage: (result) => {
      if (id) return "Lecturer updated.";

      const created = result as LecturerCreated;
      const load =
        created.courses_allocated > 0
          ? ` and given ${created.courses_allocated} course${
              created.courses_allocated === 1 ? "" : "s"
            }`
          : "";
      // The server reports whether the password email actually left; saying
      // "emailed" when it bounced would send the admin looking in the wrong place.
      return created.temporary_password_sent
        ? `Lecturer added${load}. A temporary password was emailed to ${created.email}.`
        : `Lecturer added${load}, but the password email failed. Use “Resend password” to try again.`;
    },
  });
}

export function useDeactivateLecturer() {
  return useMutationWithToast({
    mutationFn: (id: number) => lecturerAccountsService.deactivate(id),
    invalidates: [queryKeys.lecturers.all],
    successMessage: "Lecturer deactivated. Their record and teaching history are kept.",
  });
}

export function useActivateLecturer() {
  return useMutationWithToast({
    mutationFn: (id: number) => lecturerAccountsService.activate(id),
    invalidates: [queryKeys.lecturers.all],
    successMessage: "Lecturer reactivated.",
  });
}

export function useResendLecturerPassword() {
  return useMutationWithToast({
    mutationFn: (id: number) => lecturerAccountsService.resendPassword(id),
    invalidates: [queryKeys.lecturers.all],
    successMessage: (detail) => detail,
  });
}
