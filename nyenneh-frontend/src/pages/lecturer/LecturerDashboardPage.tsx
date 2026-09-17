import { BookOpen, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useLecturerDashboard } from "@/hooks/useLecturer";
import { getErrorMessage } from "@/services/api";

// green above 75, amber above 50, red below
function attendanceTone(rate: number) {
  if (rate >= 75) return "success" as const;
  if (rate >= 50) return "warning" as const;
  return "danger" as const;
}

export default function LecturerDashboardPage() {
  const { data, isPending, isError, error, refetch } = useLecturerDashboard();
  const courses = data?.courses ?? [];

  return (
    <>
      <PageHeader
        title="Teaching overview"
        description={
          data?.current_semester
            ? `Your allocated courses for ${data.current_semester}.`
            : "Your allocated courses."
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Courses allocated"
          value={data?.courses_allocated ?? 0}
          icon={BookOpen}
          loading={isPending}
        />
        <StatCard
          label="Students taught"
          value={data?.total_students ?? 0}
          icon={Users}
          tone="emerald"
          loading={isPending}
        />
        <StatCard
          label="Awaiting marks"
          value={courses.reduce((total, course) => total + course.ungraded_count, 0)}
          icon={GraduationCap}
          tone="amber"
          loading={isPending}
        />
        <StatCard
          label="Classes held"
          value={courses.reduce((total, course) => total + course.meetings_held, 0)}
          icon={ClipboardCheck}
          tone="ink"
          loading={isPending}
        />
      </div>

      <Card>
        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : courses.length === 0 && !isPending ? (
          <EmptyState
            title="No courses allocated"
            description="An administrator assigns your teaching load each semester. Once that is done, your courses appear here."
            icon={<BookOpen className="size-5" />}
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Course</Th>
                <Th align="center">Students</Th>
                <Th align="center">Marked</Th>
                <Th align="center">Quizzes</Th>
                <Th align="center">Classes</Th>
                <Th align="center">Attendance</Th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <Tr key={course.allocation}>
                  <Td>
                    <Link
                      to="/lecturer/courses"
                      className="font-medium text-ink-900 hover:text-brand-600"
                    >
                      {course.course_code}
                    </Link>
                    <p className="text-xs text-ink-500">{course.course_title}</p>
                  </Td>
                  <Td align="center" className="tabular-nums">
                    {course.student_count}
                    {course.pending_enrollments > 0 ? (
                      <span className="ml-1 text-xs text-amber-600">
                        +{course.pending_enrollments} pending
                      </span>
                    ) : null}
                  </Td>
                  <Td align="center" className="tabular-nums">
                    {course.graded_count}/{course.student_count}
                  </Td>
                  <Td align="center" className="tabular-nums">
                    {course.quiz_count}
                  </Td>
                  <Td align="center" className="tabular-nums">
                    {course.meetings_held}
                  </Td>
                  <Td align="center">
                    {course.meetings_held === 0 ? (
                      <span className="text-ink-400">—</span>
                    ) : (
                      <Badge tone={attendanceTone(course.attendance_rate)}>
                        {course.attendance_rate}%
                      </Badge>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
