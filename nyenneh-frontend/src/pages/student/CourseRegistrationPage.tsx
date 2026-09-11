import { BookMarked, Check, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Field";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import {
  useCourses,
  useCurrentSemester,
  useDropEnrollment,
  useEnroll,
  useEnrollments,
} from "@/hooks/useAcademics";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/services/api";
import type { Enrollment } from "@/types";

const LEVELS = [100, 200, 300, 400, 500];

export default function CourseRegistrationPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<number | "">("");
  const [semester, setSemester] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const courses = useCourses({
    search: debouncedSearch || undefined,
    level: level || undefined,
    semester: semester || undefined,
  });
  const registrations = useEnrollments();
  // Registration is filed against the semester the registry has marked current;
  // without one there is nothing to register into.
  const currentSemester = useCurrentSemester();

  const enroll = useEnroll();
  const drop = useDropEnrollment();
  const [dropping, setDropping] = useState<Enrollment | null>(null);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  /** Course id -> the student's registration, so a card knows its own state. */
  const registeredByCourse = useMemo(() => {
    const map = new Map<number, Enrollment>();
    for (const enrollment of registrations.data ?? []) {
      map.set(enrollment.course, enrollment);
    }
    return map;
  }, [registrations.data]);

  // A request awaiting approval already counts against the semester load.
  const totalUnits = (registrations.data ?? [])
    .filter(
      (enrollment) =>
        enrollment.status === "registered" || enrollment.status === "pending",
    )
    .reduce((sum, enrollment) => sum + enrollment.credit_units, 0);

  const available = (courses.data ?? []).filter((course) => course.is_active);

  return (
    <>
      <PageHeader
        title="Course registration"
        description="Request this semester's courses. The registry approves each one before it reaches your schedule, and outstanding fees can block a request."
        actions={
          <div className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm">
            <span className="text-ink-500">Selected load</span>{" "}
            <span className="font-semibold text-ink-900">{totalUnits} units</span>
          </div>
        }
      />

      {!currentSemester.isPending && !currentSemester.data ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No semester is open for registration at the moment. You can browse the
          catalog, but nothing can be registered until the registry opens one.
        </div>
      ) : null}

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search the catalog"
              aria-label="Search courses"
              className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Select
            aria-label="Filter by level"
            value={level}
            onChange={(event) => setLevel(event.target.value ? Number(event.target.value) : "")}
          >
            <option value="">All levels</option>
            {LEVELS.map((value) => (
              <option key={value} value={value}>
                {value} level
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by semester"
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
          >
            <option value="">Both semesters</option>
            <option value="first">First semester</option>
            <option value="second">Second semester</option>
          </Select>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {courses.isError ? (
            <Card>
              <ErrorState
                message={getErrorMessage(courses.error)}
                onRetry={() => void courses.refetch()}
              />
            </Card>
          ) : courses.isPending ? (
            <Card>
              <LoadingState label="Loading the catalog…" />
            </Card>
          ) : available.length === 0 ? (
            <Card>
              <EmptyState
                title="No courses match"
                description="Try a different search, or check back when the registry opens more courses."
                icon={<BookMarked className="size-5" />}
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {available.map((course) => {
                const registration = registeredByCourse.get(course.id);
                const full = course.seats_left !== null && course.seats_left <= 0;

                return (
                  <Card key={course.id} className="flex flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">{course.code}</p>
                        <p className="text-sm text-ink-600">{course.title}</p>
                      </div>
                      <Badge tone="neutral">{course.credit_units} units</Badge>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm text-ink-500">
                      {course.description}
                    </p>

                    <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                      <div className="flex gap-1">
                        <dt>Level</dt>
                        <dd className="font-medium text-ink-700">{course.level}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Semester</dt>
                        <dd className="font-medium text-ink-700">
                          {course.semester === "first" ? "First" : "Second"}
                        </dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Seats</dt>
                        <dd
                          className={
                            full
                              ? "font-medium text-red-600"
                              : "font-medium text-emerald-700"
                          }
                        >
                          {course.seats_left === null
                            ? "No limit"
                            : full
                              ? "Full"
                              : `${course.seats_left} left`}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 border-t border-ink-100 pt-4">
                      {registration ? (
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={registration.status} />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            icon={<Trash2 className="size-3.5" />}
                            onClick={() => setDropping(registration)}
                          >
                            Drop
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={full || !currentSemester.data}
                          loading={enrollingId === course.id}
                          icon={<Check className="size-3.5" />}
                          onClick={() => {
                            if (!currentSemester.data) return;
                            setEnrollingId(course.id);
                            enroll.mutate(
                              { courseId: course.id, semesterId: currentSemester.data.id },
                              { onSettled: () => setEnrollingId(null) },
                            );
                          }}
                        >
                          {full ? "Course is full" : "Request course"}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader
            title="My selections"
            description={`${totalUnits} credit units this semester`}
          />
          <CardBody className="space-y-2">
            {(registrations.data ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-500">
                Nothing registered yet.
              </p>
            ) : (
              (registrations.data ?? []).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="rounded-lg border border-ink-200 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink-900">
                      {enrollment.course_code}
                    </p>
                    <StatusBadge status={enrollment.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {enrollment.course_title} · {enrollment.credit_units} units
                  </p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={dropping !== null}
        title={`Drop ${dropping?.course_code ?? ""}?`}
        message="The course leaves your semester load and its seat is released to other students. A course that already carries a result cannot be dropped."
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
