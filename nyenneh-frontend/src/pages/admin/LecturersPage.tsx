import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, KeyRound, Pencil, Plus, Search, Trash2, UserCheck, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar } from "@/components/shared/Avatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, LoadingState, TableSkeleton } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useCourses, useCurrentSemester } from "@/hooks/useAcademics";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAllocations } from "@/hooks/useLecturer";
import {
  useActivateLecturer,
  useDeactivateLecturer,
  useLecturerAccounts,
  useResendLecturerPassword,
  useSaveLecturer,
} from "@/hooks/useLecturerAccounts";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { LecturerAccount } from "@/types";

/** Mirrors User.Title on the backend. */
const TITLES = [
  { value: "", label: "None" },
  { value: "MR", label: "Mr" },
  { value: "MRS", label: "Mrs" },
  { value: "MS", label: "Ms" },
  { value: "DR", label: "Dr" },
  { value: "PROF", label: "Prof" },
];

/**
 * Adding a lecturer creates a portal account and their teaching load together,
 * the way admitting a student creates an account and an academic record.
 *
 * The name is one field, which the server splits — the account model keeps the
 * parts, but nobody types a name in three boxes. Email is separate from the name
 * because it is the sign-in address and where the temporary password is sent,
 * which is also why it cannot be changed afterwards.
 */
const schema = z.object({
  full_name: z
    .string()
    .trim()
    .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, {
      message: 'Enter a first and last name, e.g. "Ada Lovelace"',
    }),
  email: z.string().email("Enter a valid email address"),
  title: z.enum(["", "MR", "MRS", "MS", "DR", "PROF"]),
  phone_number: z.string(),
});

type LecturerForm = z.input<typeof schema>;

const blank: LecturerForm = {
  full_name: "",
  email: "",
  title: "",
  phone_number: "",
};

export default function LecturersPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<"" | "true" | "false">("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isError, error, refetch, isFetching } = useLecturerAccounts({
    search: debouncedSearch || undefined,
    is_active: active === "" ? undefined : active === "true",
  });

  const semester = useCurrentSemester();
  const courses = useCourses();
  // Every allocation for the semester, so each row can show what that lecturer
  // already teaches without a request per lecturer.
  const allocations = useAllocations(
    semester.data?.id ? { semester: semester.data.id } : {},
  );

  const loadByLecturer = useMemo(() => {
    const grouped = new Map<number, string[]>();
    for (const row of allocations.data ?? []) {
      if (!row.is_active) continue;
      grouped.set(row.lecturer, [...(grouped.get(row.lecturer) ?? []), row.course_code]);
    }
    for (const codes of grouped.values()) codes.sort();
    return grouped;
  }, [allocations.data]);

  const [editing, setEditing] = useState<LecturerAccount | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [pendingDeactivate, setPendingDeactivate] = useState<LecturerAccount | null>(null);
  const [pendingReset, setPendingReset] = useState<LecturerAccount | null>(null);

  const save = useSaveLecturer(editing?.id);
  const deactivate = useDeactivateLecturer();
  const activate = useActivateLecturer();
  const resendPassword = useResendLecturerPassword();

  // Only courses taught in the current half of the year can be allocated to it.
  // The server enforces this too; offering the rest would just invite a 400.
  const assignable = (courses.data ?? []).filter(
    (course) =>
      course.is_active &&
      (semester.data
        ? course.semester === (semester.data.number === 2 ? "second" : "first")
        : true),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LecturerForm>({ resolver: zodResolver(schema), defaultValues: blank });

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      reset({
        full_name: editing.full_name,
        email: editing.email,
        title: (editing.title || "") as LecturerForm["title"],
        phone_number: editing.phone_number,
      });
      return;
    }
    reset(blank);
  }, [formOpen, editing, reset]);

  /** Opens the form on a lecturer, or on a blank one when passed null. */
  const openForm = (lecturer: LecturerAccount | null) => {
    setEditing(lecturer);
    setPicked(new Set());
    setFormOpen(true);
  };

  const toggle = (courseId: number) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });

  const onSubmit = handleSubmit((values) => {
    const parsed = schema.parse(values);
    save.mutate(
      // On an edit the service sends only the personal details: an existing
      // lecturer's load is changed on the allocations screen, which can also
      // withdraw a course.
      editing ? parsed : { ...parsed, courses: [...picked] },
      { onSuccess: () => setFormOpen(false) },
    );
  });

  const lecturers = data ?? [];
  const hasFilters = Boolean(debouncedSearch || active);

  return (
    <>
      <PageHeader
        title="Lecturers"
        description="Teaching staff. Adding one creates their account, emails a temporary password, and assigns the courses you tick."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => openForm(null)}>
            Add lecturer
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
              aria-label="Search lecturers"
              className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <Select
            aria-label="Filter by account state"
            value={active}
            onChange={(event) => setActive(event.target.value as "" | "true" | "false")}
          >
            <option value="">All accounts</option>
            <option value="true">Active only</option>
            <option value="false">Deactivated only</option>
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
                <Th>Lecturer</Th>
                <Th>Courses this semester</Th>
                <Th>Sign-in</Th>
                <Th>Account</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            {isPending ? (
              <TableSkeleton cols={5} />
            ) : (
              <tbody>
                {lecturers.length === 0 ? (
                  <tr>
                    <Td colSpan={5}>
                      <EmptyState
                        title={hasFilters ? "No matching lecturers" : "No lecturers yet"}
                        description={
                          hasFilters
                            ? "Try a different search or clear the filters."
                            : "Add a lecturer and pick the courses they teach in the same step."
                        }
                        icon={<UserPlus className="size-5" />}
                        action={
                          hasFilters ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSearch("");
                                setActive("");
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
                  lecturers.map((lecturer) => {
                    const load = loadByLecturer.get(lecturer.id) ?? [];
                    return (
                      <Tr key={lecturer.id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar name={lecturer.full_name} className="size-8" />
                            <div className="min-w-0">
                              <p className="font-medium text-ink-900">{lecturer.full_name}</p>
                              <p className="truncate text-xs text-ink-500">{lecturer.email}</p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          {load.length === 0 ? (
                            <span className="text-xs text-ink-500">No courses yet</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {load.map((code) => (
                                <Badge key={code} tone="info">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Td>
                        <Td>
                          {/* Until the emailed password is replaced, the account
                              cannot reach any portal screen — worth surfacing, as
                              it is the usual reason a new lecturer reports being
                              locked out. */}
                          {lecturer.must_change_password ? (
                            <Badge tone="warning">Password not set</Badge>
                          ) : lecturer.last_login ? (
                            <span className="text-xs text-ink-600">
                              Last in {new Date(lecturer.last_login).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-ink-500">Never signed in</span>
                          )}
                        </Td>
                        <Td>
                          {lecturer.is_active ? (
                            <Badge tone="success">Active</Badge>
                          ) : (
                            <Badge tone="danger">Deactivated</Badge>
                          )}
                        </Td>
                        <Td align="right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Resend a temporary password to ${lecturer.full_name}`}
                              title="Resend temporary password"
                              onClick={() => setPendingReset(lecturer)}
                            >
                              <KeyRound className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${lecturer.full_name}`}
                              onClick={() => openForm(lecturer)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            {lecturer.is_active ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Deactivate ${lecturer.full_name}`}
                                title="Deactivate account"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => setPendingDeactivate(lecturer)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Reactivate ${lecturer.full_name}`}
                                title="Reactivate account"
                                className="text-emerald-600 hover:bg-emerald-50"
                                loading={activate.isPending}
                                onClick={() => activate.mutate(lecturer.id)}
                              >
                                <UserCheck className="size-4" />
                              </Button>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            )}
          </TableWrap>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.full_name}` : "Add a lecturer"}
        size="lg"
        description={
          editing
            ? "Change their courses on the allocations screen."
            : "The account is created immediately and a temporary password is emailed to them."
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={save.isPending}>
              {editing ? "Save changes" : "Add lecturer"}
            </Button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <Select label="Title" error={errors.title?.message} {...register("title")}>
              {TITLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              label="Full name"
              placeholder="Ada Byron Lovelace"
              autoComplete="name"
              hint="First and last name, with any middle names between"
              error={errors.full_name?.message}
              {...register("full_name")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              placeholder="lecturer@nyenneh.edu"
              autoComplete="email"
              // The accounts API refuses a changed email, so the field is locked
              // rather than silently ignoring what was typed.
              disabled={Boolean(editing)}
              hint={
                editing
                  ? "The sign-in address cannot be changed"
                  : "The sign-in address, and where the temporary password is sent"
              }
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Phone"
              placeholder="+231 77 123 4567"
              hint="Optional"
              error={errors.phone_number?.message}
              {...register("phone_number")}
            />
          </div>

          {/* Courses are set here only when creating. Editing a load means being
              able to take a course away as well, which the allocations screen
              already does properly. */}
          {editing ? null : (
            <fieldset>
              <legend className="mb-2 flex w-full items-center justify-between border-b border-ink-200 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <span>Courses</span>
                <span className="font-normal normal-case tracking-normal text-ink-400">
                  {picked.size} selected
                </span>
              </legend>

              {!semester.data ? (
                <p className="py-3 text-sm text-ink-500">
                  No semester is marked current, so courses cannot be assigned yet. You
                  can still add the lecturer and allocate later.
                </p>
              ) : courses.isPending ? (
                <LoadingState />
              ) : courses.isError ? (
                <ErrorState
                  message={getErrorMessage(courses.error)}
                  onRetry={() => void courses.refetch()}
                />
              ) : assignable.length === 0 ? (
                <p className="py-3 text-sm text-ink-500">
                  No courses are taught in {semester.data.session_name}, semester{" "}
                  {semester.data.number}.
                </p>
              ) : (
                <>
                  <p className="mb-2 text-sm text-ink-500">
                    Tick every course this lecturer teaches in{" "}
                    {semester.data.session_name}, semester {semester.data.number}. Leave
                    them all clear to assign a load later.
                  </p>
                  <ul className="max-h-64 divide-y divide-ink-100 overflow-y-auto rounded-lg border border-ink-200">
                    {assignable.map((course) => (
                      <li key={course.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-ink-50",
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
                          {picked.has(course.id) ? (
                            <Badge tone="info">
                              <BookOpen className="mr-1 size-3" />
                              Teaching
                            </Badge>
                          ) : null}
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </fieldset>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDeactivate)}
        title="Deactivate this lecturer?"
        message={
          pendingDeactivate
            ? `${pendingDeactivate.full_name} will no longer be able to sign in. Their course allocations, marks and registers are kept, and you can reactivate the account later.`
            : ""
        }
        confirmLabel="Deactivate"
        loading={deactivate.isPending}
        onConfirm={() =>
          pendingDeactivate &&
          deactivate.mutate(pendingDeactivate.id, {
            onSuccess: () => setPendingDeactivate(null),
          })
        }
        onClose={() => setPendingDeactivate(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingReset)}
        title="Send a new temporary password?"
        message={
          pendingReset
            ? `A fresh temporary password will be emailed to ${pendingReset.email}. Their current password stops working immediately.`
            : ""
        }
        confirmLabel="Send password"
        loading={resendPassword.isPending}
        onConfirm={() =>
          pendingReset &&
          resendPassword.mutate(pendingReset.id, {
            onSuccess: () => setPendingReset(null),
          })
        }
        onClose={() => setPendingReset(null)}
      />
    </>
  );
}
