import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import {
  useDeleteDepartment,
  useDepartments,
  useFaculties,
  useSaveDepartment,
} from "@/hooks/useAcademics";
import { getErrorMessage } from "@/services/api";
import type { Department } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Enter the department name"),
  code: z
    .string()
    .min(2, "Enter a short code")
    .max(6, "Use at most 6 characters")
    .transform((value) => value.toUpperCase()),
  // a real relation on the server, not a name someone types in
  faculty: z.coerce.number().int().min(1, "Choose a faculty"),
  description: z.string(),
});

type DepartmentForm = z.input<typeof schema>;

const blank: DepartmentForm = { name: "", code: "", faculty: 0, description: "" };

export default function DepartmentsPage() {
  const { data, isPending, isError, error, refetch } = useDepartments();
  const faculties = useFaculties();
  const [editing, setEditing] = useState<Department | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Department | null>(null);

  const save = useSaveDepartment(editing?.id);
  const remove = useDeleteDepartment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentForm>({ resolver: zodResolver(schema), defaultValues: blank });

  // refill the form when the dialog opens on a different record
  useEffect(() => {
    if (!formOpen) return;
    reset(
      editing
        ? {
            name: editing.name,
            code: editing.code,
            faculty: editing.faculty,
            description: editing.description,
          }
        : { ...blank, faculty: faculties.data?.[0]?.id ?? 0 },
    );
  }, [formOpen, editing, reset, faculties.data]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditing(department);
    setFormOpen(true);
  };

  const onSubmit = handleSubmit((values) => {
    save.mutate(schema.parse(values), { onSuccess: () => setFormOpen(false) });
  });

  const departments = data ?? [];

  return (
    <>
      <PageHeader
        title="Departments"
        description="Faculties and departments students and courses belong to."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            New department
          </Button>
        }
      />

      <Card>
        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Department</Th>
                <Th>Faculty</Th>
                <Th align="right">Courses</Th>
                <Th align="right">Students</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            {isPending ? (
              <TableSkeleton cols={5} />
            ) : (
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <Td colSpan={5}>
                      <EmptyState
                        title="No departments yet"
                        description="Create a department before adding courses or students."
                        icon={<Building2 className="size-5" />}
                        action={
                          <Button size="sm" onClick={openCreate}>
                            New department
                          </Button>
                        }
                      />
                    </Td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <Tr key={department.id}>
                      <Td>
                        <p className="font-medium text-ink-900">{department.name}</p>
                        <p className="text-xs text-ink-500">{department.code}</p>
                      </Td>
                      <Td>{department.faculty_name}</Td>
                      <Td align="right" className="tabular-nums">
                        {department.course_count}
                      </Td>
                      <Td align="right" className="tabular-nums">
                        {department.student_count}
                      </Td>
                      <Td align="right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${department.name}`}
                            onClick={() => openEdit(department)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${department.name}`}
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setPendingDelete(department)}
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
        title={editing ? "Edit department" : "New department"}
        description="Departments group the course catalog and the student roster."
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={save.isPending}>
              {editing ? "Save changes" : "Create department"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Name"
            placeholder="Computer Science"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Code"
              placeholder="CSC"
              hint="Used to build roll numbers"
              error={errors.code?.message}
              {...register("code")}
            />
            <Select
              label="Faculty"
              error={errors.faculty?.message}
              {...register("faculty")}
            >
              <option value={0} disabled>
                Choose a faculty
              </option>
              {(faculties.data ?? []).map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </Select>
          </div>
          <Textarea
            label="Description"
            placeholder="What the department covers."
            hint="Optional"
            className="min-h-20"
            error={errors.description?.message}
            {...register("description")}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? ""}?`}
        message="This cannot be undone. Departments that still have courses attached cannot be deleted."
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
