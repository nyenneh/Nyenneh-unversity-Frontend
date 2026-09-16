import { CalendarPlus, ClipboardCheck, Save } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import {
  useAllocations,
  useAttendanceSummary,
  useCreateMeeting,
  useMeetings,
  useRegister,
  useTakeRegister,
} from "@/hooks/useLecturer";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { AttendanceStatus } from "@/types";

const STATUSES: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "present", label: "Present", tone: "bg-emerald-600 text-white" },
  { value: "late", label: "Late", tone: "bg-amber-500 text-white" },
  { value: "absent", label: "Absent", tone: "bg-red-600 text-white" },
  { value: "excused", label: "Excused", tone: "bg-ink-500 text-white" },
];

const today = () => new Date().toISOString().slice(0, 10);

function attendanceTone(rate: number) {
  if (rate >= 75) return "success" as const;
  if (rate >= 50) return "warning" as const;
  return "danger" as const;
}

export default function AttendancePage() {
  const allocations = useAllocations({ is_active: true });
  const [allocationId, setAllocationId] = useState<number | "">("");

  const allocation = (allocations.data ?? []).find((row) => row.id === allocationId);
  const courseId = allocation?.course ?? null;
  const semesterId = allocation?.semester;

  const meetings = useMeetings(
    courseId ? { course: courseId, semester: semesterId } : {},
  );
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const register = useRegister(meetingId);
  const summary = useAttendanceSummary(courseId, semesterId);

  const createMeeting = useCreateMeeting();
  const takeRegister = useTakeRegister();

  const [creating, setCreating] = useState(false);
  const [heldOn, setHeldOn] = useState(today());
  const [topic, setTopic] = useState("");

  // Marks being edited, keyed by enrollment. Seeded from whatever the server
  // already holds so an untouched row re-submits unchanged.
  const [marks, setMarks] = useState<Record<number, AttendanceStatus>>({});
  const rows = useMemo(() => register.data?.rows ?? [], [register.data]);

  const [seededFrom, setSeededFrom] = useState<typeof rows | null>(null);
  if (seededFrom !== rows) {
    setSeededFrom(rows);
    setMarks(
      Object.fromEntries(
        rows.map((row) => [row.enrollment.id, row.record?.status ?? "present"]),
      ),
    );
  }

  const submitRegister = () => {
    if (meetingId === null) return;
    takeRegister.mutate({
      meeting: meetingId,
      entries: rows.map((row) => ({
        enrollment: row.enrollment.id,
        status: marks[row.enrollment.id] ?? "present",
      })),
    });
  };

  const markAll = (status: AttendanceStatus) =>
    setMarks(Object.fromEntries(rows.map((row) => [row.enrollment.id, status])));

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Record that a class met, then call the roll. Excused absences do not count against a student."
        actions={
          <Button
            icon={<CalendarPlus className="size-4" />}
            disabled={!courseId}
            onClick={() => setCreating(true)}
          >
            Record a class
          </Button>
        }
      />

      <Card className="mb-4 grid gap-4 p-4 sm:grid-cols-2">
        <Select
          label="Course"
          value={allocationId}
          onChange={(event) => {
            setAllocationId(event.target.value ? Number(event.target.value) : "");
            setMeetingId(null);
          }}
        >
          <option value="">Choose a course…</option>
          {(allocations.data ?? []).map((row) => (
            <option key={row.id} value={row.id}>
              {row.course_code} — {row.course_title} ({row.student_count})
            </option>
          ))}
        </Select>

        <Select
          label="Class"
          value={meetingId ?? ""}
          disabled={!courseId}
          onChange={(event) =>
            setMeetingId(event.target.value ? Number(event.target.value) : null)
          }
        >
          <option value="">Choose a class…</option>
          {(meetings.data ?? []).map((meeting) => (
            <option key={meeting.id} value={meeting.id}>
              {meeting.held_on}
              {meeting.topic ? ` — ${meeting.topic}` : ""} ({meeting.marked_count}/
              {meeting.expected} marked)
            </option>
          ))}
        </Select>
      </Card>

      {meetingId !== null ? (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-4">
            <p className="mr-auto text-sm text-ink-600">
              Mark everyone as:{" "}
              {STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => markAll(status.value)}
                  className="ml-1 rounded-md border border-ink-200 px-2 py-1 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {status.label}
                </button>
              ))}
            </p>
            <Button
              icon={<Save className="size-4" />}
              loading={takeRegister.isPending}
              disabled={rows.length === 0}
              onClick={submitRegister}
            >
              Save register
            </Button>
          </div>

          {register.isError ? (
            <ErrorState
              message={getErrorMessage(register.error)}
              onRetry={() => void register.refetch()}
            />
          ) : register.isPending ? (
            <LoadingState label="Loading the class list…" />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Nobody registered"
              description="No approved registrations on this course for this semester yet."
              icon={<ClipboardCheck className="size-5" />}
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th align="center">Attendance</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const current = marks[row.enrollment.id] ?? "present";
                  return (
                    <Tr key={row.enrollment.id}>
                      <Td>
                        <p className="font-medium text-ink-900">
                          {row.enrollment.student_name}
                        </p>
                        <p className="font-mono text-xs text-ink-500">
                          {row.enrollment.roll_number}
                        </p>
                      </Td>
                      <Td align="center">
                        <div
                          role="radiogroup"
                          aria-label={`Attendance for ${row.enrollment.student_name}`}
                          className="inline-flex overflow-hidden rounded-lg border border-ink-200"
                        >
                          {STATUSES.map((status) => (
                            <button
                              key={status.value}
                              type="button"
                              role="radio"
                              aria-checked={current === status.value}
                              onClick={() =>
                                setMarks((state) => ({
                                  ...state,
                                  [row.enrollment.id]: status.value,
                                }))
                              }
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium transition",
                                current === status.value
                                  ? status.tone
                                  : "bg-white text-ink-600 hover:bg-ink-50",
                              )}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </Card>
      ) : null}

      {courseId ? (
        <Card>
          <div className="flex items-center justify-between border-b border-ink-100 p-4">
            <p className="font-medium text-ink-900">Attendance so far</p>
            {summary.data ? (
              <p className="text-sm text-ink-500">
                {summary.data.meetings_held} class
                {summary.data.meetings_held === 1 ? "" : "es"} held · class average{" "}
                <span className="font-medium text-ink-900">
                  {summary.data.class_rate}%
                </span>
              </p>
            ) : null}
          </div>

          {summary.isPending ? (
            <LoadingState />
          ) : (summary.data?.rows ?? []).length === 0 ? (
            <EmptyState title="Nothing recorded yet" />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th align="center">Present</Th>
                  <Th align="center">Absent</Th>
                  <Th align="center">Excused</Th>
                  <Th align="center">Rate</Th>
                </tr>
              </thead>
              <tbody>
                {(summary.data?.rows ?? []).map((row) => (
                  <Tr key={row.enrollment.id}>
                    <Td>
                      <p className="font-medium text-ink-900">
                        {row.enrollment.student_name}
                      </p>
                      <p className="font-mono text-xs text-ink-500">
                        {row.enrollment.roll_number}
                      </p>
                    </Td>
                    <Td align="center" className="tabular-nums">
                      {row.present}
                    </Td>
                    <Td align="center" className="tabular-nums">
                      {row.absent}
                    </Td>
                    <Td align="center" className="tabular-nums">
                      {row.excused}
                    </Td>
                    <Td align="center">
                      {row.counted === 0 ? (
                        <span className="text-ink-400">—</span>
                      ) : (
                        <Badge tone={attendanceTone(row.rate)}>{row.rate}%</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      ) : null}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Record a class"
        description="A class has to exist before its register can be taken."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!courseId || !semesterId) return;
            createMeeting.mutate(
              { course: courseId, semester: semesterId, held_on: heldOn, topic },
              {
                onSuccess: (meeting) => {
                  setCreating(false);
                  setTopic("");
                  setMeetingId(meeting.id);
                },
              },
            );
          }}
        >
          <Input
            label="Date"
            type="date"
            required
            value={heldOn}
            onChange={(event) => setHeldOn(event.target.value)}
          />
          <Input
            label="Topic"
            placeholder="Optional — what the class covered"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMeeting.isPending}>
              Record class
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
