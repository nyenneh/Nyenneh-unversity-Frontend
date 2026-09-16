import { BookOpen, ClipboardCheck, FileQuestion, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useAllocations } from "@/hooks/useLecturer";
import { getErrorMessage } from "@/services/api";

export default function MyCoursesPage() {
  // The server scopes this to the signed-in lecturer, so no filter is needed.
  const { data, isPending, isError, error, refetch } = useAllocations({ is_active: true });
  const allocations = data ?? [];

  return (
    <>
      <PageHeader
        title="My courses"
        description="Courses allocated to you, and how many students are registered on each."
      />

      {isError ? (
        <Card>
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        </Card>
      ) : isPending ? (
        <Card>
          <LoadingState label="Loading your teaching load…" />
        </Card>
      ) : allocations.length === 0 ? (
        <Card>
          <EmptyState
            title="No courses allocated"
            description="An administrator assigns your courses each semester."
            icon={<BookOpen className="size-5" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allocations.map((allocation) => (
            <Card key={allocation.id} className="flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{allocation.course_code}</p>
                  <p className="truncate text-sm text-ink-500">
                    {allocation.course_title}
                  </p>
                </div>
                <Badge tone="info">{allocation.semester_name}</Badge>
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm text-ink-600">
                <Users className="size-4 text-ink-400" />
                <span className="font-medium tabular-nums text-ink-900">
                  {allocation.student_count}
                </span>
                <span>{allocation.student_count === 1 ? "student" : "students"}</span>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  to="/lecturer/attendance"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  <ClipboardCheck className="size-3.5" />
                  Attendance
                </Link>
                <Link
                  to="/lecturer/quizzes"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  <FileQuestion className="size-3.5" />
                  Quizzes
                </Link>
                <Link
                  to="/lecturer/marks"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  <GraduationCap className="size-3.5" />
                  Marks
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
