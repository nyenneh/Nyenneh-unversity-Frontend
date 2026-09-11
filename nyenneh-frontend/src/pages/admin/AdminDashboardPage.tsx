import {
  BookOpen,
  Building2,
  ClipboardCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useEnrollments } from "@/hooks/useAcademics";
import { useAdminDashboard } from "@/hooks/useDashboard";
import { getErrorMessage } from "@/services/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data, isPending, isError, error, refetch } = useAdminDashboard();
  const pending = useEnrollments({ status: "pending" });

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const collected = data?.collected_fees ?? 0;
  const outstanding = data?.outstanding_fees ?? 0;
  const billed = collected + outstanding;
  const collectionRate = billed ? Math.round((collected / billed) * 100) : 0;

  const levels = data?.enrollment_by_level ?? [];
  const peak = Math.max(1, ...levels.map((entry) => entry.count));

  return (
    <>
      <PageHeader
        title="Control centre"
        description="Everything happening across the university this session."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students"
          value={data?.total_students ?? 0}
          icon={Users}
          loading={isPending}
          hint="On the roster"
        />
        <StatCard
          label="Courses"
          value={data?.total_courses ?? 0}
          icon={BookOpen}
          tone="ink"
          loading={isPending}
          hint={`Across ${data?.total_departments ?? 0} departments`}
        />
        <StatCard
          label="Pending registrations"
          value={data?.pending_enrollments ?? 0}
          icon={ClipboardCheck}
          tone="amber"
          loading={isPending}
          hint="Awaiting your approval"
        />
        <StatCard
          label="Outstanding fees"
          value={formatCurrency(outstanding)}
          icon={Wallet}
          tone={outstanding > 0 ? "red" : "emerald"}
          loading={isPending}
          hint={`${formatCurrency(collected)} collected`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Registrations awaiting approval"
            description="Approve a registration to open its gradebook entry."
            action={
              <Link
                to="/admin/registrations"
                className="inline-flex h-8 items-center rounded-lg border border-ink-200 px-3 text-xs font-medium text-ink-700 transition hover:bg-ink-50"
              >
                Review all
              </Link>
            }
          />
          {pending.isError ? (
            <ErrorState message={getErrorMessage(pending.error)} />
          ) : pending.data && pending.data.length === 0 ? (
            <EmptyState
              title="Nothing waiting"
              description="Every course registration has been reviewed."
              icon={<ClipboardCheck className="size-5" />}
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Requested</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {(pending.data ?? []).slice(0, 6).map((enrollment) => (
                  <Tr key={enrollment.id}>
                    <Td>
                      <p className="font-medium text-ink-900">{enrollment.student_name}</p>
                      <p className="text-xs text-ink-500">{enrollment.roll_number}</p>
                    </Td>
                    <Td>
                      <p className="font-medium text-ink-900">{enrollment.course_code}</p>
                      <p className="text-xs text-ink-500">{enrollment.course_title}</p>
                    </Td>
                    <Td>{formatDate(enrollment.created_at)}</Td>
                    <Td>
                      <StatusBadge status={enrollment.status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Fee collection" />
            <CardBody className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-ink-900">{collectionRate}%</span>
                  <span className="text-sm text-ink-500">of {formatCurrency(billed)}</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"
                  role="img"
                  aria-label={`${collectionRate} percent of billed fees collected`}
                >
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width]"
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <dt className="text-xs text-emerald-700">Collected</dt>
                  <dd className="mt-0.5 font-semibold text-emerald-800">
                    {formatCurrency(collected)}
                  </dd>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <dt className="text-xs text-red-700">Outstanding</dt>
                  <dd className="mt-0.5 font-semibold text-red-800">
                    {formatCurrency(outstanding)}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Students by level" />
            <CardBody>
              {levels.length === 0 ? (
                <p className="text-sm text-ink-500">No enrolment data yet.</p>
              ) : (
                <ul className="space-y-3">
                  {levels.map((entry) => (
                    <li key={entry.level} className="flex items-center gap-3">
                      <span className="w-14 shrink-0 text-sm font-medium text-ink-600">
                        {entry.level}L
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${(entry.count / peak) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm tabular-nums text-ink-700">
                        {entry.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Quick actions" />
            <CardBody className="grid gap-2">
              <Link
                to="/admin/courses"
                className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <BookOpen className="size-4 text-brand-600" />
                Add a course to the catalog
              </Link>
              <Link
                to="/admin/students"
                className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <Users className="size-4 text-brand-600" />
                Enrol a new student
              </Link>
              <Link
                to="/admin/departments"
                className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <Building2 className="size-4 text-brand-600" />
                Manage departments
              </Link>
              <Link
                to="/admin/grades"
                className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <TrendingUp className="size-4 text-brand-600" />
                Enter and publish results
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
