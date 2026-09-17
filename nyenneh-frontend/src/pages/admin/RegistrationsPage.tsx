import { Check, ClipboardCheck, Trash2, X } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import {
  useDropEnrollment,
  useEnrollments,
  useReviewEnrollment,
} from "@/hooks/useAcademics";
import { cn, formatDateTime } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Enrollment, EnrollmentStatus } from "@/types";

const TABS: { label: string; value: EnrollmentStatus | "" }[] = [
  { label: "Pending", value: "pending" },
  { label: "Registered", value: "registered" },
  { label: "Rejected", value: "rejected" },
  { label: "Dropped", value: "dropped" },
  { label: "All", value: "" },
];

export default function RegistrationsPage() {
  const [tab, setTab] = useState<EnrollmentStatus | "">("pending");
  const { data, isPending, isError, error, refetch } = useEnrollments({
    status: tab || undefined,
  });

  const review = useReviewEnrollment();
  const drop = useDropEnrollment();
  const [dropping, setDropping] = useState<Enrollment | null>(null);

  // which row is being acted on, so only that row spins
  const [actingOn, setActingOn] = useState<number | null>(null);

  const act = (id: number, action: "approve" | "reject") => {
    setActingOn(id);
    review.mutate({ id, action }, { onSettled: () => setActingOn(null) });
  };

  const enrollments = data ?? [];

  return (
    <>
      <PageHeader
        title="Course registrations"
        description="Requests wait here for a decision. Approving one counts it against the course's seats and opens its gradebook entry; rejecting releases the seat."
      />

      <div className="mb-4 inline-flex rounded-lg border border-ink-200 bg-white p-1">
        {TABS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              tab === item.value
                ? "bg-brand-500 text-navy-950 shadow-sm"
                : "text-ink-600 hover:bg-ink-100",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card>
        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Student</Th>
                <Th>Course</Th>
                <Th align="center">Units</Th>
                <Th>Submitted</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            {isPending ? (
              <TableSkeleton cols={6} />
            ) : (
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <Td colSpan={6}>
                      <EmptyState
                        title={tab === "pending" ? "Nothing to review" : "No registrations here"}
                        description={
                          tab === "pending"
                            ? "Every request has been dealt with."
                            : "Try another tab to see registrations in a different state."
                        }
                        icon={<ClipboardCheck className="size-5" />}
                      />
                    </Td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => (
                    <Tr key={enrollment.id}>
                      <Td>
                        <p className="font-medium text-ink-900">{enrollment.student_name}</p>
                        <p className="font-mono text-xs text-ink-500">
                          {enrollment.roll_number}
                        </p>
                      </Td>
                      <Td>
                        <p className="font-medium text-ink-900">
                          {enrollment.course_code}
                          {enrollment.is_carryover ? (
                            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-800">
                              Carryover
                            </span>
                          ) : null}
                        </p>
                        <p className="max-w-xs truncate text-xs text-ink-500">
                          {enrollment.course_title}
                        </p>
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {enrollment.credit_units}
                      </Td>
                      <Td className="text-xs">{formatDateTime(enrollment.created_at)}</Td>
                      <Td>
                        <StatusBadge status={enrollment.status} />
                        {enrollment.review_note ? (
                          <p className="mt-1 max-w-48 text-xs text-ink-500">
                            {enrollment.review_note}
                          </p>
                        ) : null}
                      </Td>
                      <Td align="right">
                        {enrollment.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<X className="size-3.5" />}
                              disabled={actingOn === enrollment.id}
                              onClick={() => act(enrollment.id, "reject")}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              icon={<Check className="size-3.5" />}
                              loading={actingOn === enrollment.id}
                              onClick={() => act(enrollment.id, "approve")}
                            >
                              Approve
                            </Button>
                          </div>
                        ) : enrollment.status === "registered" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            icon={<Trash2 className="size-3.5" />}
                            onClick={() => setDropping(enrollment)}
                          >
                            Drop
                          </Button>
                        ) : (
                          <span className="text-xs text-ink-400">
                            {enrollment.reviewed_by_name
                              ? `Reviewed by ${enrollment.reviewed_by_name}`
                              : "Closed"}
                          </span>
                        )}
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            )}
          </TableWrap>
        )}
      </Card>

      <ConfirmDialog
        open={dropping !== null}
        title={`Drop ${dropping?.course_code ?? ""}?`}
        message={`${dropping?.student_name ?? "The student"} loses this course from their semester load.`}
        confirmLabel="Drop course"
        loading={drop.isPending}
        onClose={() => setDropping(null)}
        onConfirm={() => {
          if (!dropping) return;
          drop.mutate(dropping.id, { onSuccess: () => setDropping(null) });
        }}
      />
    </>
  );
}
