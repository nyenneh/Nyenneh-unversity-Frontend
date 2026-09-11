import { BookMarked, Layers, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useEnrollments } from "@/hooks/useAcademics";
import { useCurrentUser } from "@/hooks/useAuth";
import { useStudentDashboard } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";

export default function StudentDashboardPage() {
  const user = useCurrentUser();
  const { data, isPending, isError, error, refetch } = useStudentDashboard();
  const registrations = useEnrollments();

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const firstName = user?.full_name.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={
          [user?.roll_number, data?.current_semester]
            .filter(Boolean)
            .join(" · ") || "Here is where things stand this session."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="CGPA"
          value={data?.cgpa ? data.cgpa.toFixed(2) : "—"}
          icon={Layers}
          loading={isPending}
          hint="From published results"
        />
        <StatCard
          label="Registered courses"
          value={data?.registered_courses ?? 0}
          icon={BookMarked}
          tone="ink"
          loading={isPending}
          hint="This semester"
        />
        <StatCard
          label="Credit units"
          value={data?.credit_units ?? 0}
          icon={Layers}
          tone="amber"
          loading={isPending}
          hint="Carried this semester"
        />
        <StatCard
          label="Fee balance"
          value={formatCurrency(data?.outstanding_balance)}
          icon={Wallet}
          tone={(data?.outstanding_balance ?? 0) > 0 ? "red" : "emerald"}
          loading={isPending}
          hint={(data?.outstanding_balance ?? 0) > 0 ? "Payment due" : "Fully paid"}
        />
      </div>

      <div className="mt-6 grid gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="My registrations"
              description="Courses you have submitted this session."
              action={
                <Link
                  to="/student/courses"
                  className="inline-flex h-8 items-center rounded-lg border border-ink-200 px-3 text-xs font-medium text-ink-700 transition hover:bg-ink-50"
                >
                  Register for a course
                </Link>
              }
            />
            <CardBody className="space-y-2">
              {registrations.isError ? (
                <ErrorState message={getErrorMessage(registrations.error)} />
              ) : (registrations.data ?? []).length === 0 ? (
                <EmptyState
                  title="No courses registered"
                  description="Pick your courses for the semester to build your schedule."
                  icon={<BookMarked className="size-5" />}
                />
              ) : (
                (registrations.data ?? []).map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-200 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900">
                        {enrollment.course_code}
                        <span className="ml-2 text-sm font-normal text-ink-500">
                          {enrollment.credit_units} units
                        </span>
                      </p>
                      <p className="truncate text-sm text-ink-500">{enrollment.course_title}</p>
                    </div>
                    <StatusBadge status={enrollment.status} />
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

      </div>
    </>
  );
}
