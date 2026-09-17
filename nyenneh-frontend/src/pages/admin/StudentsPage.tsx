import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar } from "@/components/shared/Avatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useProgrammes, useSessions } from "@/hooks/useAcademics";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useDeleteStudent,
  useSaveStudent,
  useStudent,
  useStudents,
} from "@/hooks/useStudents";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Student, StudentStatus } from "@/types";

const LEVELS = [100, 200, 300, 400, 500];
const STATUSES: StudentStatus[] = [
  "active",
  "graduated",
  "deferred",
  "suspended",
  "withdrawn",
];

// upper bound for the date of birth picker
const TODAY = new Date().toISOString().slice(0, 10);

// Admitting a student makes a login account and an academic record at the same
// time, which is why the names are collected separately - the account wants
// them apart. No department or field of study here, the programme carries both.
const schema = z.object({
  first_name: z.string().min(2, "Enter the first name"),
  last_name: z.string().min(2, "Enter the last name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string(),
  date_of_birth: z
    .string()
    // always a typo, and the registry rejects it anyway
    .refine((value) => value === "" || value <= new Date().toISOString().slice(0, 10), {
      message: "The date of birth cannot be in the future",
    }),
  gender: z.enum(["", "M", "F", "O"]),
  address: z.string(),
  guardian_name: z.string(),
  guardian_phone: z.string(),
  roll_number: z.string(),
  level: z.coerce.number().int(),
  programme: z.coerce.number().int().min(1, "Choose a programme"),
  entry_session: z.coerce.number().int().min(1, "Choose an entry session"),
  status: z.enum(["active", "graduated", "deferred", "suspended", "withdrawn"]),
});

type StudentForm = z.input<typeof schema>;

const blank: StudentForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address: "",
  guardian_name: "",
  guardian_phone: "",
  roll_number: "",
  level: 100,
  programme: 0,
  entry_session: 0,
  status: "active",
};

// "Ama Serwaa Boateng" -> ["Ama", "Serwaa Boateng"], for the edit form
function splitName(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return [fullName, ""];
  return [parts[0], parts.slice(1).join(" ")];
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [programme, setProgramme] = useState<number | "">("");
  const [level, setLevel] = useState<number | "">("");
  const [status, setStatus] = useState<StudentStatus | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const programmes = useProgrammes();
  const sessions = useSessions();
  const { data, isPending, isError, error, refetch, isFetching } = useStudents({
    search: debouncedSearch || undefined,
    programme: programme || undefined,
    level: level || undefined,
    status: status || undefined,
  });

  const [editing, setEditing] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  const save = useSaveStudent(editing?.id);
  const remove = useDeleteStudent();
  // the roster row is trimmed, the form needs the whole record
  const editingDetail = useStudent(editing?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentForm>({ resolver: zodResolver(schema), defaultValues: blank });

  useEffect(() => {
    if (!formOpen) return;
    const detail = editingDetail.data;
    if (editing) {
      // wait for the full record - seeding with blanks means writing those
      // blanks straight back on save
      if (!detail || detail.id !== editing.id) return;
      const [firstName, lastName] = splitName(detail.full_name);
      reset({
        first_name: firstName,
        last_name: lastName,
        email: detail.email,
        phone: detail.phone ?? "",
        date_of_birth: detail.date_of_birth ?? "",
        gender: detail.gender,
        address: detail.address ?? "",
        guardian_name: detail.guardian_name ?? "",
        guardian_phone: detail.guardian_phone ?? "",
        roll_number: detail.roll_number,
        level: detail.level,
        programme: detail.programme,
        entry_session: detail.entry_session,
        status: detail.status,
      });
      return;
    }
    reset({
      ...blank,
      programme: programmes.data?.[0]?.id ?? 0,
      entry_session:
        sessions.data?.find((session) => session.is_current)?.id ??
        sessions.data?.[0]?.id ??
        0,
    });
  }, [formOpen, editing, editingDetail.data, reset, programmes.data, sessions.data]);

  const onSubmit = handleSubmit((values) => {
    const parsed = schema.parse(values);
    save.mutate(
      {
        ...parsed,
        // optional text they never touched should go up as null, not ""
        phone: parsed.phone || null,
        address: parsed.address || null,
        guardian_name: parsed.guardian_name || null,
        guardian_phone: parsed.guardian_phone || null,
        date_of_birth: parsed.date_of_birth || null,
      },
      { onSuccess: () => setFormOpen(false) },
    );
  });

  const students = data ?? [];
  const hasFilters = Boolean(debouncedSearch || programme || level || status);

  return (
    <>
      <PageHeader
        title="Student roster"
        description="Everyone admitted to the university, across all programmes."
        actions={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Enrol student
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, roll number or email"
              aria-label="Search students"
              className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <Select
            aria-label="Filter by programme"
            value={programme}
            onChange={(event) =>
              setProgramme(event.target.value ? Number(event.target.value) : "")
            }
          >
            <option value="">All programmes</option>
            {(programmes.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>

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
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value as StudentStatus | "")}
          >
            <option value="">Any status</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className={cn(isFetching && !isPending && "opacity-70 transition-opacity")}>
        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Student</Th>
                <Th>Roll number</Th>
                <Th>Programme</Th>
                <Th align="center">Level</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            {isPending ? (
              <TableSkeleton cols={6} />
            ) : (
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <Td colSpan={6}>
                      <EmptyState
                        title={hasFilters ? "No matching students" : "No students yet"}
                        description={
                          hasFilters
                            ? "Try a different search or clear the filters."
                            : "Enrol the first student to start the roster."
                        }
                        icon={<Users className="size-5" />}
                        action={
                          hasFilters ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSearch("");
                                setProgramme("");
                                setLevel("");
                                setStatus("");
                              }}
                            >
                              Clear filters
                            </Button>
                          ) : null
                        }
                      />
                    </Td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <Tr key={student.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={student.full_name} className="size-8" />
                          <div className="min-w-0">
                            <p className="font-medium text-ink-900">{student.full_name}</p>
                            <p className="truncate text-xs text-ink-500">{student.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="font-mono text-xs">{student.roll_number}</Td>
                      <Td>
                        <p className="text-ink-800">{student.programme_name}</p>
                        <p className="text-xs text-ink-500">{student.department_name}</p>
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {student.level}
                      </Td>
                      <Td>
                        <StatusBadge status={student.status} />
                      </Td>
                      <Td align="right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${student.full_name}`}
                            onClick={() => {
                              setEditing(student);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${student.full_name}`}
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setPendingDelete(student)}
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
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.full_name}` : "Enrol a student"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              loading={save.isPending}
              disabled={Boolean(editing) && editingDetail.isPending}
            >
              {editing ? "Save changes" : "Enrol student"}
            </Button>
          </>
        }
      >
        <form className="space-y-6" onSubmit={onSubmit}>
          <fieldset className="space-y-4">
            <legend className="mb-3 w-full border-b border-ink-200 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Personal information
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                placeholder="Tom"
                autoComplete="given-name"
                error={errors.first_name?.message}
                {...register("first_name")}
              />
              <Input
                label="Last name"
                placeholder="Nyenneh"
                autoComplete="family-name"
                error={errors.last_name?.message}
                {...register("last_name")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                placeholder="student@nyenneh.edu"
                autoComplete="email"
                hint={
                  editing
                    ? undefined
                    : "A temporary password is emailed here on admission"
                }
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Phone"
                placeholder="+231 77 123 4567"
                hint="Optional"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date of birth"
                type="date"
                max={TODAY}
                hint="Optional"
                error={errors.date_of_birth?.message}
                {...register("date_of_birth")}
              />
              <Select label="Gender" error={errors.gender?.message} {...register("gender")}>
                <option value="">Not stated</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Guardian's name"
                placeholder="Samuel Nyenneh"
                hint="Optional"
                error={errors.guardian_name?.message}
                {...register("guardian_name")}
              />
              <Input
                label="Guardian's phone"
                placeholder="+231 77 765 4321"
                hint="Optional"
                error={errors.guardian_phone?.message}
                {...register("guardian_phone")}
              />
            </div>

            <Textarea
              label="Home address"
              placeholder="14 Tubman Boulevard, Sinkor, Monrovia"
              hint="Optional"
              className="min-h-20"
              error={errors.address?.message}
              {...register("address")}
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-3 w-full border-b border-ink-200 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Academic information
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Roll number"
                placeholder="NYU/CSC/22/0431"
                hint={
                  editing
                    ? "Reassigning this changes the number the student signs their work with"
                    : "Leave blank to allocate the next one automatically"
                }
                error={errors.roll_number?.message}
                {...register("roll_number")}
              />
              <Select
                label="Programme"
                error={errors.programme?.message}
                {...register("programme")}
              >
                <option value={0} disabled>
                  Choose a programme
                </option>
                {(programmes.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.department_name})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Entry session"
                hint="The year of admission; the roll number is built from it"
                error={errors.entry_session?.message}
                {...register("entry_session")}
              >
                <option value={0} disabled>
                  Choose a session
                </option>
                {(sessions.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.is_current ? " (current)" : ""}
                  </option>
                ))}
              </Select>
              <Select label="Level" error={errors.level?.message} {...register("level")}>
                {LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value} level
                  </option>
                ))}
              </Select>
            </div>

            <Select label="Status" error={errors.status?.message} {...register("status")}>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </option>
              ))}
            </Select>
          </fieldset>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Remove ${pendingDelete?.full_name ?? ""}?`}
        message="They are marked withdrawn and their account is deactivated. Registrations, results and invoices are kept."
        confirmLabel="Remove student"
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
