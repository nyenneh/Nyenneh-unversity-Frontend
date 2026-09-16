import { Check, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useCourses, useCurrentSemester, useLecturers } from "@/hooks/useAcademics";
import { useAllocations, useAssignCourses, useRemoveAllocation } from "@/hooks/useLecturer";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";

export default function AllocationsPage() {
  const lecturers = useLecturers();
  const courses = useCourses();
  const semester = useCurrentSemester();

  const [lecturerId, setLecturerId] = useState<number | "">("");
  const semesterId = semester.data?.id;

  const allocations = useAllocations(
    lecturerId ? { lecturer: lecturerId, semester: semesterId } : {},
  );
  const assign = useAssignCourses();
  const removeAllocation = useRemoveAllocation();

  // Courses ticked for this lecturer, seeded from what they already hold so
  // re-submitting an unchanged load is a no-op rather than a duplicate.
  const held = useMemo(
    () => new Set((allocations.data ?? []).map((row) => row.course)),
    [allocations.data],
  );
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const [seededFrom, setSeededFrom] = useState<typeof held | null>(null);
  if (seededFrom !== held) {
    setSeededFrom(held);
    setPicked(new Set(held));
  }

  // Only courses taught in the current half of the year can be allocated to it;
  // the server enforces this too, but offering them would just invite a 400.
  const assignable = (courses.data ?? []).filter(
    (course) =>
      course.is_active &&
      (semester.data ? course.semester === (semester.data.number === 2 ? "second" : "first") : true),
  );

  const toggle = (courseId: number) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });

  const added = [...picked].filter((id) => !held.has(id));
  const dirty = added.length > 0;

  return (
    <>
      <PageHeader
        title="Course allocations"
        description="Assign a lecturer the courses they teach this semester. Re-submitting the same load changes nothing."
        actions={
          <Button
            icon={<Check className="size-4" />}
            loading={assign.isPending}
            disabled={!lecturerId || !semesterId || !dirty}
            onClick={() =>
              assign.mutate({
                lecturer: lecturerId as number,
                semester: semesterId as number,
                courses: [...picked],
              })
            }
          >
            Save {added.length > 0 ? `(${added.length} new)` : "allocation"}
          </Button>
        }
      />

      <Card className="mb-4 grid gap-4 p-4 sm:grid-cols-2">
        <Select
          label="Lecturer"
          value={lecturerId}
          onChange={(event) =>
            setLecturerId(event.target.value ? Number(event.target.value) : "")
          }
        >
          <option value="">Choose a lecturer…</option>
          {(lecturers.data ?? []).map((lecturer) => (
            <option key={lecturer.id} value={lecturer.id}>
              {lecturer.full_name} — {lecturer.email}
            </option>
          ))}
        </Select>
        <div className="flex items-end">
          <p className="text-sm text-ink-500">
            {semester.data
              ? `Allocating for ${semester.data.session_name}, semester ${semester.data.number}.`
              : "No semester is marked current — set one before allocating."}
          </p>
        </div>
      </Card>

      {!lecturerId ? (
        <Card>
          <EmptyState
            title="Pick a lecturer"
            description="Choose a lecturer to see and change the courses they teach."
            icon={<UserCheck className="size-5" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="border-b border-ink-100 p-4">
              <p className="font-medium text-ink-900">Courses this semester</p>
              <p className="text-sm text-ink-500">
                Tick what this lecturer teaches, then save.
              </p>
            </div>
            {courses.isPending ? (
              <LoadingState />
            ) : assignable.length === 0 ? (
              <EmptyState title="No courses are taught this semester" />
            ) : (
              <ul className="max-h-[28rem] divide-y divide-ink-100 overflow-y-auto">
                {assignable.map((course) => (
                  <li key={course.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-ink-50",
                        picked.has(course.id) && "bg-brand-50/50",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
                        checked={picked.has(course.id)}
                        onChange={() => toggle(course.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink-900">
                          {course.code}
                        </span>
                        <span className="block truncate text-xs text-ink-500">
                          {course.title} · {course.credit_units} units · L{course.level}
                        </span>
                      </span>
                      {held.has(course.id) ? (
                        <Badge tone="success">Allocated</Badge>
                      ) : picked.has(course.id) ? (
                        <Badge tone="info">New</Badge>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="border-b border-ink-100 p-4">
              <p className="font-medium text-ink-900">Current teaching load</p>
            </div>
            {allocations.isError ? (
              <ErrorState
                message={getErrorMessage(allocations.error)}
                onRetry={() => void allocations.refetch()}
              />
            ) : allocations.isPending ? (
              <LoadingState />
            ) : (allocations.data ?? []).length === 0 ? (
              <EmptyState
                title="Nothing allocated yet"
                description="Tick courses on the left and save."
              />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Course</Th>
                    <Th align="center">Students</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {(allocations.data ?? []).map((allocation) => (
                    <Tr key={allocation.id}>
                      <Td>
                        <p className="font-medium text-ink-900">
                          {allocation.course_code}
                        </p>
                        <p className="text-xs text-ink-500">{allocation.course_title}</p>
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {allocation.student_count}
                      </Td>
                      <Td align="right">
                        <Button
                          size="sm"
                          variant="outline"
                          loading={
                            removeAllocation.isPending &&
                            removeAllocation.variables === allocation.id
                          }
                          onClick={() => removeAllocation.mutate(allocation.id)}
                        >
                          Remove
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
