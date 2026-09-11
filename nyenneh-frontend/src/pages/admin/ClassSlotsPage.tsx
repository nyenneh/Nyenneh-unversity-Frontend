import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, MapPin, Pencil, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import {
  useClassSlots,
  useCourses,
  useDeleteClassSlot,
  useLecturers,
  useSaveClassSlot,
} from "@/hooks/useAcademics";
import { formatTime, titleCase } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { ClassSlot, Semester, Weekday } from "@/types";

const DAYS: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const TERMS: { value: Semester; label: string }[] = [
  { value: "first", label: "First semester" },
  { value: "second", label: "Second semester" },
];

const schema = z
  .object({
    course: z.coerce.number().int().min(1, "Choose a course"),
    day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
    start_time: z.string().min(1, "Set a start time"),
    end_time: z.string().min(1, "Set an end time"),
    venue: z.string().min(1, "Where does it hold?"),
    lecturer: z.string(),
  })
  .refine((values) => values.end_time > values.start_time, {
    path: ["end_time"],
    message: "The end time must fall after the start time",
  });

type SlotForm = z.input<typeof schema>;

const blank: SlotForm = {
  course: 0,
  day: "monday",
  start_time: "10:00",
  end_time: "12:00",
  venue: "",
  lecturer: "",
};

export default function ClassSlotsPage() {
  const [term, setTerm] = useState<Semester>("first");

  const { data, isPending, isError, error, refetch } = useClassSlots({ semester: term });
  const courses = useCourses({ semester: term });
  const lecturers = useLecturers();

  const [editing, setEditing] = useState<ClassSlot | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ClassSlot | null>(null);

  const save = useSaveClassSlot(editing?.id);
  const remove = useDeleteClassSlot();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SlotForm>({ resolver: zodResolver(schema), defaultValues: blank });

  useEffect(() => {
    if (!formOpen) return;
    reset(
      editing
        ? {
            course: editing.course,
            day: editing.day,
            start_time: editing.start_time,
            end_time: editing.end_time,
            venue: editing.venue,
            lecturer: editing.lecturer === null ? "" : String(editing.lecturer),
          }
        : { ...blank, course: courses.data?.[0]?.id ?? 0 },
    );
  }, [formOpen, editing, reset, courses.data]);

  const onSubmit = handleSubmit((values) => {
    const parsed = schema.parse(values);
    save.mutate(
      { ...parsed, lecturer: parsed.lecturer ? Number(parsed.lecturer) : null },
      { onSuccess: () => setFormOpen(false) },
    );
  });

  const slots = data ?? [];
  const contactHours = slots.reduce((sum, slot) => sum + slot.duration_hours, 0);

  return (
    <>
      <PageHeader
        title="Class slots"
        description="The weekly timetable. A room or a lecturer cannot be booked twice at the same hour."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
              <span className="whitespace-nowrap font-medium text-ink-600">Semester</span>
              <select
                value={term}
                onChange={(event) => setTerm(event.target.value as Semester)}
                className="rounded-md border-0 bg-transparent py-0 pr-7 text-sm font-semibold text-ink-900 focus:ring-0"
              >
                {TERMS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              icon={<Plus className="size-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Schedule a class
            </Button>
          </div>
        }
      />

      {isError ? (
        <Card>
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        </Card>
      ) : isPending ? (
        <Card>
          <LoadingState label="Loading the timetable…" />
        </Card>
      ) : slots.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing scheduled"
            description="Schedule a class and it appears on this timetable and on every registered student's schedule."
            icon={<CalendarDays className="size-5" />}
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Schedule a class
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-500">
            {slots.length} class{slots.length === 1 ? "" : "es"} ·{" "}
            <span className="font-medium text-ink-700">{contactHours} contact hours</span> a week
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DAYS.map((day) => {
              const daySlots = slots
                .filter((slot) => slot.day === day)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));

              return (
                <Card key={day} className="flex flex-col">
                  <CardHeader
                    title={titleCase(day)}
                    description={`${daySlots.length} class${daySlots.length === 1 ? "" : "es"}`}
                  />
                  <div className="flex-1 space-y-2 p-3">
                    {daySlots.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-ink-400">Free day</p>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="group rounded-lg border-l-4 border-brand-500 bg-ink-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink-900">
                                {slot.course_code}
                              </p>
                              <p className="truncate text-xs text-ink-600">
                                {slot.course_title}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit ${slot.course_code} on ${titleCase(day)}`}
                                onClick={() => {
                                  setEditing(slot);
                                  setFormOpen(true);
                                }}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Remove ${slot.course_code} on ${titleCase(day)}`}
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => setPendingDelete(slot)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          <p className="mt-2 text-xs font-medium text-brand-700">
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {slot.venue}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="size-3" />
                              {slot.lecturer_name || "Unassigned"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.course_code}` : "Schedule a class"}
        description="The server refuses a booking that clashes with the room or the lecturer."
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={save.isPending}>
              {editing ? "Save changes" : "Schedule class"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <Select label="Course" error={errors.course?.message} {...register("course")}>
            <option value={0} disabled>
              Choose a course
            </option>
            {(courses.data ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Day" error={errors.day?.message} {...register("day")}>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {titleCase(day)}
                </option>
              ))}
            </Select>
            <Input
              label="Starts"
              type="time"
              error={errors.start_time?.message}
              {...register("start_time")}
            />
            <Input
              label="Ends"
              type="time"
              error={errors.end_time?.message}
              {...register("end_time")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Venue"
              placeholder="LT 1"
              error={errors.venue?.message}
              {...register("venue")}
            />
            <Select
              label="Lecturer"
              hint="Optional"
              error={errors.lecturer?.message}
              {...register("lecturer")}
            >
              <option value="">Not assigned</option>
              {(lecturers.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.full_name}
                </option>
              ))}
            </Select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Remove ${pendingDelete?.course_code ?? ""} from ${
          pendingDelete ? titleCase(pendingDelete.day) : ""
        }?`}
        message="The class leaves the timetable and every registered student's schedule."
        confirmLabel="Remove class"
        loading={remove.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
      />
    </>
  );
}
