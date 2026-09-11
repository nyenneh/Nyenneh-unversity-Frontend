import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import {
  useCourses,
  useCreateCourseWithSchedule,
  useDeleteCourse,
  useDepartments,
  useLecturers,
  useSaveCourse,
} from "@/hooks/useAcademics";
import { cn, formatTime, titleCase } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Course, Semester, Weekday } from "@/types";

const LEVELS = [100, 200, 300, 400, 500];

const TERMS: { value: Semester; label: string }[] = [
  { value: "first", label: "First semester" },
  { value: "second", label: "Second semester" },
];

const TEACHING_DAYS: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];

/** The lecture blocks the timetable is built from. */
const TIME_SLOTS = [
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "12:00", end: "14:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
].map((slot) => ({
  ...slot,
  value: `${slot.start}-${slot.end}`,
  label: `${formatTime(slot.start)} - ${formatTime(slot.end)}`,
}));

/** Blank means no seat limit, which is why capacity is a string here. */
const capacityField = z
  .string()
  .refine((value) => value === "" || Number(value) >= 1, "At least 1 seat");

const registrySchema = z.object({
  department: z.coerce.number().int().min(1, "Choose a department"),
  code_number: z
    .string()
    .min(1, "Course number")
    .regex(/^\d{1,4}$/, "Digits only, e.g. 204"),
  title: z.string().min(3, "Enter the course title"),
  description: z.string(),
  credit_units: z.coerce.number().int().min(1, "At least 1").max(9, "At most 9"),
  capacity: capacityField,
  level: z.coerce.number().int(),
  days: z.array(z.string()),
  time_slot: z.string().min(1, "Choose a time slot"),
  venue: z.string(),
  lecturer: z.string(),
});

type RegistryForm = z.input<typeof registrySchema>;

const blankRegistry: RegistryForm = {
  department: 0,
  code_number: "",
  title: "",
  description: "",
  credit_units: 3,
  capacity: "",
  level: 100,
  days: [],
  time_slot: TIME_SLOTS[1].value,
  venue: "",
  lecturer: "",
};

const editSchema = z.object({
  code: z.string().min(3, "Enter the course code"),
  title: z.string().min(3, "Enter the course title"),
  description: z.string(),
  credit_units: z.coerce.number().int().min(1).max(9),
  capacity: capacityField,
  level: z.coerce.number().int(),
  semester: z.enum(["first", "second"]),
  department: z.coerce.number().int().min(1, "Choose a department"),
  is_active: z.boolean(),
});

type EditForm = z.input<typeof editSchema>;

/** "" from the form means "no limit", which the API stores as null. */
const toCapacity = (value: string) => (value.trim() === "" ? null : Number(value));

/**
 * Seat usage, shown as "14 / 35" with a FULL flag once capacity is reached.
 * A course with no limit shows the headcount alone.
 */
function SeatTracker({ enrolled, capacity }: { enrolled: number; capacity: number | null }) {
  if (capacity === null) {
    return (
      <div className="min-w-32">
        <span className="text-sm font-semibold tabular-nums text-ink-800">{enrolled}</span>
        <span className="ml-1.5 text-xs text-ink-500">no limit</span>
      </div>
    );
  }

  const percent = capacity ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;
  const full = enrolled >= capacity;
  const nearlyFull = !full && percent >= 85;

  return (
    <div className="min-w-32">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            full ? "text-red-700" : nearlyFull ? "text-amber-700" : "text-ink-800",
          )}
        >
          {enrolled} / {capacity}
        </span>
        {full ? <Badge tone="danger">FULL</Badge> : null}
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn(
            "h-full rounded-full",
            full ? "bg-red-500" : nearlyFull ? "bg-amber-500" : "bg-emerald-500",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [term, setTerm] = useState<Semester>("first");
  const [filterDepartment, setFilterDepartment] = useState<number | "">("");

  const departments = useDepartments();
  const lecturers = useLecturers();
  const { data, isPending, isError, error, refetch, isFetching } = useCourses({
    semester: term,
    department: filterDepartment || undefined,
  });

  const createCourse = useCreateCourseWithSchedule();
  const removeCourse = useDeleteCourse();

  const [editing, setEditing] = useState<Course | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null);
  const saveEdit = useSaveCourse(editing?.id);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RegistryForm>({
    resolver: zodResolver(registrySchema),
    defaultValues: blankRegistry,
  });

  // The code prefix mirrors whichever department is selected: ITE-[204].
  // useWatch subscribes to the one field and returns a value, so the component
  // stays memoizable (a bare watch() would opt it out of the React Compiler).
  const selectedDepartmentId = Number(useWatch({ control, name: "department" }));
  const codePrefix =
    departments.data?.find((item) => item.id === selectedDepartmentId)?.code ?? "—";

  // Preselect the first department once the list arrives.
  useEffect(() => {
    if (!departments.data?.length) return;
    reset((current) =>
      current.department ? current : { ...current, department: departments.data[0].id },
    );
  }, [departments.data, reset]);

  const onRegister = handleSubmit((values) => {
    const parsed = registrySchema.parse(values);
    const department = departments.data?.find((item) => item.id === parsed.department);
    const slot = TIME_SLOTS.find((item) => item.value === parsed.time_slot)!;

    createCourse.mutate(
      {
        course: {
          // The registry writes codes as "CSC 204": the department's code,
          // then the number the admin typed.
          code: `${department?.code ?? ""} ${parsed.code_number}`.trim(),
          title: parsed.title,
          description: parsed.description,
          credit_units: parsed.credit_units,
          level: parsed.level,
          semester: term,
          department: parsed.department,
          capacity: toCapacity(parsed.capacity),
          is_active: true,
        },
        days: parsed.days as Weekday[],
        start_time: slot.start,
        end_time: slot.end,
        venue: parsed.venue,
        lecturer: parsed.lecturer ? Number(parsed.lecturer) : null,
      },
      { onSuccess: () => reset({ ...blankRegistry, department: parsed.department }) },
    );
  });

  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  useEffect(() => {
    if (!editing) return;
    editForm.reset({
      code: editing.code,
      title: editing.title,
      description: editing.description,
      credit_units: editing.credit_units,
      capacity: editing.capacity === null ? "" : String(editing.capacity),
      level: editing.level,
      semester: editing.semester,
      department: editing.department,
      is_active: editing.is_active,
    });
  }, [editing, editForm]);

  const onSaveEdit = editForm.handleSubmit((values) => {
    const parsed = editSchema.parse(values);
    saveEdit.mutate(
      { ...parsed, capacity: toCapacity(parsed.capacity) },
      { onSuccess: () => setEditing(null) },
    );
  });

  const courses = data ?? [];

  return (
    <>
      <PageHeader
        title="Course registry &amp; capacity"
        description="The courses the university offers, and how their seats are filling up."
        actions={
          <label className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
            <span className="whitespace-nowrap font-medium text-ink-600">Active semester</span>
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
        }
      />

      {/* ---- Add to registry -------------------------------------------- */}
      <Card className="mb-6">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Plus className="size-4 text-brand-600" />
              Add new course to university registry
            </span>
          }
          description={`Saved into the ${TERMS.find((item) => item.value === term)?.label}.`}
        />

        <form className="space-y-4 p-5" onSubmit={onRegister}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Select
              label="Department"
              error={errors.department?.message}
              {...register("department")}
            >
              <option value={0} disabled>
                Choose a department
              </option>
              {(departments.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </Select>

            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <div className="space-y-1.5">
                <label
                  htmlFor="code-number"
                  className="block text-sm font-medium text-ink-700"
                >
                  Course code
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-600">
                    {codePrefix}
                  </span>
                  <input
                    id="code-number"
                    inputMode="numeric"
                    placeholder="204"
                    aria-invalid={Boolean(errors.code_number)}
                    className={cn(
                      "w-full rounded-r-lg border border-ink-200 px-3 py-2 text-sm tabular-nums",
                      "focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
                      errors.code_number && "border-red-400",
                    )}
                    {...register("code_number")}
                  />
                </div>
                {errors.code_number ? (
                  <p className="text-xs text-red-600">{errors.code_number.message}</p>
                ) : null}
              </div>

              <Input
                label="Title"
                placeholder="Data Structures"
                error={errors.title?.message}
                {...register("title")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Credits"
              type="number"
              min={1}
              max={9}
              error={errors.credit_units?.message}
              {...register("credit_units")}
            />
            <Input
              label="Max seats"
              type="number"
              min={1}
              placeholder="No limit"
              hint="Leave blank for no limit"
              error={errors.capacity?.message}
              {...register("capacity")}
            />
            <Select label="Level" error={errors.level?.message} {...register("level")}>
              {LEVELS.map((value) => (
                <option key={value} value={value}>
                  {value} level
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Description"
            placeholder="What the course covers"
            hint="Optional"
            className="min-h-20"
            error={errors.description?.message}
            {...register("description")}
          />

          <fieldset className="border-t border-ink-100 pt-4">
            <legend className="mb-2 text-sm font-medium text-ink-700">
              Class times{" "}
              <span className="font-normal text-ink-500">
                — optional, and editable later on the Class Slots page
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {TEACHING_DAYS.map((day) => (
                <label
                  key={day}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:text-brand-800"
                >
                  <input
                    type="checkbox"
                    value={day}
                    className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
                    {...register("days")}
                  />
                  {titleCase(day).slice(0, 3)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Time slot"
              error={errors.time_slot?.message}
              {...register("time_slot")}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </Select>
            <Input
              label="Venue"
              placeholder="LT 1"
              error={errors.venue?.message}
              {...register("venue")}
            />
            <Select
              label="Lecturer"
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

          {createCourse.data?.clashes.length ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">
                {createCourse.data.course.code} was saved, but some classes could not be
                scheduled:
              </p>
              <ul className="mt-1 list-inside list-disc">
                {createCourse.data.clashes.map((clash) => (
                  <li key={clash}>{clash}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex justify-end border-t border-ink-100 pt-4">
            <Button
              type="submit"
              icon={<Plus className="size-4" />}
              loading={createCourse.isPending}
            >
              Save to Catalog
            </Button>
          </div>
        </form>
      </Card>

      {/* ---- Live inventory --------------------------------------------- */}
      <Card className={cn(isFetching && !isPending && "opacity-70 transition-opacity")}>
        <CardHeader
          title="Course inventory &amp; seat tracker"
          description={`${courses.length} course${courses.length === 1 ? "" : "s"} in ${
            TERMS.find((item) => item.value === term)?.label
          }`}
          action={
            <label className="flex items-center gap-2 text-sm">
              <span className="whitespace-nowrap text-ink-600">Filter by department</span>
              <select
                value={filterDepartment}
                onChange={(event) =>
                  setFilterDepartment(event.target.value ? Number(event.target.value) : "")
                }
                className="rounded-lg border border-ink-200 py-1.5 pl-3 pr-8 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">All departments</option>
                {(departments.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          }
        />

        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Course title</Th>
                <Th>Seats</Th>
                <Th align="center">Credits</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            {isPending ? (
              <TableSkeleton cols={6} />
            ) : (
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <Td colSpan={6}>
                      <EmptyState
                        title="Nothing in the registry yet"
                        description="Add a course above and it appears here straight away."
                        icon={<BookOpen className="size-5" />}
                      />
                    </Td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <Tr key={course.id}>
                      <Td className="font-semibold text-ink-900">{course.code}</Td>
                      <Td>
                        <p className="text-ink-800">{course.title}</p>
                        <p className="text-xs text-ink-500">
                          {course.department_name} · {course.level} level
                        </p>
                      </Td>
                      <Td>
                        <SeatTracker
                          enrolled={course.enrolled_count}
                          capacity={course.capacity}
                        />
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {course.credit_units}
                      </Td>
                      <Td>
                        <Badge tone={course.is_active ? "success" : "neutral"}>
                          {course.is_active ? "Open" : "Closed"}
                        </Badge>
                      </Td>
                      <Td align="right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${course.code}`}
                            onClick={() => setEditing(course)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${course.code}`}
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setPendingDelete(course)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            )}
          </TableWrap>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.code}` : ""}
        description="Catalog details. Class times live on the Class Slots page."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={onSaveEdit} loading={saveEdit.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={onSaveEdit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Course code"
              error={editForm.formState.errors.code?.message}
              {...editForm.register("code")}
            />
            <Input
              label="Title"
              wrapperClassName="sm:col-span-2"
              error={editForm.formState.errors.title?.message}
              {...editForm.register("title")}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="What the course covers"
            error={editForm.formState.errors.description?.message}
            {...editForm.register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Department"
              error={editForm.formState.errors.department?.message}
              {...editForm.register("department")}
            >
              {(departments.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select
              label="Level"
              error={editForm.formState.errors.level?.message}
              {...editForm.register("level")}
            >
              {LEVELS.map((value) => (
                <option key={value} value={value}>
                  {value} level
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Semester"
              error={editForm.formState.errors.semester?.message}
              {...editForm.register("semester")}
            >
              <option value="first">First</option>
              <option value="second">Second</option>
            </Select>
            <Input
              label="Credits"
              type="number"
              min={1}
              max={9}
              error={editForm.formState.errors.credit_units?.message}
              {...editForm.register("credit_units")}
            />
            <Input
              label="Max seats"
              type="number"
              min={1}
              placeholder="No limit"
              hint="Blank for no limit"
              error={editForm.formState.errors.capacity?.message}
              {...editForm.register("capacity")}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input
              type="checkbox"
              className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
              {...editForm.register("is_active")}
            />
            Open for registration this semester
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.code ?? ""}?`}
        message="A course that students have already registered for cannot be deleted; close it for registration instead."
        loading={removeCourse.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeCourse.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
      />
    </>
  );
}
